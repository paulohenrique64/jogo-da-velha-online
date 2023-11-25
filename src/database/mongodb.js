require("dotenv").config();

const mongoose = require('mongoose');
const url = process.env.DB_URL + process.env.DB_NAME;

mongoose.set('strictQuery', false)

function mongooseConection() {
  const conection = mongoose.connect(url)
    .then(() => {
      console.log('Conexão com banco de dados efetuada com sucesso');
    })
    .catch(error => {
      console.log(error);
      console.log('Erro na conexão com o banco de dados');
    })
}

module.exports = mongooseConection;