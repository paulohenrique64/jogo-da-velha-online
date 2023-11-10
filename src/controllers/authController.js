const User = require('../models/userSchema');
const path = require('path');
import bcrypt from 'bcryptjs';
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
const loginPage = (request, response) => {
  const filePath = path.join(__dirname, '../views/login')
  response.status(200).render(filePath, { error: request.error })
  console.log(request.error)
}

// faz o login se um usuario estiver cadastro valido no site 
const loginUser = (request, response) => {
  const {email, password} = request.body;

  User.findOne({email}).select('+password').then(user => {
    if (user) {
      bcrypt.compare(password, user.password).then(result => {
        if (result) {

          // se usuario for logado: gera um token e redireciona para a pagina do jogo
          // o token pode ser capturado pela pagina
          const token = generateToken({uid: user.id})
          const filePath = path.join(__dirname, '../views/game')
          user.password = undefined
          response.status(200).render(filePath, {userdata: user, token: token})

        } else {
          request.error = 'invalid password'
          response.status(400).redirect('/auth/login')
        }
      })
    } else {
      request.error = 'Invalid email'
      response.status(400).redirect('/auth/login')
    }

  }).catch(error => {
    console.error(error)
    request.error = 'Internal server error'
    response.status(500).redirect('/auth/login')
  })
}

// retorna a pagina de registro
const registerPage = (request, response) => {
  const filePath = path.join(__dirname, '../views/signup')
  response.status(200).render(filePath)
}

// faz o registro de um usuario no site 
const registerUser = (request, response) => {
  const {name, nickname, email, password} = request.body;

  if (password.length < 8) {
    response.status(400).send({error: 'Your password must be higher or equal than 8 caracters'})
  }

  User.findOne({email}).then(userFoundByEmail => {
    if (userFoundByEmail) {
      response.status(400).send({error: 'Email already registred'});
    } else {
      User.findOne({nickname}).then(userFoundByNickname => {
        if (userFoundByNickname) {
          response.status(400).send({error: 'Nickname already registred'});
        } else {
          User.create({name, nickname, email, password}).then(userCreated => {
            response.status(200).send({message: 'Usuário registrado com sucesso'});
          }).catch(error => {
            console.error('Erro ao salvar usuario: ', error);
            response.status(400).send({error: 'Registration failed'});
          })
        }
      }).catch(error => {
        console.error('Erro ao consultar o banco de dados', error);
        response.status(500).send({error: 'Registration failed'})
      })
    }
  }).catch(error => {
    console.error('Erro ao consultar o banco de dados', error);
    response.status(500).send({error: 'Registration failed'})
  })
}

module.exports = {
  loginUser,
  loginPage,
  registerPage,
  registerUser,
}
