const path = require('path');
import jwt from 'jsonwebtoken';
const User = require('../models/user');

// refatorar melhor depois
const getGamePage = (req, res) => {
  const token = req.cookies.token;

  // verifica se o token é valido
  jwt.verify(token, 'sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848', (err, decoded) => {
    if (err) {
      res.redirect('/logout')
    } else {
      // se o token for valido, o token e descriptografado e a userdata é buscada na database
      let _id = decoded.uid;

      User.findOne({_id}).then(user => {
        if (user) {
          const filePath = path.join(__dirname, '../views/game')
          return res.status(200).render(filePath, {userdata: user})
        } else {
          console.log('user data nao encontrada')
          return res.redirect('/logout')
        }
      }).catch(error => {
        console.log(error)
        return res.redirect('/logout')
      }) 
    }
  })
}

module.exports = {
  getGamePage, 
}