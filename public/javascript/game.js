const socket = io();
const divLobby = document.querySelector('#lobby');
const ul = document.querySelector('#player-list');
const divOnlinePlayersList = document.querySelector('#players');
const divGame = document.querySelector('.container')
const divPlacar = document.querySelector('#placar-container');
const playAgainButton = document.createElement('button');
const startGameButton = document.getElementById('startGameButton');
const inputFriendName = document.getElementById('inputFriendName');
const buttons = [];

var userData;

// atualiza a lista de jogadores onlines do lobby
socket.on('onlinePlayerList', activePlayers => {
  divOnlinePlayersList.innerHTML = '';

  activePlayers.forEach(player => {

    if (player.id !== socket.id) {
      const playerBox = document.createElement('div');
      playerBox.className = "player-box";
      playerBox.innerHTML = `
        <img src="/images/comp-cat1.jpg" alt="Profile Photo">
        <p>${player.nickname}</p>
      `;
      divOnlinePlayersList.appendChild(playerBox);
    }

  });
})

socket.on('inviteError', (response) => {
  alert(response.message);
})

// atualiza o jogo no começo da partida
socket.on('startGameStatus', (match, creatorPlayerData, guestPlayerData) => {

  socket.removeAllListeners('updateMessage');
  socket.on('updateMessage', (message, nick) => {
    addMessage(message, nick);
  })

  console.log(creatorPlayerData)
  console.log(guestPlayerData)

  if (userData.nickname === match.creator.nickname) {
    var user = { nickname: match.creator.nickname, points: match.creator.points, point: match.creator.point, wins: creatorPlayerData.wins }
    var oponnent = { nickname: match.guest.nickname, points: match.guest.points, point: match.guest.point, wins: guestPlayerData.wins }
  } else {
    var user = { nickname: match.creator.nickname, points: match.guest.points, point: match.guest.point, wins: guestPlayerData.wins }
    var oponnent = { nickname: match.creator.nickname, points: match.creator.points, point: match.creator.point, wins: creatorPlayerData.wins }
  }

  divLobby.style.display = 'none';
  divGame.style.display = 'flex';
  divPlacar.style.display = 'flex';
  divPlacar.innerHTML = `
  <div class="placar1">
    <img src="/images/comp-cat1.jpg" alt="Profile Photo" class="placar-profile-img">
    <div class="placar-data1">
      <h1>Jogador ${user.point}ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ</h1>
      <h1>${user.nickname}</h1>
      <h1>Pontos: ${user.points}</h1>
      <h1>Vitórias: ${user.wins}</h1>
    </div>
  </div>
  <div class="placar2">
    <div class="placar-data2">
      <h1>ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤJogador ${oponnent.point}</h1>
      <h1>${oponnent.nickname}</h1>
      <h1>Pontos: ${oponnent.points}</h1>
      <h1>Vitórias: ${oponnent.wins}</h1>
    </div>
    <img src="/images/comp-cat2.jpg" alt="Profile Photo" class="placar-profile-img">
  </div> `;
})

// atualiza o jogo durante a partida
socket.on('gameStatus', (match) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (match.gamestate[i][j]) {
        buttons[i][j].innerHTML = match.gamestate[i][j].point;
      } else {
        buttons[i][j].innerHTML = '';
      }
    }
  }

  const placar1 = document.querySelector('.placar1');
  const placar2 = document.querySelector('.placar2');
  const placarData1 = document.querySelector('.placar-data1');
  const placarData2 = document.querySelector('.placar-data2');

  if (placar1 && placar2 && placarData1 && placarData2) {
    if  (userData.nickname === match.currentPlayer.nickname) {
      placar1.style.backgroundColor = '#0284ff'; // azul claro
      placar2.style.backgroundColor = '#091133'; 
      placarData1.style.color = '#201b2c'
      placarData2.style.color = '#cccccc'
    } else {
      placar1.style.backgroundColor = '#091133'; // azul escuro
      placar2.style.backgroundColor = '#0284ff'; 

      placarData1.style.color = '#cccccc'
      placarData2.style.color = '#201b2c'
    }
  } else {
    console.log('placar error')
  }
});

// atualiza o jogo ao chegar ao final da partida
socket.on('endGameStage', (match) => {
  if (match.winner) {
  // existe um ganhador
  divPlacar.innerHTML = `
    <div class="end-placar">
      <h1>${match.winner.nickname} venceu o jogo!</h1>
      <div class="end-game-buttons">
        <button id="playAgain">Jogar novamente</button>
        <button id="leaveParty">Sair da party</button>
    </div>`;
  } else {
    // jogo empatou
    divPlacar.innerHTML = `
    <div class="end-placar">
      <h1>O Jogo empatou!</h1>
      <div class="end-game-buttons">
        <button id="playAgain">Jogar novamente</button>
        <button id="leaveParty">Sair da party</button>
    </div>`;
  }

  const playAgainButton = document.querySelector('#playAgain').addEventListener('click', ( () => {
    socket.emit('playAgain');
  }))

  const leavePartyButton = document.querySelector('#leaveParty').addEventListener('click', () => {
    socket.emit('endGame')
  })
})

// esconde o jogo e exibe o lobby
socket.on('backToLobby', () => {
  divLobby.style.display = 'flex';
  divGame.style.display = 'none';
  divPlacar.style.display = 'none';
})

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
    // mensagem do oponente
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
  const url = "http://localhost:3000/user";

  fetch(url)
    .then(response => {
      response.json()
        .then(responseJson => {
          userData = responseJson.user;
          socket.emit('newOnlinePlayer', userData.nickname);
          document.querySelector(".nickname").innerHTML = `${userData.nickname}<br>▼`;

          if (userData.isAdmin) 
            document.querySelector("#settingsPageLink").setAttribute("href", "http://localhost:3000/adminSettings");  
        })
        .catch(error => {
          console.log(error);
        })
    })
    .catch(error => {
      console.log(error);
    })

  // adiciona funcao aos botoes do jogo da velha
  for (let i = 0; i < 3; i++) {
    buttons.push([]);
    for (let j = 0; j < 3; j++) {
      const buttonId = i * 3 + j;
      const button = document.getElementById(buttonId);
      buttons[i].push(button);
      button.addEventListener('click', () => {
        socket.emit('point', i, j); 
      });
    }
  }

  // adiciona funcao ao botao de start game do lobby
  startGameButton.addEventListener('click', () => {
    const friendName = inputFriendName.value;
    inputFriendName.value = '';
    socket.emit('createParty', friendName)
    var historyBox = document.getElementById('history');
    historyBox.innerHTML = '';
  })

  playAgainButton.textContent = 'Play Again'; 
  divGame.style.display = 'none';
}

main()






