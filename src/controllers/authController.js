const User = require('../models/userSchema')
const path = require('path')

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
    if (userFinded[0].password == request.body.password) {

      let tk = 100

      const onlineUser = {
        user: userFinded[0],    
        token: tk,
      }

      onlineUsers.push(onlineUser)

      response.status(200).redirect('http://localhost:3000/game/' + tk)
    } else {
      response.status(404).redirect('/auth/login')
    }
  }).catch((error) => {
    console.log(error)
    response.status(404).redirect('/auth/login')
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
