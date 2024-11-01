//
//
// express server configuration
//
//

import mongooseConnection from "./src/database/mongodb";
import JogoDaVelha from "./src/models/game";
import Chat from "./src/models/chat";
import bodyParser from "body-parser";
import socketIO from "socket.io";
import express, { response } from "express";
import routes from "./src/routes/routes"
import http from "http";
import { computer } from "./src/util/miniMax";

require("dotenv").config();

const cookieParser = require('cookie-parser');
const User = require('./src/models/user');
const path = require('path')
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');
const port = process.env.PORT;

app.use(cors({
  origin: "*",
  credentials: true, 
  methods: 'GET, POST, OPTIONS, DELETE'   
}));

app.set("trust proxy", true);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
app.engine("ejs", require("ejs").renderFile);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", routes);
app.use((req, res) => {return res.status(404).redirect(process.env.BASE_URL_PATH)});


mongooseConnection();  // connect to database
server.listen(port, "0.0.0.0"); // running the express server

//
//
// socket.io websockets routes
//
//

var players = [];
var rooms = [];

// session middleware
io.use((socket, next) => {
  let incoming_user_nickname = socket.handshake.auth.nickname;
  let incoming_user_id = socket.id;

  for (let i = 0; i < players.length; i++) {
    if (players[i].nickname === incoming_user_nickname && players[i].id !== incoming_user_id) {
      let err = new Error("not authorized");
      err.data = { content: "É permitido somente uma sessão por jogador, por favor saia do jogo!" }; 
      return next(err);
    }
  }

  next();
});

io.on("connection", (socket) => { 
  updateOnlinePlayers(socket);

  // start game against cpu
  socket.on("start-game-versus-cpu", () => {
    let player = players.find(player => socket.id === player.id);
    let cpu = getRobotPlayerData();

    if (!player || !cpu) 
      sendError(socket.id);

    User.findOne({ nickname: player.nickname })
      .then(playerData => {
        // verify data integrity
        if (!playerData || (playerData && playerData.nickname !== player.nickname))
          sendError(socket.id);

        // set players and game data
        let game = new JogoDaVelha(player, cpu);
        let chat = new Chat(player, cpu);

        player.points = 0;
        player.point = 'X';
        player.wins = playerData.wins;

        cpu.points = 0;
        cpu.point = 'O';

        // create room
        let room = {
          players: [player, cpu],
          game: game,
          chat: chat,
        };

        rooms.push(room)

        // send game status to player
        io.to(player.id).emit("start-game-status", room);
      }).catch(error => {
        console.log(error);
        sendError(socket.id);
      })
  })

  // start game against player
  socket.on("start-game-versus-player", (friendName) => {
    if (!friendName) 
      return io.to(socket.id).emit("error-message", {message: "You must to inform a friend nickname to start a game versus player"});

    let player = players.find(player => socket.id === player.id);
    let oponnent = players.find(player => player.nickname === friendName);

    if (!player) 
      return sendError(socket.id);

    if (!oponnent) 
      return io.to(socket.id).emit("error-message", {message: "Guest player aren't online yet"});

    if (friendName === player.nickname) 
      return io.to(socket.id).emit("error-message", {message: "Impossible invite yourself"});

    if (rooms.find(room => room.players[0].id === oponnent.id || room.players[1].id === oponnent.id)) 
      return io.to(socket.id).emit("error-message", {message: "Player already playing"});

    User.findOne({nickname: player.nickname})
      .then(playerData => {
        // verify data integrity
        if (!playerData || (playerData && playerData.nickname !== player.nickname)) 
          sendError(socket.id);

        User.findOne({nickname: oponnent.nickname})
          .then(oponnentData => {
            // verify data integrity
            if (!oponnentData || (oponnentData && oponnentData.nickname !== oponnent.nickname)) 
              sendError(socket.id);

            // set players and game data
            let game = new JogoDaVelha(player, oponnent);
            let chat = new Chat(player, oponnent);

            player.wins = playerData.wins;
            player.points = 0;
            player.point = 'X';

            oponnent.wins = oponnentData.wins;
            oponnent.points = 0;
            oponnent.point = 'O';

            // create room
            let room = {
              players: [player, oponnent],
              game: game,
              chat: chat,
            };

            rooms.push(room)

            // send game status to players
            io.to(player.id).to(oponnent.id).emit("start-game-status", room);
          }).catch(error => {
            console.log(error);
          })
      }).catch(error => {
        console.log(error);
        sendError(socket.id);
      })
  })

  // mark point against player
  socket.on("point", (row, col) => {
    let room = rooms.find(room => room.players[0].id === socket.id || room.players[1].id === socket.id);

    if (!room)
      return sendError(socket.id);

    let game = room.game;
    let player = room.players[0];
    let oponnent = room.players[1];

    if (player.id !== socket.id) {
      player = room.players[1];
      oponnent = room.players[0];
    }

    game.setPoint(player, row, col)

    if (oponnent.nickname === getRobotPlayerData().nickname) {
      // playing versus ia
      io.to(player.id).emit("game-status", room);

      if (game.checkEnd()) {
        // if game end with player point
        if (game.checkWinner() && game.winner.nickname === player.nickname) {
          player.wins++;
          player.points++;
        } 

        return io.to(player.id).emit("game-status", room);
      } else {
        setTimeout(() => {
          const point = computer(game, player); // get cpu point -->  i = 0, j = 1
          game.setPoint(oponnent, point[0], point[1]);

          if (game.checkEnd())
            // if game end with cpu point
            if (game.checkWinner()) oponnent.points++;

          return io.to(player.id).emit("game-status", room);
        }, 500);
      }
    } else {
      // playing versus player
      if (game.checkEnd() && game.checkWinner()) {    
        if (game.winner.nickname === player.nickname) {
          player.wins++;
          player.points++;
        } else {
          oponnent.wins++;
          oponnent.points++;
        }
      }

      return io.to(player.id).to(oponnent.id).emit("game-status", room);
    }
  });

  // reset a game between two players or player and cpu
  socket.on('play-again', () => {
    let room = rooms.find(room => room.players[0].id === socket.id || room.players[1].id === socket.id);
  
    if (!room)
      return sendError(socket.id);

    let player = room.players.find(player => player.id == socket.id);
    let game = room.game;

    if (!player)
      return sendError(socket.id);

    game.resetGame(player);

    if (game.guest.nickname === getRobotPlayerData().nickname) 
      // playing versus ia
      io.to(socket.id).emit("start-game-status", room);
    else 
      // playing versus player
      io.to(game.creator.id).to(game.guest.id).emit("start-game-status", room);
  })

  // delete game room
  socket.on('end-game', () => {
    let room = rooms.find(room => room.players[0].id === socket.id || room.players[1].id === socket.id);

    if (!room)
      return sendError(socket.id);

    let player = room.players[0];
    let oponnent = room.players[1];

    if (player.id !== socket.id) {
      player = room.players[1];
      oponnent = room.players[0];
    }

    // update player wins on database
    User.findOne({nickname: player.nickname})
      .then(userData => {
        if (userData || userData.nickname === player.nickname) {
          userData.wins = player.wins;
          userData.save();
        }
      })
      .catch(error => {
        console.log(error);
      })

    // update oponnent wins on database
    if (oponnent.nickname !== getRobotPlayerData().nickname)  {
      User.findOne({nickname: oponnent.nickname})
        .then(userData => {
          if (userData || userData.nickname === oponnent.nickname) {
            userData.wins = oponnent.wins;
            userData.save();
          }
        })
        .catch(error => {
          console.log(error);
        })
    }

    deleteRoom(socket.id);
    io.to(room.game.creator.id).to(room.game.guest.id).emit("back-to-lobby");
  })

  // delete game room
  socket.on("disconnect", () => {
    let room = rooms.find(room => room.players[0].id === socket.id || room.players[1].id === socket.id);

    if (room) {
      deleteRoom(socket.id);
      io.to(room.game.creator.id).to(room.game.guest.id).emit("back-to-lobby");
    }

    updateOnlinePlayers(socket);
  });

  // messaging
  socket.on('message', message => {
    let room = rooms.find(room => room.players[0].id === socket.id || room.players[1].id === socket.id);
    let player = players.find(player => player.id == socket.id);

    if (!room || !player)
      return sendError(socket.id);
    
    if (player.nickname === room.chat.creator.nickname) room.chat.creator.messages.push(message);
    else room.chat.guest.messages.push(message);

    io.to(room.players[0].id).to(room.players[1].id).emit("update-message", message, player.nickname);
  })
});

function updateOnlinePlayers(originalSocket) {
  let new_players = [];

  for (let [id, socket] of io.of("/").sockets) {
    if (!socket) return sendError(originalSocket.id);

    new_players.push({
      id: id,
      nickname: socket.handshake.auth.nickname,
    });
  }

  players = new_players;

  console.log(players);
  io.emit("players", players);
}

function sendError(socketId) {
  // if player is in a room, delete the room and send back to lobby
  let endedRoom = deleteRoom(socketId);
  endedRoom ? io.to(socketId).emit("back-to-lobby") : io.to(endedRoom.game.creator.id).to(endedRoom.game.guest.id).emit("back-to-lobby");
  return io.to(socketId).emit("error-message", { message: "Internal server error, please try again" });
}

function deleteRoom(playerID) {
  let roomIndex = rooms.findIndex(room => room.players[0].id === playerID || room.players[1].id === playerID);

  if (roomIndex !== -1) {
    let endedRoom = rooms.splice(roomIndex, 1)[0];
    console.log('room closed between: ' + endedRoom.game.creator.nickname + ' and ' + endedRoom.game.guest.nickname);
    return endedRoom;
  }
}

function getRobotPlayerData() {
  return {
    id: -1,
    nickname: "robot", 
    wins: "+99",
  };
}
