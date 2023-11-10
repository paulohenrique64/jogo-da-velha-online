import express from "express";
import bodyParser from "body-parser";
import http from "http";
import socketIO from "socket.io";
import mongooseConnection from "./src/database/mongodb";
import homeRoutes from "./src/routes/homeRoutes"
import authRoutes from "./src/routes/authRoutes";
import gameRoutes from "./src/routes/gameRoutes"
import jogoDaVelha from "./src/models/gameModel";

const path = require('path')
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.engine("ejs", require("ejs").renderFile);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Conectar ao banco de dados
mongooseConnection();

app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

var activePlayers = [];
var activeGames = [];

io.on("connection", (socket) => {
  // adiciona o usuario logado na lista de jogadores onlines
  socket.on("activePlayer", (nickname) => {

    activePlayers.push({
      nickname: nickname,
      id: socket.id,
    });

    console.log("novo jogador online: " + nickname);
  });

  // convida um jogador para um novo jogo caso o jogador esteja online
  socket.on("invitePlayer", (nickname) => {
    if (nickname) {
      let guest;
      let creator;
      let alreadyPlaying = false;

      // verificar se os dois usuarios estao online
      activePlayers.forEach((player) => {
        if (player.nickname == nickname) {
          guest = player;
        }

        if (player.id == socket.id) {
          creator = player;
        }
      });

      if (guest && creator) {
        if (guest != creator) {
          // verificar se o jogador convidado ou o criador já estão em partida
          activeGames.forEach((game) => {
            if (game.guest == guest || game.creator == creator) {
              alreadyPlaying = true;
              io.to(creator.id).emit("inviteError", {message: "player already playing"});
            }
          });
  
          if (!alreadyPlaying) {
            const game = new jogoDaVelha(creator, guest);
            activeGames.push(game);
  
            io.to(creator.id).emit("gameStart");
            io.to(guest.id).emit("gameStart");
            io.to(creator.id).emit("gameStatus", game);
            io.to(guest.id).emit("gameStatus", game);
            console.log('Novo jogo entre: ' + game.creator.nickname + ' e ' + game.guest.nickname);
          }
        } else {
          io.to(creator.id).emit("inviteError", {message: "impossible invate yourself"});
        } 
      } else {
        io.to(socket.id).emit("inviteError", {message: "player aren't online yet"});
      }
    }
  });

  // socket.on('playAgain', () => {
  //   for (let i = 0; i < activeGames.length; i++) {
  //     if (activeGames[i].creator.id == socket.id || activeGames[i].guest.id == socket.id) {
  //       activeGames[i] = new jogoDaVelha(activeGames.creator, activeGames.guest)
  //       io.to(activeGames[i].creator.id).emit("gameStart");
  //       io.to(activeGames[i].guest.id).emit("gameStart");
  //       io.to(activeGames[i].creator.id).emit("gameStatus", activeGames[i]);
  //       io.to(activeGames[i].guest.id).emit("gameStatus", activeGames[i]);
  //     }
  //   }
  // })

  // marca um ponto no jogo da velha
  socket.on("point", (row, col) => {
    let player;

    activePlayers.forEach((activePlayer) => {
      if (socket.id == activePlayer.id) {
        player = activePlayer;
      }
    });

    // verifica se o jogador esta online
    if (player) {
      activeGames.forEach((game) => {
        if ((game.creator.id == socket.id || game.guest.id == socket.id) && game.currentPlayer == player) {
          game.setPoint(player, row, col);
          game.switchCurrentPlayer();
          io.to(game.creator.id).emit("gameStatus", game);
          io.to(game.guest.id).emit("gameStatus", game);
        }
      });
    }
  });

  // criada automaticamente
  socket.on("disconnect", () => {
    for (let i = 0; i < activePlayers.length; i++) {
      if (activePlayers[i].id == socket.id) {
        activePlayers[i].isClosed = true;
        console.log('Jogador desconectado: ' + activePlayers[i].nickname);
      }
    }

    for (let i = 0; i < activeGames.length; i++) {
      if (activeGames[i].creator.id == socket.id || activeGames[i].guest.id == socket.id) {
        activeGames[i].isClosed = true;
        console.log('Jogo encerrado entre: ' + activeGames[i].creator.nickname + ' e ' + activeGames[i].guest.nickname);
      }
    }
  })
    
});

const port = 3000;
server.listen(port, () => {
  console.log(`Servidor rodando no link http://localhost:${port}`);
});
