import bcrypt from "bcryptjs";
import crypto from "crypto";
import mailer from "../models/mailer";
import jwt from "jsonwebtoken";
import {response} from "express";
import authConfig from '../config/auth';
import { decode } from "punycode";

const User = require("../models/user");
const path = require("path");

// gera um token de autenticação 
const generateAuthToken = (params) => {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
};

// gera um token para resetar a senha
const generateResetPasswordToken = () => {
  return crypto.randomBytes(20).toString("hex");
}

// renderiza a pagina de login
const loginPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/login");
  return res.status(200).render(filePath, { error: req.error });
};

// renderiza a pagina de registro
const registerPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/signup");
  return res.status(200).render(filePath);
};

// renderiza a pagina de esqueceu a senha
const forgotPasswordPage = (req, res) => {
  const filePath = path.join(__dirname, "../views/forgotPassword");
  return res.status(200).render(filePath);
}

// renderiza a pagina para troca se senha
const resetPasswordPage = (req, res) => {
  const resetPasswordToken = req.params.token;
  
  if (!resetPasswordToken) return res.redirect("/");

  const filePath = path.join(__dirname, "../views/resetPassword");
  return res.render(filePath, {resetPasswordToken});
}

// renderiza a pagina de configurações 
const getSettingsPage = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({ error: "acess denied" });

  jwt.verify(token, authConfig.secret, (err, decoded) => {
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

// retorna todos os usuarios do banco de dados
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

// recebe um token de autenticação e retorna os dados do dono do token
const getUser = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({error: "not authorized"});

  jwt.verify(token, authConfig.secret, (err, decoded) => {
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

// faz o login de um usuario
const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(401).send({error: "You must be inform a email and password for login"})

  User.findOne({ email })
    .select("+password")
    .then((user) => {

      if (!user) return res.status(401).send({error: "Invalid email"});

      bcrypt.compare(password, user.password).then((result) => {
        if (!result) return res.status(401).send({error: "Invalid password"});

        // se usuario for logado: gera um token de autenticação
        const token = generateAuthToken({ uid: user.id });

        // envia o token como cookie para nao precisar fazer login depois
        res.cookie("token", token, {
          maxAge: 3600000,
          httpOnly: true,
          secure: false,
        });

        // retorna status 201
        return res.status(201).send();
      })
      .catch(error => {
        console.log(error);
        return res.status(500).send({error: "Internal server error"});
      })
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send({error: "Internal server error"});
    });
};

// realiza o logout do usuario
const logoutUser = (req, res) => {
  /* limpa o campo token dos cookies do navegador do cliente
    e direciona o cliente para a homepage */
  res.clearCookie("token"); 
  return res.redirect("/");
};

// faz o registro de um usuario 
const registerUser = (req, res) => {
  const { nickname, email, password } = req.body;

  if (!nickname || !email || !password) return res.status(401).send({ error: "You must be inform nickname, email and password for register" });

  if (nickname.length < 3 || nickname.length > 15) {
    return res.status(401).send({
      error: "Your nickname must be higher than 3 caracters and less 15 caracters",
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

// criar token para reset de senha
const forgotPassword = (req, res) => {
  const {email} = req.body;

  if (!email) return res.status(401).send({error: "you must be inform a email"});

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
                from: "jogodavelhaonline@express.com",
                template: "auth/forgotPassword",
                subject: "Recuperação de senha",
                context: {token}
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

// rota para resetar a senha do usuario caso tenha um token de reset de senha valido
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


// verificar se o nickanme nao existe ainda

/* editar o nickname de um usuario
Descriptografa o token de autenticacao e so permite a edicao se
o descripted.id for o id de um admin ou se for igual ao id do usuario a ser editado.
Essas validações irão trazer segurança para esta função */
const editUserNickname = (req, res) => {
  const {id, nickname} = req.body;
  const token = req.cookies.token;

  if (!id || !nickname) 
    return res.status(401).send({error: "Your must be inform a id and nickname"});

  if (nickname.length < 3 || nickname.length > 15) 
    return res.status(401).send({error: "Your nickname must be higher than 3 caracters and less 15 caracters"});

  if (!token) 
    return res.status(401).send({error: "Not authorired"});

  jwt.verify(token, authConfig.secret, (err, decoded) => {

    if (err) return res.status(401).send({error: "Invalid token"});

    if (decoded) {

      // verificar se o id presente no token é de um admin
      User.findById(decoded.uid)
        .then(user => {
          if (user.isAdmin || decoded.uid === id) {
            User.findByIdAndUpdate(id, { $set: {nickname: nickname}})
              .then(updatedUser => {
                if (updatedUser) return res.status(200).send({message: "Nickname editado com sucesso"});
                else return res.status(400).send({error: "Invalid id"});
              })
              .catch(error => {
                console.log(error);
                return res.status(500).send({error: "Internal server error"});
              });
          } else {
            return res.status(401).send({error: "Not authorired"});
          }
        })
        .catch(error => {
          return res.status(500).send({error: "Internal server error"});
        })
    } else {
      return res.status(500).send({error: "Internal server error"});
    }
  })
}

// verificar se o email nao existe ainda

/*  editar o email de um usuario
Segue a mesma logica da funcao de editar o nickname */
const editUserEmail = (req, res) => {
  const {id, email} = req.body;
  const token = req.cookies.token;

  if (!id || !email) 
    return res.status(401).send({error: "Your must be inform a id and email"});

  // validar o email
  // if (nickname.length < 8 || nickname.length > 15) 
  //   return res.status(401).send({error: "Your nickname must be higher than 3 caracters and less 15 caracters"});

  if (!token) 
    return res.status(401).send({error: "Not authorired"});

  jwt.verify(token, authConfig.secret, (err, decoded) => {

    if (err) return res.status(401).send({error: "Invalid token"});

    if (decoded) {
      // verificar se o id presente no token é de um admin
      User.findById(decoded.uid)
        .then(user => {
          if (user.isAdmin || decoded.uid === id) {
            User.findByIdAndUpdate(id, { $set: {email: email}})
              .then(updatedUser => {
                if (updatedUser) return res.status(200).send({message: "Email editado com sucesso"});
                else return res.status(400).send({error: "Invalid id"});
              })
              .catch(() => {
                return res.status(500).send({error: "Internal server error"});
              })
          } else {
            return res.status(401).send({error: "Not authorired"});
          }
        })
        .catch(error => {
          return res.status(500).send({error: "Internal server error"});
        })
    } else {
      return res.status(500).send({error: "Internal server error"});
    }
  })
}

// editar a senha do usuario
const editUserPassword = (req, res) => {
  const {id, password} = req.body;
  const token = req.cookies.token;

  if (!id || !password) 
    return res.status(401).send({error: "Your must be inform a id and password"});

  if (password.length < 8) 
    return res.status(401).send({error: "Your password must be higher than 8 caracters"});

  if (!token) 
    return res.status(401).send({error: "Not authorired"});

  jwt.verify(token, authConfig.secret, (err, decoded) => {

    if (err) return res.status(401).send({error: "Invalid token"});

    if (decoded) {

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
                      return res.status(200).send({message: "Senha editada com sucesso"});
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
            return res.status(401).send({error: "Not authorired"});
          }
        })
        .catch(error => {
          return res.status(500).send({error: "Internal server error"});
        })
    } else {
      return res.status(500).send({error: "Internal server error"});
    }
  })
}

module.exports = {
  loginPage,
  registerPage,
  getSettingsPage,
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
