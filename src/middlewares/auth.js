import jwt from 'jsonwebtoken'
import authConfig from '../config/auth'

const authMiddleware = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (authHeader) {
    const tokenData = authHeader.split(' ');

    if (tokenData.length != 2) {
      response.redirect('/auth/login')
    }

    const [scheme, token] = tokenData;
    if (scheme.indexOf('Bearer') < 0) {
      response.redirect('/auth/login')
    }

    jwt.verify(token, 'sjbfjdsgjdghldrgblhrgh4353rtbihdyxyuvdgy848', (err, decoded) => {
      if (err) {
        response.redirect('/auth/login')
      } else {
        request.uid = decoded.uid;
        return next();
      }
    })

  } else {
    response.redirect('/auth/login')
  }
}

module.exports = {
  authMiddleware,
}