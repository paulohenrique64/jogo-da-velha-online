const path = require("path");

// exibe a tela de home
const getHomepage = (req, res) => {
  const filePath = path.join(__dirname, "../views/home");
  return res.render(filePath, { baseUrl: process.env.BASE_URL });
} 

module.exports = {
  getHomepage
}