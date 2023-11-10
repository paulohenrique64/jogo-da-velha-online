const express = require('express')
const router = express.Router()

import { loginPage } from '../controllers/authController.js'
import { loginUser } from '../controllers/authController.js'
import { registerPage } from '../controllers/authController.js'
import { registerUser } from '../controllers/authController.js'
import authMiddleware from '../middlewares/auth'

// exibe a tela de login
router.get('/login', loginPage)

// exibe a tela de registro
router.get('/register', registerPage)

// recebe dados de um usuario e cadastro-o no banco de dados
router.post('/login/user/', loginUser)

// recebe dados de um usuario e cadastro-o no banco de dados
router.post('/register/user/', registerUser)

module.exports = router