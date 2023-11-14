import mongooseConnection from "./src/database/mongodb";
import routes from "./src/routes/routes"
import express from "express";
import bodyParser from "body-parser";
import http from "http";
import socketIO from "socket.io";
import jogoDaVelha from "./src/models/game";
import chat from "./src/models/chat";

mongooseConnection(); // Conectar ao banco de dados

const User = require('./src/models/user');
const path = require('path')
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');
const cookieParser = require('cookie-parser')
const port = 3000;

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

/* 

  jogo da velha online - socket.io

*/

var activePlayers = []; 
var activeGames = [];   
var activeChats = [];   

io.on("connection", (socket) => { 

  // adiciona o novo jogador conectado na lista de jogadores onlines
  socket.on('newOnlinePlayer', nickname => {
    if (nickname) {
      const player = activePlayers.find(player => player.nickname === nickname);

      if (!player) {
        activePlayers.push({nickname: nickname, id: socket.id});
        console.log(`Jogador [${nickname}] entrou no lobby.`);
        io.emit('onlinePlayerList', activePlayers);
      }
    }
  })

  // convida um jogador para um novo jogo
  socket.on("createParty", (guestNickname) => {
    if (guestNickname) {

      const guest = activePlayers.find(player => player.nickname == guestNickname);
      const creator = activePlayers.find(player => player.id == socket.id)
      
      if (guest && creator) {
        if (guest !== creator) {
          const game = activeGames.find(game => game.creator === guest || game.guest === guest);
          if (!game) {

            const game = new jogoDaVelha(creator, guest);
            const newChat = new chat(creator, guest); 
            activeGames.push(game);
            activeChats.push(newChat);
            sendStartGameStage(creator.id, guest.id, game)

          } else {
            io.to(socket.id).emit("inviteError", {message: "player already playing"});
          }
        } else {
          io.to(socket.id).emit("inviteError", {message: "impossible invite yourself"});
        }
      } else {
        io.to(socket.id).emit("inviteError", {message: "Guest player aren't online yet"});
      }
    }
  });

  // marca um ponto no jogo da velha
  socket.on("point", (row, col) => {
    const player = activePlayers.find(player => socket.id === player.id);
    const game = activeGames.find(game => game.creator === player || game.guest === player);
    // se o player estiver em alguma partida
    if (player && game && game.setPoint(player, row, col)) {
      sendGamestage(game.creator.id, game.guest.id, game);
      if (game.end()) {
        if (game.winner) {
          User.findOne({nickname: game.winner.nickname}).then(winnerData => {
            if (winnerData.nickname === game.winner.nickname) {
              User.findByIdAndUpdate(winnerData.id, {
                $set: {
                  wins: winnerData.wins + 1,
                }
              }).catch(error => {
                console.log(error)
              })
            }
          }).catch(error => {
            console.log(error);
          })
        }
        sendEndGameStage(game.creator.id, game.guest.id, game);
      }
    }
  });

  // reiniciar uma partida entre 2 jogadores
  socket.on('playAgain', () => {
    const player = activePlayers.find(player => socket.id === player.id);
    const gameIndex = activeGames.findIndex(game => game.creator.id === socket.id || game.guest.id === socket.id);
    if (gameIndex !== -1) {
      activeGames[gameIndex].resetGame(player);
      sendStartGameStage(activeGames[gameIndex].creator.id, activeGames[gameIndex].guest.id, activeGames[gameIndex]);
    }
  })

  // encerra o jogo e o chat associado ao id do player que fez a solicitacao
  socket.on('endGame', () => {
    const chatIndex = activeChats.findIndex(chat => chat.creator.id === socket.id || chat.guest.id === socket.id);
    const gameIndex = activeGames.findIndex(game => game.creator.id === socket.id || game.guest.id === socket.id);

    if (chatIndex !== -1) {
      const disconnectedChat = activeChats.splice(chatIndex, 1)[0];
      console.log('chat encerrado entre: ' + disconnectedChat.creator.nickname + ' e ' + disconnectedChat.guest.nickname);
    }

    if (gameIndex !== -1) {
      const disconnectedGame = activeGames.splice(gameIndex, 1)[0];
      console.log('Jogo encerrado entre: ' + disconnectedGame.creator.nickname + ' e ' + disconnectedGame.guest.nickname);
      io.to(disconnectedGame.creator.id).to(disconnectedGame.guest.id).emit("backToLobby");
    }
  })

  // preparar o cliente do usuario para o inicio do jogo
  function sendStartGameStage(id1, id2, game) {
    if (id1 && id2 && game) {
      User.findOne({nickname: game.creator.nickname}).then(creatorData => {
        User.findOne({nickname: game.guest.nickname}).then(guestData => {
          if (creatorData.nickname === game.creator.nickname && guestData.nickname === game.guest.nickname) {
            io.to(id1).to(id2).emit("startGameStatus", game, creatorData, guestData);
            sendGamestage(id1, id2, game);
          }
        })
      }).catch(error => {
        io.to(id1).to(id2).emit("backToLobby");
      })
    }
  }

  // atualizar o cliente do usuario com os dados do jogo
  function sendGamestage(id1, id2, game) {
    if (id1 && id2 && game) io.to(id1).to(id2).emit("gameStatus", game);
  }

  // preparar o cliente do usuario para o termino do jogo
  function sendEndGameStage(id1, id2, game) {
    if (id1 && id2 && game) io.to(id1).to(id2).emit("endGameStage", game);
  }

  // exibir mensagem enviada por um dos players no chat entre eles
  socket.on('message', message => {
    const chatIndex = activeChats.findIndex(chat => chat.creator.id === socket.id || chat.guest.id === socket.id)
    const player = activePlayers.find(player => player.id == socket.id)
    if (chatIndex !== -1) {
      if (player === activeChats[chatIndex].creator)
        activeChats[chatIndex].creator.messages.push(message);
      else 
        activeChats[chatIndex].guest.messages.push(message);
      io.to(activeChats[chatIndex].creator.id).to(activeChats[chatIndex].guest.id).emit('updateMessage', message, player.nickname);
    }
  })

  // quando algum jogador é desconectado, sua partida e seu chat são encerrados caso existam
  socket.on("disconnect", () => {
    // Remove o jogador desconectado
    const playerIndex = activePlayers.findIndex(player => player.id === socket.id);

    if (playerIndex !== -1) {
      const disconnectedPlayer = activePlayers.splice(playerIndex, 1)[0];
      console.log('Jogador desconectado: ' + disconnectedPlayer.nickname);
    }

    // encerra o chat associado a desconexao
    const chatIndex = activeChats.findIndex(chat => chat.creator.id === socket.id || chat.guest.id === socket.id);
    if (chatIndex !== -1) {
      const disconnectedChat = activeChats.splice(chatIndex, 1)[0];
      console.log('chat encerrado entre: ' + disconnectedChat.creator.nickname + ' e ' + disconnectedChat.guest.nickname);
    }
  
    // encerra o jogo associado à desconexão
    const gameIndex = activeGames.findIndex(game => game.creator.id === socket.id || game.guest.id === socket.id);
    if (gameIndex !== -1) {
      const disconnectedGame = activeGames.splice(gameIndex, 1)[0];
      console.log('Jogo encerrado entre: ' + disconnectedGame.creator.nickname + ' e ' + disconnectedGame.guest.nickname);
      io.to(disconnectedGame.creator.id).to(disconnectedGame.guest.id).emit("backToLobby");
    }

    io.emit('onlinePlayerList', activePlayers);
  });

});