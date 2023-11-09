import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import socketIO from 'socket.io';
import mongooseConnection from './src/database/mongodb';
import authRoutes from './src/routes/authRoutes';
import jogoDaVelha from './src/models/gameModel'

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Conectar ao banco de dados
mongooseConnection();

app.use('/auth', authRoutes);

var onlinePlayers = []
var matches = []

io.on('connection', (socket) => {

  // adiciona o usuario logado na lista de jogadores onlines
  socket.on('addtoOnlinePlayers', (nickname) => {
    onlinePlayers.push({
      nickname: nickname,
      id: socket.id
  })
  
    console.log('novo jogador online: ' + socket.id)
    console.log(onlinePlayers)
  });

  // convida um jogador para um novo jogo caso o jogador esteja online
  socket.on('invitePlayer', (nickname) => {
    let guest
    let creator

    onlinePlayers.forEach(player => {
      if (player.nickname == nickname) {
        guest = player
      }

      if (player.id == socket.id) {
        creator = player
      }
    })

    console.log(guest)
    console.log(creator)

    // caso o jogador esteja online
    if (guest.nickname == nickname) {
      const match = new jogoDaVelha(creator, guest)
      matches.push(match)
      io.to(creator.id).emit('gameStatus', match);
      io.to(guest.id).emit('gameStatus', match);
      console.log(matches)
    }
    })

    // criada automaticamente
    socket.on('disconnect', () => {
      onlinePlayers.forEach((disconectedPlayer) => {
        if (disconectedPlayer.id == socket.id) {
          onlinePlayers = onlinePlayers.filter((player) => {player.id != disconectedPlayer.id})

          console.log('player desconectado: ' + socket.id)
          console.log(onlinePlayers)
        }
      })
    });

    socket.on('point', (row, col) => {
      let player

      onlinePlayers.forEach(onlinePlayer => {
        if (socket.id == onlinePlayer.id) {
          player = onlinePlayer
        }
      })
    
      matches.forEach(match => {
        if (match.creator.id == socket.id || match.guest.id == socket.id) {
          match.setPoint(player, row,col)
          io.to(match.creator.id).emit('gameStatus', match);
          io.to(match.guest.id).emit('gameStatus', match);
        }
      })
    })
});

const port = 3000;
server.listen(port, () => {
  console.log(`Servidor rodando no link http://localhost:${port}`);
});