import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';

const User = require("../models/user");

/* função middleware que só deixa passar clientes que
estejam autenticados */
const onlyAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect('/login');

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) return res.redirect('/login');
    else return next();
  })
}

/* função middleware que só deixa passar clientes que
não estejam autenticados */
const onlyGuest = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next();

  /* se já estiver autenticado
  o cliente é redirecionado para página do jogo */
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) return next();
    else return res.redirect('/game');
  })
}

/* função middleware que só deixa passar clientes
que estejam autenticados e que sejam admins */
const onlyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    } else {
      User.findById(decoded.uid) 
        .then((user) => {
          if (user) {
            if (user.isAdmin) return next();
            else return res.redirect('/login');
          } else {
            return res.redirect('/login');
          }
        })
        .catch((error) => {
          console.log(error);
          return res.redirect('/login');
        });
    }
  });
}

module.exports = {
  onlyAuth,
  onlyGuest,
  onlyAdmin
}