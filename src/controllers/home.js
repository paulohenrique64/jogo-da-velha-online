const path = require("path");

// exibe a tela de home
const getHomepage = (req, res) => {
  const filePath = path.join(__dirname, "../views/home");
  return res.render(filePath);
} 

module.exports = {
  getHomepage
}