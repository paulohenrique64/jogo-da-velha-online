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
const gameBoardSvg = document.querySelector(".game-board-svg");

var socket = undefined;
var userData = undefined;

const winningCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

// enviar uma mensagem
function sendMessage() {
  const inputMessage = document.querySelector('#message-input');
  socket.emit('message', inputMessage.value);
  inputMessage.value = '';
}

function comparePatterns(pattern1, pattern2) {
  for (let i = 0; i < pattern1.length; i++) 
    if (pattern1[i] !== pattern2[i]) return false;

  return true;
}

// renderizar o padrao de vitoria no game
function renderWinPattern(game, color) {
  let winCombination = game.winCombination["combination"];

  //
  // 0 1 2
  //
  if (comparePatterns(winCombination, winningCombinations[0])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="0" y1="83" x2="500" y2="83" stroke-width="16" stroke="${color}" />
    `);
  }

  if (comparePatterns(winCombination, winningCombinations[1])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="0" y1="249" x2="500" y2="249" stroke-width="16" stroke="${color}" />
    `);
  }

  if (comparePatterns(winCombination, winningCombinations[2])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="0" y1="415" x2="500" y2="415" stroke-width="16" stroke="${color}" />
    `);
  }

  //
  // 3 4 5
  //
  if (comparePatterns(winCombination, winningCombinations[3])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="83" y1="0" x2="83" y2="500" stroke-width="16" stroke="${color}" />
    `);
  }

  if (comparePatterns(winCombination, winningCombinations[4])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="249" y1="0" x2="249" y2="500" stroke-width="16" stroke="${color}" />
    `);
  }

  if (comparePatterns(winCombination, winningCombinations[5])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="415" y1="0" x2="415" y2="500" stroke-width="16" stroke="${color}" />
    `);
  }

  //
  // 6 7 8
  //
  if (comparePatterns(winCombination, winningCombinations[6])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="10" y1="10" x2="490" y2="490" stroke-width="16" stroke="${color}" />
    `);
  }

  if (comparePatterns(winCombination, winningCombinations[7])) {
    gameBoardSvg.insertAdjacentHTML('beforeend', `
      <line x1="490" y1="10" x2="10" y2="490" stroke-width="16" stroke="${color}" />
    `);
  }
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

  let count = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = document.querySelector(`#cell-${count}`);
      cell.addEventListener('click', () => { socket.emit("point", i, j) });
      count++;
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

function updateGame(room) {
  let game = room.game;
  let self = room.players[1];
  let colorX = "#091133";
  let colorO = "#66b2ff";

  if (room.players[0].nickname === userData.nickname) 
    self = room.players[0];

  if (self.point !== 'X') {
    colorX = "#66b2ff";
    colorO = "#091133";
  } 

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (game.gamestate[i][j]) {
        if (game.gamestate[i][j].point === 'X') {
          gameBoardSvg.insertAdjacentHTML('afterbegin', `
            <line x1="${35 + (166 * j)}" y1="${35 + (166 * i)}" x2="${131 + (166 * j)}" y2="${131 + (166 * i)}" stroke-width="15" stroke="${colorX}" />
            <line x1="${131 + (166 * j)}" y1="${35 + (166 * i)}" x2="${35 + (166 * j)}" y2="${131 + (166 * i)}" stroke-width="15" stroke="${colorX}" />
          `);
        } else {
          gameBoardSvg.insertAdjacentHTML('afterbegin', `<circle cx="${83 * (2 * j + 1)}" cy="${83 * (2 * i + 1)}" r="50"stroke="${colorO}" stroke-width="15" fill="transparent" />`);
        }
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
      placarData1.style.color = '#091133'
      placarData2.style.color = '#cccccc'
      let messageTurnDiv = document.querySelector(".message-turn-div");
      messageTurnDiv.innerHTML = `<h1 class="message-turn">Agora é a sua vez de jogar</h1>`;
      messageTurnDiv.style.color = "#091133";
    } else {
      placar1.style.backgroundColor = '#091133'; // azul escuro
      placar2.style.backgroundColor = '#0284ff'; 
      placarData1.style.color = '#cccccc'
      placarData2.style.color = '#091133' 
      let messageTurnDiv = document.querySelector(".message-turn-div");
      messageTurnDiv.innerHTML = `<h1 class="message-turn">ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ</h1>`;
      messageTurnDiv.style.color = "#0284ff";
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
    gameBoardSvg.innerHTML = `
      <line x1="166" y1="500" x2="166" y2="0" stroke-width="13" stroke="#091133" />
      <line x1="332" y1="500" x2="332" y2="0" stroke-width="13" stroke="#091133" />
      <line x1="0" y1="166" x2="500" y2="166" stroke-width="13" stroke="#091133" />
      <line x1="0" y1="332" x2="500" y2="332" stroke-width="13" stroke="#091133" />
    `;

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

    updateGame(room);
  })

  socket.on("connect_error", (err) => {
    let messageTurnDiv = document.querySelector(".message-turn-div");

    console.log(err.data.content);
    divLobby.style.display = 'none';
    messageTurnDiv.innerHTML = `<h1 class="message-turn">${err.data.content}</h1>`;
  });

  socket.on('game-status', (room) => {
    let game = room.game;

    console.log(room);
  
    updateGame(room);

    if (game.winner || game.tie === true) {
      let messageTurnDiv = document.querySelector(".message-turn-div");

      if (game.winner) {
        // existe um ganhador
        divPlacar.innerHTML = `
          <div class="end-placar">
            <div class="end-game-buttons">
              <button id="playAgain">Jogar novamente</button>
              <button id="leaveParty">Sair da party</button>
          </div>`;
      
          if (game.winner.nickname === userData.nickname) {
            messageTurnDiv.innerHTML = `<h1 class="message-turn">Você venceu :)</h1>`;
            messageTurnDiv.style.color = "#091133";
            renderWinPattern(game, "#0284ff");
          } else {
            messageTurnDiv.innerHTML = `<h1 class="message-turn">Você perdeu :(</h1>`;
            messageTurnDiv.style.color = "#0284ff";
            renderWinPattern(game, "red");
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
