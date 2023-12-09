### Link do jogo: <a href="https://jogodavelhaonline.azurewebsites.net/">https://jogodavelhaonline.azurewebsites.net</a>

![1](https://github.com/paulohenrique64/jogo-da-velha-online-js/blob/main/public/images/game-gif.gif)

# Jogo da Velha Online

Projeto final de um processo seletivo para uma empresa júnior

- Jogo de velha online feito utilizando a biblioteca Socket.IO
- Front-end feito utilizando somente HTML, CSS e Javascript
- Back-end com nodejs, express, socket.io e mongodb para o banco de dados
- Jsonwebtoken e bcrypt foram utilizados para criptografar senhas e tokens de usuários
- O mailer foi utilizado para envio de emails para recuperação de senha

# Como rodar localmente

Requisitos: ter o Node e o NPM instalados

- Clone a branch main deste repositório para seu computador
- Abra a pasta do projeto
- Certifique-se de criar o arquivo ".env" na raiz do repositorio
  - Utilize o ".env.example" como exemplo e insira os dados do seu banco de dados (mongodb) e utilize os dados do seu <a href="https://mailtrap.io">Mailer</a>
- Após isso execute os seguintes comandos:
  - <strong> ```npm install ```</strong>
  - <strong>```npm start```</strong>

E pronto! Mantenha o terminal aberto e clique <a href="http://localhost:3000" target="_blank">aqui</a> para abrir o projeto no seu navegador.

# Regra admin
Para definir um usuário como <strong>admin</strong>, é necessário alterar manualmente o campo ```isAdmin``` no banco de dados, setando o campo como true. Usuários admins tem acesso a uma página de configurações diferente da página exibida para jogadores não admins.

## Meu email de contato

paulohenriquelvs20@gmail.com
