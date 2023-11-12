import mongooseConnection from "./src/database/mongodb";
import jogoDaVelha from "./src/models/game";
import routes from "./src/routes/routes"
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import socketIO from "socket.io";

const path = require('path')
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');
const cookieParser = require('cookie-parser')
const port = 3000;

mongooseConnection(); // Conectar ao banco de dados

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
app.engine("ejs", require("ejs").renderFile);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use( cors({ credentials: true, methods: 'GET, PUT, POST, OPTIONS, DELETE' }) );
app.use("/", routes);
app.use((req, res, next) => { return res.status(404).redirect('/') });
app.use((req, res, next) => { return res.status(404).redirect('/game/') });

server.listen(port, () => {
  console.log(`Servidor rodando no link http://localhost:${port}`);
});

// online tic tac toe game with socket.io

var activePlayers = [] // armazenar jogadores onlines
var activeGames = [];  // armazenar as partidas que estão ocorrendo

io.on("connection", (socket) => {

  function sendGamestage(id1, id2, game) {
    if (id1 && id2 && game) {
      io.to(id1).emit("gameStatus", game);
      io.to(id2).emit("gameStatus", game);
    }
  }

  // adiciona o usuario logado na lista de jogadores onlines
  socket.on("activePlayer", (nickname) => {
    activePlayers.push({nickname: nickname, id: socket.id});
    console.log("novo jogador online: " + nickname);
    io.emit('onlinePlayersStatus', activePlayers);
  });

  // convida um jogador para um novo jogo caso o jogador esteja online
  socket.on("invitePlayer", (nickname) => {
    if (nickname) {
      const guest = activePlayers.find(player => player.nickname == nickname);
      const creator = activePlayers.find(player => player.id == socket.id)

      if (guest && creator) {
        if (guest != creator) {
          if (!activeGames.includes(guest) && !activeGames.includes(creator)) {
            const game = new jogoDaVelha(creator, guest)
            activeGames.push(game)
            sendGamestage(creator.id, guest.id, game)
          } else {
            io.to(socket.id).emit("inviteError", {message: "player already playing"});
          }
        } else {
          io.to(socket.id).emit("inviteError", {message: "impossible invite yourself"});
        }
      } else {
        io.to(socket.id).emit("inviteError", {message: "player aren't online yet"});
      }
    }
  });

  // marca um ponto no jogo da velha
  socket.on("point", (row, col) => {
    const player = activePlayers.find(player => player.id == socket.id)

    if (player) {
      for (let i = 0; i < activeGames.length; i++) {
        const game = activeGames[i];
        if (game.creator == player || game.guest == player) {
          if (game.setPoint(player, row, col)) {
            sendGamestage(game.creator.id, game.guest.id, game)
          }
        }
      }
    }
  });

  socket.on('playAgain', () => {
    const playerWillStarterNow = activePlayers.find(player => player.id == socket.id);

    if (playerWillStarterNow) {
      for (let i = 0; i < activeGames.length; i++) {
        const game = activeGames[i];

        if (playerWillStarterNow == game.creator || playerWillStarterNow == game.guest) {
          activeGames[i].resetGame(playerWillStarterNow)
          sendGamestage(game.creator.id, game.guest.id, activeGames[i])
        } 
      }
    }
  })

  // Remove o jogo associado ao id do player que fez a solicitacao
  socket.on('endGame', () => {
    const gameIndex = activeGames.findIndex(game => game.creator.id === socket.id || game.guest.id === socket.id);
    if (gameIndex !== -1) {
      const disconnectedGame = activeGames.splice(gameIndex, 1)[0];
      console.log('Jogo encerrado entre: ' + disconnectedGame.creator.nickname + ' e ' + disconnectedGame.guest.nickname);
      io.to(disconnectedGame.creator.id).emit("backToLobby");
      io.to(disconnectedGame.guest.id).emit("backToLobby");
    }
  })

  // criada automaticamente
  socket.on("disconnect", () => {
    // Remove o jogador desconectado
    const playerIndex = activePlayers.findIndex(player => player.id === socket.id);
    if (playerIndex !== -1) {
      const disconnectedPlayer = activePlayers.splice(playerIndex, 1)[0];
      console.log('Jogador desconectado: ' + disconnectedPlayer.nickname);
    }
  
    // Remove o jogo associado à desconexão
    const gameIndex = activeGames.findIndex(game => game.creator.id === socket.id || game.guest.id === socket.id);
    if (gameIndex !== -1) {
      const disconnectedGame = activeGames.splice(gameIndex, 1)[0];
      console.log('Jogo encerrado entre: ' + disconnectedGame.creator.nickname + ' e ' + disconnectedGame.guest.nickname);
    }
    // // Emitir um evento para notificar outros jogadores ou partes interessadas
    // io.emit("playerDisconnected", { playerId: socket.id, nickname: disconnectedPlayer.nickname });
  });
});


