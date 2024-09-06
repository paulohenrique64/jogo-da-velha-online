## Online tic tac toe

![1](https://github.com/paulohenrique64/jogo-da-velha-online/blob/main/public/images/game-gif.gif)

A javascript tic tac toe online game

## Techs useds

- front-end built with vanilla html, css & javascript
- back-end built with nodejs, express, socket.io & mongodb for database
- jsonwebtoken & bcrypt for cryptograpy the users passwords and tokens
- mailer for recovery and change password

## Running the game

in the game project root, run this following commands

```
docker compose build
```
```
docker compose up
```

and go to [localhost:3000](http://localhost:3000) in your browser

## Admin rule
To define a user as <strong>admin</strong>, it is necessary to manually change the ```isAdmin``` field in the database, setting the field to <strong>true</strong>. Admin users have access to a different settings page than the page shown to non-admin players.
