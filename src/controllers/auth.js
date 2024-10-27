import bcrypt from "bcryptjs";
import crypto from "crypto";
import mailer from "../models/mailer";
import jwt from "jsonwebtoken";
import {response} from "express";

require("dotenv").config();

const User = require("../models/user");
const path = require("path");

// gera um token de autenticação 
const generateAuthToken = (params) => {
  return jwt.sign(params, process.env.JWT_SECRET, {expiresIn: 86400});
}

// gera um token para resetar a senha
const generateResetPasswordToken = () => {
  return crypto.randomBytes(20).toString("hex");
}

// renderiza a pagina de login
const loginPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/login");
  return res.render(filePath, { baseUrl: process.env.BASE_URL });
}

// renderiza a pagina de registro
const registerPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/signup");
  return res.render(filePath, { baseUrl: process.env.BASE_URL });
}

// renderiza a pagina de esqueceu a senha
const forgotPasswordPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/forgotPassword");
  return res.render(filePath, { baseUrl: process.env.BASE_URL });
}

// renderiza a pagina para troca de senha
const resetPasswordPage = (req, res) => {
  const resetPasswordToken = req.params.token;
  if (!resetPasswordToken) return res.redirect("/");

  const filePath = path.join(__dirname, "../views/resetPassword");
  return res.render(filePath, {resetPasswordToken, baseUrl: process.env.BASE_URL });
}

// renderiza a pagina de settings para admins
const getAdminSettingsPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/adminSettings");
  return res.render(filePath, { baseUrl: process.env.BASE_URL }); 
}

// renderiza a pagina de settings para usuarios normais
const getSettingsPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/settings");
  return res.render(filePath, { baseUrl: process.env.BASE_URL }); 
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

  if (nickname.length < 3 || nickname.length > 20) 
    return res.status(401).send({error: "The nickname must be between 3 and 20 characters"});

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
  
  return res.redirect('/');
};

// faz o registro de um usuario 
const registerUser = (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) return res.status(401).send({ error: "You need to enter a nickname, email and password to register" });

  if (nickname.length < 3 || nickname.length > 15) {
    return res.status(401).send({
      error: "Your nickname must be more than 3 characters and less than 15 characters",
    });
  }

  if (password.length < 8) {
    return res.status(401).send({
      error: "Your password must be greater than or equal to 8 characters",
    });
  }

  User.findOne({ email })
    .then((userFoundByEmail) => {
      if (userFoundByEmail) {
        return res.status(401).send({ error: "Email already registered" });
      } else {
        User.findOne({ nickname })
          .then((userFoundByNickname) => {
            if (userFoundByNickname) {
              return res
                .status(401)
                .send({ error: "Nickname already registered" });
            } else {
              User.create({nickname, email, password})
                .then(() => {
                  return res.status(201).send({message: "User registered successfully"});
                })
                .catch((error) => {
                  console.error(error);
                  return res.status(401).send({error: "Registration failed"});
                });
            }
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).send({error: "Internal server error"});
          });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send({error: "Internal server error"});
    });
};

// criar token para reset de senha
const forgotPassword = (req, res) => {
  const {email} = req.body;

  if (!email) return res.status(401).send({error: "You need to provide an email for recover password"});

  // procurar usuario com o email no banco de dados
  User.findOne({ email })
    .then((user) => {
      // caso o usuario seja encontrado
      if (user) {
        // cria um token de recuperacao de senha com data de expiração
        const token = generateResetPasswordToken();
        const expiration = new Date();
        expiration.setHours(new Date().getHours() + 1); // 1 hora de validade
 
        // procura o usuario para salvar o token de recuperacao no banco de dados
        User.findByIdAndUpdate(user.id, {
          $set: {
            passwordResetToken: token,
            passwordResetTokenExpiration: expiration,
          },
        })
          .then(() => {
            // usuario quer trocar a senha
            mailer.sendMail({
                to: email,
                from: "jogodavelha@express.com",
                template: "auth/forgotPassword",
                subject: "Recuperação de senha",
                context: {url: process.env.MAILER_MAIL_URL, token}
              })
              .then(() => {
                // email enviado
                return res.status(200).send({message: "Verify your email box"});
              })
              .catch((error) => {
                // email nao enviado
                console.log(error);
                return res.status(400).send({error: "Sent mail error"});
              });
          })
          .catch((error) => {
            return res.status(500).send({error: "Internal server error"});
          });
      } else {
        // usuario com o email recebido nao existe na base de dados
        return res.status(400).send({error: "Invalid email"});
      }
    })
    .catch((error) => {
      // erro na consulta ao banco de dados
      console.log(error);
      return response.status(500).send({error: "Internal server error"});
    });
};

// rota para resetar a senha do usuario caso tenha um token de reset de senha valido
const resetPassword = (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  if (!token || !newPassword) return res.status(401).send({error: "You must provide a token and password for reset password"})

  User.findOne({ passwordResetToken: token })
    .select("+passwordResetToken passwordResetTokenExpiration")
    .then((user) => {
      if (user) {
        if (new Date().now > user.passwordResetTokenExpiration) {
          return res.status(400).send({error: "Invalid token"});
        } else {
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpiration = undefined;
          user.password = newPassword;

          user.save()
            .then(() => {
              res.status(200).send({message: "Password changed successfully"});
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).send({error: "Internal server error"});
            });
        }
      } else {
        return res.status(400).send({error: "Invalid token"});
      }
    })
    .catch((error) => {
      // erro na consulta ao banco de dados
      console.log(error);
      return response.status(500).send({error: "Internal server error"});
    });
};

/* deletar um usuario
Descriptografa o token de autenticacao e so permite a remoção se
o descripted.id for o id de um admin ou se for igual ao id do usuario a ser deletado */
const deleteUser = (req, res) => {
  const {id} = req.params;
  const token = req.cookies.token;

  if (!id) return res.status(400).send({error: "You must provide an id for delete user"});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err || !decoded) return res.status(401).send({error: "Invalid token"});

    User.findById(decoded.uid)
      .then(user => {

        if (user.isAdmin || decoded.uid === id) {

          User.findByIdAndDelete(id)
            .then((user) => {
              if (user) {
                if (decoded.uid === id) res.clearCookie("token");
                return res.status(201).send({message: "User deleted"});
              } else {
                return res.status(400).send({error: "Invalid id"});
              }
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).send({error: "Internal server error"});
            });
          
        } else {
          return res.status(401).send({error: "Not authorized"});
        }

      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "Internal server error"});
      })
  })
};

/* editar o nickname de um usuario
Descriptografa o token de autenticacao e so permite a edicao se
o descripted.id for o id de um admin ou se for igual ao id do usuario a ser editado */
const editUserNickname = (req, res) => {
  const {id, nickname} = req.body;
  const token = req.cookies.token;

  if (!id || !nickname) 
    return res.status(401).send({error: "Your must provide an id and nickname for edit nickname"});

  if (nickname.length < 3 || nickname.length > 15) 
    return res.status(401).send({error: "Your nickname must be higher than 3 caracters and less 15 caracters"});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err || !decoded) return res.status(401).send({error: "Invalid token"});

    User.findById(decoded.uid)
      .then(user => {

        if (user.isAdmin || decoded.uid === id) {
          User.findByIdAndUpdate(id, { $set: {nickname: nickname}})
            .then(updatedUser => {
              if (updatedUser) return res.status(200).send({message: "Nickname edited successfully"});
              else return res.status(401).send({error: "Invalid id"});
            })
            .catch(error => {
              console.log(error);
              return res.status(500).send({error: "Internal server error"});
            });
        } else {
          return res.status(401).send({error: "Not authorized"});
        }

      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "Internal server error"});
      })
  })
}

/*  editar o email de um usuario
Segue a mesma logica da funcao de editar o nickname */
const editUserEmail = (req, res) => {
  const {id, email} = req.body;
  const token = req.cookies.token;

  if (!id || !email) 
    return res.status(401).send({error: "Your must provide an id and email for edit email"});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err || !decoded) return res.status(401).send({error: "Invalid token"});

    User.findById(decoded.uid)
      .then(user => {

        if (user.isAdmin || decoded.uid === id) {
          User.findByIdAndUpdate(id, { $set: {email: email}})
            .then(updatedUser => {
              if (updatedUser) return res.status(200).send({message: "Email edited successfully"});
              else return res.status(401).send({error: "Invalid id"});
            })
            .catch(() => {
              return res.status(500).send({error: "Internal server error"});
            })

        } else {
          return res.status(401).send({error: "Not authorized"});
        }
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "Internal server error"});
      })
  })
}

/*  editar a senha de um usuario
Segue a mesma logica da funcao de editar o nickname */
const editUserPassword = (req, res) => {
  const {id, password} = req.body;
  const token = req.cookies.token;

  if (!id || !password) 
    return res.status(401).send({error: "Your must provide an id and password for edit password"});

  if (password.length < 8) 
    return res.status(401).send({error: "Your password must be higher than or equals 8 caracters"});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err || !decoded) return res.status(401).send({error: "Invalid token"});

    // verificar se o id presente no token é de um admin
    User.findById(decoded.uid)
      .then(user => {
        if (user.isAdmin || decoded.uid === id) {
          
          // buscar usuario pelo id e editar a senha com o metodo save()
          User.findById(id)
            .then(user => {

              if (user) {
                user.password = password;
              
                user.save()
                  .then(() => {
                    return res.status(200).send({message: "Password edited successfully"});
                  })
                  .catch(error => {
                    console.log(error);
                    return res.status(500).send({ error: "Internal server error" });
                  })
              } else {
                return res.status(400).send({error: "Invalid id"});
              }

            })
            .catch(error => {
              console.log(error);
              return res.status(500).send({ error: "Internal server error" });
            })

        } else {
          return res.status(401).send({error: "Not authorized"});
        }
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "Internal server error"});
      })
  })
}

module.exports = {
  loginPage,
  registerPage,
  getSettingsPage,
  getAdminSettingsPage,
  forgotPasswordPage,
  resetPasswordPage,
  loginUser,
  registerUser,
  logoutUser,
  deleteUser,
  getUsers,
  getUser,
  editUserNickname,
  editUserEmail,
  editUserPassword,
  forgotPassword,
  resetPassword
};
