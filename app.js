import express, {Router} from 'express';
import bodyParser from 'body-parser';
import mongooseConection from './src/database/mongodb'
const cors = require('cors');

const router = new Router()
const app = express()
const port = 3000
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// efetuar conexão com banco de dados
mongooseConection()

// const userRoutes = require('./src/routes/userRoute')
const gameRoutes = require('./src/routes/gameRoutes')
const authRoutes = require('./src/routes/authRoutes')

// app.use('/user', userRoutes)
app.use('/game', gameRoutes)
app.use('/auth', authRoutes)

app.listen(port, () => {
  console.log("Servidor rodando no link http://localhost:3000");
}); 


