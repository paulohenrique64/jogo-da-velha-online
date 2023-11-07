const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

function mongooseConection() {
    const conection = mongoose.connect('mongodb://127.0.0.1:27017/jogo-da-velha').then(() => {
    console.log('Conexão com banco de dados efetuada com sucesso')
  }).catch((error) => {
    console.log(error)
  })
}

module.exports = mongooseConection