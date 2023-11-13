const User = require('../models/user');
const path = require('path');
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mailer from '../models/mailer';
import { response } from 'express';
import jwt from 'jsonwebtoken';
const authConfig = require('../config/auth')

const generateToken = params => {
  return jwt.sign(params, 'sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848',
    {
      expiresIn: 86400,
    },
  );
}

// retorna pagina de login
const loginPage = (req, res) => {
  const filePath = path.join(__dirname, '../views/login')
  return res.status(200).render(filePath, { error: req.error })
}

// faz o login se um usuario estiver cadastro valido no site 
const loginUser = (req, res) => {
  const {email, password} = req.body;

  if (email && password) {
    User.findOne({email}).select('+password').then(user => {
      if (user) {
        bcrypt.compare(password, user.password).then(result => {
          if (result) {
  
            // se usuario for logado: gera um token e redireciona para a pagina do jogo
            // o token pode ser capturado pela pagina
            const token = generateToken({uid: user.id})
            const filePath = path.join(__dirname, '../views/game')
            user.password = undefined
  
            // envia o token como cookie para nao precisar fazer login depois
            res.cookie('token', token, { maxAge: 3600000, httpOnly: true, secure: false});
            return res.status(201).redirect('/game')
          } else {
            // password invalida
            return res.redirect('/login')
          }
        })
      } else {
        // email invalido
        return res.redirect('/login')
      }
    }).catch(error => {
      // internal server error
      console.error(error)
      return res.redirect('/login')
    })
  } else {
    // solicitacao invalida, sem email e senha
    return res.redirect('/login')
  }
}

// retorna a pagina de registro
const registerPage = (req, res) => {
  const filePath = path.join(__dirname, '../views/signup')
  return res.status(200).render(filePath)
}

// faz o registro de um usuario no site 
const registerUser = (req, res) => {
  const {nickname, email, password} = req.body;

  if (nickname.length < 3) {
    return res.status(401).send({error: 'Your nickname must be higher or equal than 3 caracters'})
  }

  if (password.length < 8) {
    return res.status(401).send({error: 'Your password must be higher or equal than 8 caracters'})
  }

  User.findOne({email}).then(userFoundByEmail => {
    if (userFoundByEmail) {
      return res.status(401).send({error: 'Email already registred'});
    } else {
      User.findOne({nickname}).then(userFoundByNickname => {

        if (userFoundByNickname) {
          return res.status(401).send({error: 'Nickname already registred'});
        } else {
          User.create({nickname, email, password}).then(userCreated => {
            return res.status(201).send({message: 'Usuário registrado com sucesso'});
          }).catch(error => {
            console.error('Erro ao salvar usuario: ', error);
            return res.status(401).send({error: 'Registration failed'});
          })
        }

      }).catch(error => {
        console.error('Erro ao consultar o banco de dados', error);
        return res.status(500).send({error: 'Registration failed'})
      })
    }
  }).catch(error => {
    console.error('Erro ao consultar o banco de dados', error);
    return res.status(500).send({error: 'Registration failed'})
  })
}

const forgotPassword = (req, res) => {
  const {email} = req.body;

  // procurar usuario com o email no banco de dados
  User.findOne({email}).then(user => {

    // caso o usuario seja encontrado
    if (user) {

      // cria um token de recuperacao de senha com data de expiração
      const token = crypto.randomBytes(20).toString('hex');
      const expiration = new Date();
      expiration.setHours(new Date().getHours() + 1); // 1 hora de validade

      // procura o usuario para salvar o token de recuperacao no banco de dados
      User.findByIdAndUpdate(user.id, {
        $set: {
          passwordResetToken: token,
          passwordResetTokenExpiration: expiration
        }
      }).then(() => {
        mailer.sendMail({
          to: email,
          from: 'jogodavelhaonline@express.com',
          template: 'auth/forgotPassword',
          context: { token },
        }).then(() => {

          // email enviado
          return res.status(200).send({message: 'email send to email'});
        }).catch(error => {

          // email nao enviado
          console.log(error);
          return res.status(400).send({error: 'sent mail error'})
        })
      })// faltando um catch aquiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii

    } else {

      // usuario com o email recebido nao existe na base de dados
      return res.status(400).send({error: 'Invalid email'})
    }

  }).catch(error => {

    // erro na consulta ao banco de dados
    console.log(error);
    return response.status(500).send({error: 'Internal server error'})
  })
}

const resetPassword = (req, res) => {
  const {email, token, newPassword} = req.body;

  User.findOne({email})
  .select('+passwordResetToken passwordResetTokenExpiration')
  .then(user => {

    if (user) {
      if (token != user.passwordResetToken || new Date().now > user.passwordResetTokenExpiration) {
        return res.status(400).send({error: 'Ivalid token'})
      } else {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiration = undefined;
        user.password = newPassword;

        user.save().then(() => {
          res.status(200).send({message: 'Senha trocada com sucesso'});

          
        }).catch(error => {
          return res.status(500).send({error: 'erro ao salvar senha do usuario'});
        })
      }
    }
  }).catch(error => {

    // erro na consulta ao banco de dados
    console.log(error);
    return response.status(500).send({error: 'Internal server error'})
  })
}

const logoutUser = (req, res) => {
  res.clearCookie('token') // limpa o campo token dos cookies do cliente
  return res.redirect('/') // direciona o cliente para a homepage
}

module.exports = {
  loginUser,
  loginPage,
  registerPage,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
}
