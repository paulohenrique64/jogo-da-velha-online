const socket = io();
const ul = document.querySelector('#player-list');
const divLobby = document.querySelector('#lobby');
const divOnlinePlayersList = document.querySelector('#players');
const divGame = document.querySelector('.container')
const divPlacar = document.querySelector('#placar-container');
const playAgainButton = document.createElement('button');
const buttons = [];
const startGameButton = document.getElementById('startGameButton');
const inputFriendName = document.getElementById('inputFriendName');

playAgainButton.textContent = 'Play Again'; 

socket.on('onlinePlayerList', activePlayers => {
  // update players online list
  divOnlinePlayersList.innerHTML = '';

  activePlayers.forEach(player => {
    if (player.nickname !== userNickname) {
      // <div class="player-box">
      //     <img src="/images/comp-cat1.jpg" alt="Profile Photo">
      //     <p>joao</p>
      //   </div>
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

startGameButton.addEventListener('click', () => {
  const friendName = inputFriendName.value;
  socket.emit('createParty', friendName)
  var historyBox = document.getElementById('history');
  historyBox.innerHTML = '';
})

socket.on('inviteError', res =>{
  // inputopponentNickname.placeholder = res.message;
  // criar caixa de texto no site informando o erro
})  

socket.on('startGameStatus', (match, creatorPlayerData, guestPlayerData) => {

  socket.removeAllListeners('updateMessage');
  socket.on('updateMessage', (message, nick) => {
    addMessage(message, nick);
  })

  console.log(creatorPlayerData)
  console.log(guestPlayerData)

  if (userNickname === match.creator.nickname) {
    var user = { points: match.creator.points, point: match.creator.point, wins: creatorPlayerData.wins }
    var oponnent = { nickname: match.guest.nickname, points: match.guest.points, point: match.guest.point, wins: guestPlayerData.wins }
  } else {
    var user = { points: match.guest.points, point: match.guest.point, wins: guestPlayerData.wins }
    var oponnent = { nickname: match.creator.nickname, points: match.creator.points, point: match.creator.point, wins: creatorPlayerData.wins }
  }

  divLobby.style.display = 'none';
  divGame.style.display = 'flex';
  divPlacar.innerHTML = `
  <div class="placar1">
    <img src="/images/comp-cat1.jpg" alt="Profile Photo" class="placar-profile-img">
    <div class="placar-data1">
      <h1>Jogador ${user.point} - ${userNickname} </h1>
      <h1>Pontos: ${user.points}</h1>
      <h1>Vitórias: ${user.wins}</h1>
    </div>
  </div>
  <div class="placar2">
    <div class="placar-data2">
      <h1>Jogador ${oponnent.point} - ${oponnent.nickname}</h1>
      <h1>Pontos: ${oponnent.points}</h1>
      <h1>Vitórias: ${oponnent.wins}</h1>
    </div>
    <img src="/images/comp-cat2.jpg" alt="Profile Photo" class="placar-profile-img">
  </div> `;
})

// atualizar o jogo do cliente de acordo com o servidor
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
    if  (userNickname === match.currentPlayer.nickname) {
      placar1.style.backgroundColor = '#00ff88'; // azul claro
      placar2.style.backgroundColor = '#201b2c'; 
      placarData1.style.color = '#201b2c'
      placarData2.style.color = '#cccccc'
    } else {
      placar1.style.backgroundColor = '#201b2c'; // azul escuro
      placar2.style.backgroundColor = '#00ff88'; 

      placarData1.style.color = '#cccccc'
      placarData2.style.color = '#201b2c'
    }
  } else {
    console.log('placars are not in the DOM yet')
  }
});

socket.on('endGameStage', (match) => {
  divPlacar.innerHTML = `
    <div class="end-placar">
      <h1>${match.winner.nickname} venceu o jogo!</h1>
      <div class="end-game-buttons">
        <button id="playAgain">Jogar novamente</button>
        <button id="leaveParty">Sair da party</button>
    </div>`;

  const playAgainButton = document.querySelector('#playAgain').addEventListener('click', ( () => {
    socket.emit('playAgain');
  }))

  const leavePartyButton = document.querySelector('#leaveParty').addEventListener('click', () => {
    socket.emit('endGame')
  })
})

socket.on('backToLobby', () => {
  divLobby.style.display = 'flex';
  divGame.style.display = 'none';
})

function main() {
  socket.emit('newOnlinePlayer', userNickname);
  divGame.style.display = 'none';

  // divGame.style.display = 'block';
  // divLobby.style.display = 'none';

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
}

main()

// chat test
function sendMessage() {
  const inputMessage = document.querySelector('#message-input');
  socket.emit('message', inputMessage.value);
  inputMessage.value = '';
}

function addMessage(message, nick) {
  var historyBox = document.getElementById('history')

  // My message
  if (userNickname === nick) {
    var boxMyMessage = document.createElement('div')
    boxMyMessage.className = 'box-my-message'

    var myMessage = document.createElement('p')
    myMessage.className = 'my-message'
    myMessage.innerHTML = message

    boxMyMessage.appendChild(myMessage)

    historyBox.appendChild(boxMyMessage)
  } else {
    // Response message
    var boxResponseMessage = document.createElement('div')
    boxResponseMessage.className = 'box-response-message'

    var chatResponse = document.createElement('p')
    chatResponse.className = 'response-message'
    chatResponse.innerHTML = message

    boxResponseMessage.appendChild(chatResponse)

    historyBox.appendChild(boxResponseMessage)
  }

  // Levar scroll para o final
  historyBox.scrollTop = historyBox.scrollHeight
}






