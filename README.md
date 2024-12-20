## Jogo da velha online multiplayer

![1](https://github.com/paulohenrique64/jogo-da-velha-online/blob/main/public/images/game.gif)

## Tecnologias utilizadas

- Jogo de velha online feito utilizando a biblioteca Socket.IO
- Front-end feito utilizando somente HTML, CSS e Javascript
- Back-end com nodejs, express, socket.io e mongodb para o banco de dados
- Jsonwebtoken e bcrypt foram utilizados para criptografar tokens de usuários
- [RoboHash API](https://robohash.org) para geração dos avatares aleatórios com base no nickname

## Como rodar o game localmente

Na raiz do projeto, execute os seguintes comandos

```
docker compose build
```
```
docker compose up
```

Apos executar os comandos, entre no link [localhost:3000](http://localhost:3000) no seu navegador
