import bcrypt from "bcryptjs";
import crypto from "crypto";
import mailer from "../models/mailer";
import jwt from "jsonwebtoken";
import { response } from "express";

const User = require("../models/user");
const path = require("path");
const authConfig = require("../config/auth");

// gera um token de autenticação aleatório
const generateToken = (params) => {
  return jwt.sign(params, "sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848", {
    expiresIn: 86400,
  });
};

// retorna pagina de login
const loginPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/login");
  return res.status(200).render(filePath, { error: req.error });
};

// retorna a pagina de registro
const registerPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/signup");
  return res.status(200).render(filePath);
};

const forgotPasswordPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/forgotPassword");
  return res.status(200).render(filePath);
}

const resetPasswordPage = (req, res) => {
  const resetPasswordToken = req.params.token;
  
  if (!resetPasswordToken) return res.redirect("/");

  const filePath = path.join(__dirname, "../views/resetPassword");
  return res.render(filePath, {resetPasswordToken});
}

// realiza o logout do usuario
const logoutUser = (req, res) => {
  res.clearCookie("token"); // limpa o campo token dos cookies do cliente
  return res.redirect("/"); // direciona o cliente para a homepage
};

const getSettingsPage = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({ error: "acess denied" });

  jwt.verify(
    token,
    "sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848",
    (err, decoded) => {
      if (err) {
        return res.status(500).send({ error: "internal server error" });
      } else {
        User.findById(decoded.uid)
          .then((user) => {
            if (user) {
              if (user.isAdmin) {
                const filePath = path.join(__dirname, "../views/admin_settings");
                return res.render(filePath); // renderizo a pagina de settings para admins
              } else {
                const filePath = path.join(__dirname, "../views/user_settings");
                return res.render(filePath); // renderizo a pagina de settings para users normais
              }
            } else {
              return res.status(401).send({ error: "acess denied" });
            }
          })
          .catch((error) => {
            console.log(error);
            return res.status(500).send({ error: "internal server error" });
          });
      }
    }
  );
};

const getUsers = (req, res) => {
  User.find({})
    .then(users => {
      return res.status(200).send({users});
    })
    .catch(error => {
      console.log(error);
      return res.status(500).send({ error: "internal server error" });
    })
}

const getUser = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({error: "not authorized"});

  jwt.verify(token, "sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848", (err, decoded) => {
    if (err) return res.status(500).send({error: "internal server error"});

    User.findById(decoded.uid)
      .then(user => {
        if (user) return res.status(200).send({user});
        else return res.status(401).send({error: "not authorized"});
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "internal server error"});
      })
  })
    
}

// faz o login se um usuario estiver cadastro valido no site
const loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.redirect("/login");

  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) return res.redirect("/login");

      bcrypt.compare(password, user.password).then((result) => {
        if (!result) return res.redirect("/login");

        // se usuario for logado: gera um token e redireciona para a pagina do jogo
        // o token pode ser capturado pela pagina
        const token = generateToken({ uid: user.id });
        // envia o token como cookie para nao precisar fazer login depois
        res.cookie("token", token, {
          maxAge: 3600000,
          httpOnly: true,
          secure: false,
        });

        return res.status(201).redirect("/game");
      })
      .catch(error => {
        console.log(error);
        return res.redirect("/login");
      })
    })
    .catch((error) => {
      // internal server error
      console.error(error);
      return res.redirect("/login");
    });
};

// faz o registro de um usuario no site
const registerUser = (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) return res.status(401).send({ error: "You must be inform nickname, email and password for register" });

  if (nickname.length < 3) {
    return res.status(401).send({
      error: "Your nickname must be higher or equal than 3 caracters",
    });
  }

  if (password.length < 8) {
    return res.status(401).send({
      error: "Your password must be higher or equal than 8 caracters",
    });
  }

  User.findOne({ email })
    .then((userFoundByEmail) => {
      if (userFoundByEmail) {
        return res.status(401).send({ error: "Email already registred" });
      } else {
        User.findOne({ nickname })
          .then((userFoundByNickname) => {
            if (userFoundByNickname) {
              return res
                .status(401)
                .send({ error: "Nickname already registred" });
            } else {
              User.create({ nickname, email, password })
                .then((userCreated) => {
                  return res
                    .status(201)
                    .send({ message: "Usuário registrado com sucesso" });
                })
                .catch((error) => {
                  console.error("Erro ao salvar usuario: ", error);
                  return res.status(401).send({ error: "Registration failed" });
                });
            }
          })
          .catch((error) => {
            console.error("Erro ao consultar o banco de dados", error);
            return res.status(500).send({ error: "Registration failed" });
          });
      }
    })
    .catch((error) => {
      console.error("Erro ao consultar o banco de dados", error);
      return res.status(500).send({ error: "Registration failed" });
    });
};

// criar token de atualização de senha
const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(401).send({error: "you must be inform a email"});

  // procurar usuario com o email no banco de dados
  User.findOne({ email })
    .then((user) => {
      // caso o usuario seja encontrado
      if (user) {
        // cria um token de recuperacao de senha com data de expiração
        const token = crypto.randomBytes(20).toString("hex");
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
            mailer
              .sendMail({
                to: email,
                from: "jogodavelhaonline@express.com",
                template: "auth/forgotPassword",
                context: { token },
              })
              .then(() => {
                // email enviado
                return res.status(200).send({ message: "verify your email box" });
              })
              .catch((error) => {
                // email nao enviado
                console.log(error);
                return res.status(400).send({ error: "sent mail error" });
              });
          })
          .catch((error) => {
            return res.status(500).send({ error: "Internal server error" });
          });
      } else {
        // usuario com o email recebido nao existe na base de dados
        return res.status(400).send({ error: "Invalid email" });
      }
    })
    .catch((error) => {
      // erro na consulta ao banco de dados
      console.log(error);
      return response.status(500).send({ error: "Internal server error" });
    });
};

// rota para resetar a senha do usuario caso tenha um token valido
const resetPassword = (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  if (!token || !newPassword) return res.status(401).send({error: "you must be inform a token and password"})

  User.findOne({ passwordResetToken: token })
    .select("+passwordResetToken passwordResetTokenExpiration")
    .then((user) => {
      if (user) {
        if (new Date().now > user.passwordResetTokenExpiration) {
          return res.status(400).send({ error: "Invalid token" });
        } else {
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpiration = undefined;
          user.password = newPassword;

          user
            .save()
            .then(() => {
              res.status(200).send({ message: "Senha trocada com sucesso" });
            })
            .catch((error) => {
              return res
                .status(500)
                .send({ error: "erro ao salvar senha do usuario" });
            });
        }
      } else {
        return res.status(400).send({ error: "Invalid token" });
      }
    })
    .catch((error) => {
      // erro na consulta ao banco de dados
      console.log(error);
      return response.status(500).send({ error: "Internal server error" });
    });
};

// rota para deletar um usuario
const deleteUser = (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).send({ error: "you must be inform a id" });

  User.findByIdAndDelete(id)
    .then((user) => {
      if (user)
        return res.status(201).send({ message: `user deleted` });
      else return res.status(400).send({ error: `invalid id` });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({ error: "internal server error" });
    });
};

// editar usuario (só pode ser utilizada pelo admin)
const editUser = (req, res) => {
  const { id, nickname, email, password } = req.body;

  if (!id || !nickname || !email || !password) return res.status(400).send({ error: "you must be inform nickname, email and password for edit a user" });

  User.findById(id)
    .then(user => {
      if (!user) return res.status(400).send({ error: `invalid id` });

      user.nickname = nickname;
      user.email = email;
      user.password = password;

      user.save()
        .then(() => {
          return res.status(200).send({message: "usuario editado com sucesso!"});
        })
        .catch(error => {
          console.log(error);
          return res.status(500).send({ error: "Internal server error" });
        })

    })
    .catch(error => {
      console.log(error);
      return res.status(500).send({ error: "Internal server error" });
    })
};

module.exports = {
  loginUser,
  loginPage,
  registerPage,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  deleteUser,
  editUser,
  getSettingsPage,
  getUsers,
  getUser,
  forgotPasswordPage,
  resetPasswordPage
};
