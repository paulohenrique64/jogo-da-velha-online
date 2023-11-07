const express = require('express')
const router = express.Router()

import { loginPage } from '../controllers/authController.js'
import { loginUser } from '../controllers/authController.js'
import { registerPage } from '../controllers/authController.js'
import { registerUser } from '../controllers/authController.js'

// exibe a tela de login
router.get('/login', loginPage)

// recebe dados de um usuario e cadastro-o no banco de dados
router.post('/login/user/', loginUser)

// exibe a tela de registro
router.get('/register', registerPage)

// recebe dados de um usuario e cadastro-o no banco de dados
router.post('/register/user/', registerUser)

module.exports = router