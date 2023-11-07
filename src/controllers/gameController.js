import { getOnlineUsers } from '../controllers/authController'
const path = require('path')

const onlineUsers = getOnlineUsers()

const getGamePage = (request, response) => {
  let finded = false

  onlineUsers.forEach((onlineUser) => {
    if (onlineUser.token == request.params.token) {
      finded = true
      const filePath = path.join(__dirname, '../view/game.html')
      response.status(200).sendFile(filePath)
    }
  })

  if (!finded) {
    response.status(400).redirect('/auth/login') 
  }
}

module.exports = {
  getGamePage,
}