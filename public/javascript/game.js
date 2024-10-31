const wsPath = baseUrlPath + "/socket.io/socket.io.js";
const divLobby = document.querySelector('#lobby');
const ul = document.querySelector('#player-list');
const divOnlinePlayersList = document.querySelector('#players');
const divGame = document.querySelector('.container')
const divPlacar = document.querySelector('#placar-container');
const playAgainButton = document.createElement('button');
const startGameButton = document.getElementById('startGameButton');
const offlineButton = document.getElementById('offline-button');
const inputFriendName = document.getElementById('inputFriendName');
const buttons = [];

var socket = undefined;
var userData = undefined;

// enviar uma mensagem
function sendMessage() {
  const inputMessage = document.querySelector('#message-input');
  socket.emit('message', inputMessage.value);
  inputMessage.value = '';
}

// exibir a mensagem no chat
function addMessage(message, nick) {
  var historyBox = document.getElementById('history')

  // mensagem do usuario atual
  if (userData.nickname === nick) {
    var boxMyMessage = document.createElement('div')
    boxMyMessage.className = 'box-my-message'

    var myMessage = document.createElement('p')
    myMessage.className = 'my-message'
    myMessage.innerHTML = message

    boxMyMessage.appendChild(myMessage)

    historyBox.appendChild(boxMyMessage)
  } else {
    // mensagem do oponnente
    var boxResponseMessage = document.createElement('div')
    boxResponseMessage.className = 'box-response-message'

    var chatResponse = document.createElement('p')
    chatResponse.className = 'response-message'
    chatResponse.innerHTML = message

    boxResponseMessage.appendChild(chatResponse)

    historyBox.appendChild(boxResponseMessage)
  }

  // levar scroll para o final
  historyBox.scrollTop = historyBox.scrollHeight
}

function main() {
  // get user route
  fetch("user")
    .then(response => {
      response.json()
        .then(responseJson => {
          userData = responseJson.user;

          // initialize socket
          socket = io({
            path: wsPath,
            auth: {
              nickname: userData.nickname
            },
            transports: ['websocket'], 
            upgrade: false,
          });

          updateLobbyImage(userData.nickname);
          document.querySelector(".nickname").innerHTML = `${userData.nickname}<br>▼`;

          createWebSocketRoutes();
        })
        .catch(error => {
          console.log(error);
        })
    })
    .catch(error => {
      console.log(error);
    })


  // adiciona funcao ao botao de start game do lobby
  startGameButton.addEventListener('click', () => {
    let friendName = inputFriendName.value;
    let historyBox = document.getElementById('history');
    inputFriendName.value = '';
    historyBox.innerHTML = '';
    socket.emit('start-game-versus-player', friendName.toLowerCase());
  })

  // adiciona funcao ao botao de start game contra CPU
  offlineButton.addEventListener('click', () => {
    let historyBox = document.getElementById('history');
    historyBox.innerHTML = '';
    socket.emit("start-game-versus-cpu");
  });
  
  playAgainButton.textContent = 'Play Again'; 
  divGame.style.display = 'none';

  // adiciona funcao aos botoes do jogo da velha
  for (let i = 0; i < 3; i++) {
    buttons.push([]);

    for (let j = 0; j < 3; j++) {
      const buttonId = i * 3 + j;
      const button = document.getElementById(buttonId);
      buttons[i].push(button);

      button.addEventListener('click', () => {
        if (buttons[i][j].innerHTML === "") {
          buttons[i][j].classList.add("cell-blue");
          socket.emit("point", i, j);
        }
      });
    }
  }

  const observer = new IntersectionObserver(onVisibilityChange);
  observer.observe(divLobby);
}

function updateLobbyImage(userNickname) {
  let divImage = document.querySelector(".image-lobby");
  divImage.innerHTML = `<img src="https://robohash.org/${userNickname}.png" alt="Profile Photo">`;
}

function onVisibilityChange(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      let messageTurnDiv = document.querySelector(".message-turn-div");
      messageTurnDiv.innerHTML = `<h1 class="message-turn">ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ</h1>`;
    }
  });
}

function updateGame(game) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (game.gamestate[i][j]) {
        buttons[i][j].innerHTML = game.gamestate[i][j].point;
      } else {
        buttons[i][j].innerHTML = "";
      }
    }
  }

  const placar1 = document.querySelector('.placar1');
  const placar2 = document.querySelector('.placar2');
  const placarData1 = document.querySelector('.placar-data1');
  const placarData2 = document.querySelector('.placar-data2');

  if (placar1 && placar2 && placarData1 && placarData2) {
    if  (userData.nickname === game.currentPlayer.nickname) {
      placar1.style.backgroundColor = '#0284ff'; // azul claro
      placar2.style.backgroundColor = '#091133'; 
      placarData1.style.color = '#201b2c'
      placarData2.style.color = '#cccccc'
      let messageTurnDiv = document.querySelector(".message-turn-div");
      messageTurnDiv.innerHTML = `<h1 class="message-turn">Agora é a sua vez de jogar</h1>`;
      messageTurnDiv.style.color = "#091133";
    } else {
      placar1.style.backgroundColor = '#091133'; // azul escuro
      placar2.style.backgroundColor = '#0284ff'; 
      placarData1.style.color = '#cccccc'
      placarData2.style.color = '#201b2c'
      let messageTurnDiv = document.querySelector(".message-turn-div");
      messageTurnDiv.innerHTML = `<h1 class="message-turn">Agora o oponnente joga</h1>`;
      messageTurnDiv.style.color = "#718bff";
    }
  } else {
    console.log('placar error')
  }
}

function createWebSocketRoutes() {
  // update online players list
  socket.on('players', players => {
    console.log(players);
    divOnlinePlayersList.innerHTML = '';
    players.forEach(player => {
      if (player.nickname !== userData.nickname) {
        let playerBox = document.createElement('div');
        playerBox.className = "player-box";
        playerBox.innerHTML = `
          <img src="https://robohash.org/${player.nickname}.png" alt="Profile Photo">
          <p>${player.nickname}</p>
        `;
        divOnlinePlayersList.appendChild(playerBox);
      }
    });
  })

  socket.on('error-message', (response) => {
    alert(response.message);
  })

  // atualiza o jogo no começo da partida
  socket.on('start-game-status', (room) => {
    let players = room.players;
    let self = players[1];
    let oponnent = players[0];

    if (players[0].nickname === userData.nickname) {
      self = players[0];
      oponnent = players[1];
    } 

    console.log(room)

    socket.removeAllListeners('update-message');

    socket.on('update-message', (message, nickname) => {
      addMessage(message, nickname);
    })

    divLobby.style.display = 'none';
    divGame.style.display = 'flex';
    divPlacar.style.display = 'flex';
    divPlacar.innerHTML = `
    <div class="placar1">
      <img src="https://robohash.org/${self.nickname}.png" class="placar-profile-img" alt="Profile Photo">
      <div class="placar-data1">
        <h1>Jogador ${self.point}ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ</h1>
        <h1>${self.nickname}</h1>
        <h1>Score na partida: ${self.points}</h1>
        <h1>Jogos vencidos: ${self.wins}</h1>
      </div>
    </div>
    <div class="placar2">
      <div class="placar-data2">
        <h1>ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤJogador ${oponnent.point}</h1>
        <h1>${oponnent.nickname}</h1>
        <h1>Score na partida: ${oponnent.points}</h1>
        <h1>Jogos vencidos: ${oponnent.wins}</h1>
      </div>
      <img src="https://robohash.org/${oponnent.nickname}.png" class="placar-profile-img" alt="Profile Photo">
    </div> `;

    updateGame(room.game);
  })

  socket.on("connect_error", (err) => {
    let messageTurnDiv = document.querySelector(".message-turn-div");

    console.log(err.data.content);
    divLobby.style.display = 'none';
    messageTurnDiv.innerHTML = `<h1 class="message-turn">${err.data.content}</h1>`;
  });

  socket.on('game-status', (room) => {
    let game = room.game;

    updateGame(game);

    if (game.winner || game.tie === true) {
      let messageTurnDiv = document.querySelector(".message-turn-div");

      if (game.winner) {
        // existe um ganhador
        divPlacar.innerHTML = `
          <div class="end-placar">
            <h1>${game.winner.nickname} venceu o jogo!</h1>
            <div class="end-game-buttons">
              <button id="playAgain">Jogar novamente</button>
              <button id="leaveParty">Sair da party</button>
          </div>`;
      
          if (game.winner.nickname === userData.nickname) {
            messageTurnDiv.innerHTML = `<h1 class="message-turn">Você venceu :)</h1>`;
            messageTurnDiv.style.color = "#091133";
          } else {
            messageTurnDiv.innerHTML = `<h1 class="message-turn">Você perdeu :(</h1>`;
            messageTurnDiv.style.color = "#718bff";
          }
      } else {
        // jogo empatou
        divPlacar.innerHTML = `
        <div class="end-placar">
          <h1>O Jogo empatou!</h1>
          <div class="end-game-buttons">
            <button id="playAgain">Jogar novamente</button>
            <button id="leaveParty">Sair da party</button>
        </div>`;
  
        messageTurnDiv.innerHTML = `<h1 class="message-turn">Empate '_'</h1>`;
      }
  
      const playAgainButton = document.querySelector('#playAgain').addEventListener('click', ( () => {
        socket.emit('play-again');
      }))
  
      const leavePartyButton = document.querySelector('#leaveParty').addEventListener('click', () => {
        socket.emit('end-game')
      })
    }
  });

  // esconde o jogo e exibe o lobby
  socket.on('back-to-lobby', () => {
    divLobby.style.display = 'flex';
    divGame.style.display = 'none';
    divPlacar.style.display = 'none';
  })
}

main();
