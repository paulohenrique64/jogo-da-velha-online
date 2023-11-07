const express = require('express')
const router = express.Router()

import { getGamePage } from '../controllers/gameController.js'

// exibe o jogo
router.get('/:token', getGamePage)

module.exports = router

