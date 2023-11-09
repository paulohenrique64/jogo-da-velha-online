import { getOnlineUsers } from '../controllers/authController'
const path = require('path')

const onlineUsers = getOnlineUsers()

const getGamePage = (request, response) => {
  let finded = false

  onlineUsers.forEach((onlineUser) => {
    if (onlineUser.token == request.body.token) {
      finded = true
      const filePath = path.join(__dirname, '../view/game')
      response.status(200).render(filePath, {token: request.body.token})
    }
  })

  if (!finded) {
    response.status(400).redirect('/auth/login') 
  }
}

module.exports = {
  getGamePage,
}