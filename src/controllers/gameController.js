const path = require('path')

const getGamePage = (request, response) => {
  const filePath = path.join(__dirname, '../views/game')
  response.status(200).render(filePath, {uid: request.uid})
}

module.exports = {
  getGamePage,
}