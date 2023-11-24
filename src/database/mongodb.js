import databaseConfig from '../config/database';

const mongoose = require('mongoose');
const url = databaseConfig.url + databaseConfig.name;

mongoose.set('strictQuery', false)

function mongooseConection() {
  const conection = mongoose.connect(url).then(() => {
    console.log('Conexão com banco de dados efetuada com sucesso');
  }).catch((error) => {
    console.log(error);
    console.log('Erro na conexão com o banco de dados');
  })
}

module.exports = mongooseConection;