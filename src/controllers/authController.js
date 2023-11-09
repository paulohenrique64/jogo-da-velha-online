const User = require('../models/userSchema')
const path = require('path')
const crypto = require('crypto')

const onlineUsers = []

// retorna pagina de login
const loginPage = (request, response) => {
  const filePath = path.join(__dirname, '../view/login.html')
  response.status(200).sendFile(filePath)
}

// faz o login se um usuario no site 
const loginUser = (request, response) => {

  const user = {
    email: request.body.email,
    password: request.body.password,
  }

  User.find({
    'email': user.email,
    'password': user.password,
  }).then((userFinded) => {

    if (userFinded[0].password == user.password) {
            
      const onlineUser = {
        user: userFinded[0],  // poderia ser user data   
        token: crypto.randomBytes(64).toString('hex')
      }

      onlineUsers.push(onlineUser)

      const filePath = path.join(__dirname, '../view/game')
      response.status(200).render(filePath, {token: onlineUser.token, nickname: onlineUser.user.nickname})

    } else {
      // login nao aceito
      response.status(400).redirect('/auth/login')
    }

  }).catch(() => {

    // falha na requisição ao banco de dados
    response.status(400).redirect('/auth/login')

  })
}

// retorna a pagina de registro
const registerPage = (request, response) => {
  const filePath = path.join(__dirname, '../view/signup.html')
  response.status(200).sendFile(filePath)
}

// faz o registro de um usuario no site 
const registerUser = (request, response) => {
  const user = new User ({
    name: request.body.name,
    nickname: request.body.nickname,
    email: request.body.email,
    password: request.body.password,
  })

  user.save().then(() => {
    console.log("user saved")
    response.status(200).json({message: "User registred sucess!"})
  }).catch(() => {
    console.log("user not saved")
    response.status(400).json({message: "Error! User not registred sucess!"})
  })
}

function getOnlineUsers() {
  return onlineUsers
}

module.exports = {
  loginUser,
  loginPage,
  registerPage,
  registerUser,
  getOnlineUsers,
}
