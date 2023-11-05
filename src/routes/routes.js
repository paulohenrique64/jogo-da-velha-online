import express, {Router} from 'express';
import bodyParser from 'body-parser';

const app = express()
const port = 3000
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

const router = new Router()

router.get('/1', (request, response) => {
    return response.status(200).send({message: 'a11'});
})

app.use(router)
console.log("Servidor rodando no link http://localhost:3000");
app.listen(port); 