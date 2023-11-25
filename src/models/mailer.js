import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

require("dotenv").config();

const transport = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {user: process.env.MAILER_AUTH_USER, 
    pass: process.env.MAILER_AUTH_PASS
  }
})

transport.use(
  'compile',
  hbs({
    viewEngine: {
      extname: '.hbs',
      partialsDir: './src/resources/mail',
      layoutsDir: './src/resources/mail',
      defaultLayout: null,
    },
    viewPath: path.resolve('./src/resources/mail'),
    extName: '.html',
  }),
);

export default transport;