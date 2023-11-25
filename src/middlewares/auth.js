import jwt from 'jsonwebtoken';

const User = require("../models/user");
require("dotenv").config();

/* função middleware que só deixa passar clientes que
estejam autenticados */
const onlyAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect('/');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) return res.redirect('/');
    else return next();
  });
}

/* função middleware que só deixa passar clientes que
não estejam autenticados */
const onlyGuest = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next();

  /* se já estiver autenticado
  o cliente é redirecionado para página do jogo */
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) return next();
    else return res.redirect('/game');
  });
}

/* função middleware que só deixa passar clientes
que estejam autenticados e que sejam admins */
const onlyAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).send({error: "Não autorizado"});

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    
    if (err || !decoded) return res.status(401).send({error: "Não autorizado"});

    User.findById(decoded.uid)
      .then((user) => {
        if (user && user.isAdmin) return next();
        else return res.status(401).send({error: "Não autorizado"});
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).send({error: "Erro do Servidor Interno"});
      });
  });
}

module.exports = {
  onlyAuth,
  onlyGuest,
  onlyAdmin
}