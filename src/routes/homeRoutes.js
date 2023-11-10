const express = require('express')
const router = express.Router()

// exibe a tela de login
router.get('/', (request, response) => {
  response.status(200).render('home')
})

module.exports = router