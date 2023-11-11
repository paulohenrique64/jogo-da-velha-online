const express = require('express')
const router = express.Router()

// exibe a tela de home
const getHomepage = (req, res) => {
  return res.render('home');
} 

module.exports = {
  getHomepage
}