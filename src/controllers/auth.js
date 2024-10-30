import jwt from "jsonwebtoken";

require("dotenv").config();

const User = require("../models/user");
const path = require("path");

// gera um token de autenticação 
const generateAuthToken = (params) => {
  return jwt.sign(params, process.env.JWT_SECRET, {expiresIn: 86400});
}

// retorna todos os usuarios do banco de dados
const getUsers = (req, res) => {
  User.find({})
    .then(users => {
      return res.status(200).send({users});
    })
    .catch(error => {
      console.log(error);
      return res.status(500).send({error: "Internal server error"});
    });
}

// recebe um token de autenticação e retorna os dados do dono do token
const getUser = (req, res) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) 
      return res.status(500).send({error: "Internal server error"});

    if (!decoded) 
      return res.status(401).send({error: "Not authorized"});

    User.findById(decoded.uid)
      .then(user => {
        if (user) 
          return res.status(200).send({user});
        else 
          return res.status(401).send({error: "Not authorized"});
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "Internal server error"});
      })
  })
}

// faz o login de um usuario
const loginUser = (req, res) => {
  let { nickname } = req.body;
  let token = undefined;

  nickname = nickname.toLowerCase();

  if (nickname.length < 3 || nickname.length > 15 || nickname === "robot") 
    return res.status(401).send({error: "The nickname must be between 3 and 15 characters"});

  User.findOne({nickname})
    .then((user) => {

      if (!user) {     
        // create a new user
        User.create({nickname})
          .then((userCreated) => {
            console.log(`Created new user with nickname ${nickname} and id ${userCreated.id}`);

            token = generateAuthToken({ uid: userCreated.id });

            // envia o token como cookie para nao precisar fazer login depois
            res.cookie("token", token, {
              maxAge: 3600000,
              httpOnly: true,
              secure: false,
              sameSite: 'strict',
            });

            // retorna status 201
            return res.status(201).send({message: "Logged in successfully"});
          })
          .catch((error) => {         
            console.log(error);
            return res.status(500).send({error: "Internal server error"});
          })  
      } else {
        token = generateAuthToken({ uid: user.id });

        // envia o token como cookie para nao precisar fazer login depois
        res.cookie("token", token, {
          maxAge: 3600000,
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        });
        
        // retorna status 201
        return res.status(201).send({message: "Logged in successfully"});
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({error: "Internal server error"});
    })
};

// realiza o logout do usuario
const logoutUser = (req, res) => {
  /* limpa o campo token dos cookies do navegador do cliente
    e direciona o cliente para a homepage */
  res.clearCookie("token"); 
  
  return res.redirect(process.env.BASE_URL_PATH);
};

module.exports = {
  loginUser,
  logoutUser,
  getUsers,
  getUser,
};
