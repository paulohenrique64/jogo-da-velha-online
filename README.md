## Jogo da velha online multiplayer

![1](https://github.com/paulohenrique64/jogo-da-velha-online/blob/main/public/images/game-gif.gif)

## Tecnologias utilizadas

- Jogo de velha online feito utilizando a biblioteca Socket.IO
- Front-end feito utilizando somente HTML, CSS e Javascript
- Back-end com nodejs, express, socket.io e mongodb para o banco de dados
- Jsonwebtoken e bcrypt foram utilizados para criptografar senhas e tokens de usuários
- O mailer foi utilizado para envio de emails para recuperação de senha
- O jogo suporta múltiplas partidas ao mesmo tempo

## Como rodar o jogo

Na raiz do projeto, execute os seguintes comandos

```
docker compose build
```
```
docker compose up
```

Apos executar os comandos, entre no link [localhost:3000](http://localhost:3000) no seu navegador

## Regra admin
- Para definir um usuário como <strong>admin</strong>, é necessário alterar manualmente o campo ```isAdmin``` no banco de dados, setando o campo como <strong>true</strong>. Usuários admins tem acesso a uma página de configurações diferente da página exibida para jogadores não admins.
