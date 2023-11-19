import jwt from 'jsonwebtoken'
const User = require("../models/user");
import authConfig from '../config/auth'

// verifica se o usario tem um token valido
const onlyAuth = (req, res, next) => {
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
const onlyGuest = (req, res, next) => {
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

// verifica se o usuario é um admin
const onlyAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect('/login');

  jwt.verify(
    token,
    "sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848",
    (err, decoded) => {
      if (err) {
        return res.redirect('/game');
      } else {
        User.findById(decoded.uid)
          .then((user) => {
            if (user) {
              if (user.isAdmin) {
                return next();
              } else {
                return res.redirect('/game');
              }
            } else {
              return res.redirect('/game');
            }
          })
          .catch((error) => {
            console.log(error);
            return res.redirect('/game');
          });
      }
    }
  );
}

module.exports = {
  onlyAuth,
  onlyGuest,
  onlyAdmin
}