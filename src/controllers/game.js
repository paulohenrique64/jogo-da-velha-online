const path = require("path");

// renderiza a pagina do jogo
const getGamePage = (req, res) => {
  const filePath = path.join(__dirname, "../views/game");
  return res.render(filePath, { 
    baseUrl: process.env.BASE_URL, 
    baseUrlPath: process.env.BASE_URL_PATH 
  });
}

module.exports = {
  getGamePage, 
}