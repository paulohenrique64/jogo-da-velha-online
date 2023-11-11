import jwt from 'jsonwebtoken'
import authConfig from '../config/auth'

// verifica se o usario tem um token valido
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, 'sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848', (err, decoded) => {
      if (err) {
        res.redirect('/login')
      } else {
        return next();
      }
    })
  } else {
    res.redirect('/login')
  }
}

// verifica se o usuario nao tem um token válido
const noAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, 'sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848', (err, decoded) => {
      if (err) {
        return next();
      } else {
        return res.redirect('/game/')
      }
    })
  } else {
    return next();
  }
}

module.exports = {
  authMiddleware,
  noAuthMiddleware
}