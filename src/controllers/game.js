const path = require("path");

// renderiza a pagina do jogo
const getGamePage = (req, res) => {
  const filePath = path.join(__dirname, "../views/game");
  return res.render(filePath, { baseUrl: process.env.BASE_URL });
}

module.exports = {
  getGamePage, 
}