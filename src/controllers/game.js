const path = require('path');

// renderiza a pagina do jogo
const getGamePage = (req, res) => {
  const filePath = path.join(__dirname, '../views/game');
  return res.status(200).render(filePath);
}

module.exports = {
  getGamePage, 
}