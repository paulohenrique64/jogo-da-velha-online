const express = require('express')
const router = express.Router()

import { authMiddleware } from '../middlewares/auth'
import { getGamePage } from '../controllers/gameController'

// exibe a game page se o usuario enviar um token
router.get('/', authMiddleware, getGamePage); // request.uid;

module.exports = router