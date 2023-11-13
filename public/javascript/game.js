const socket = io();
const ul = document.querySelector('#player-list');
const divLobby = document.querySelector('#lobby')
const divGame = document.querySelector('#all')
const divPlacar = document.querySelector('#placar-container');
const playAgainButton = document.createElement('button');
const buttons = [];

playAgainButton.textContent = 'Play Again'; 

socket.on('onlinePlayersStatus', activePlayers => {
  // update players online list
  ul.innerHTML = '';

  activePlayers.forEach(player => {
    if (player.nickname !== userNickname) {
      const li = document.createElement('li')
      const invitePlayerButton = document.createElement('button');
      invitePlayerButton.textContent = 'Invite Player';
      invitePlayerButton.id = player.nickname;
      invitePlayerButton.className = 'invite-player-button'
      li.textContent = player.nickname;
      li.appendChild(invitePlayerButton);
      ul.appendChild(li);

      invitePlayerButton.addEventListener('click', () =>{
        socket.emit('invitePlayer', invitePlayerButton.id)
      })
    }
  });
})

socket.on('inviteError', res =>{
  // inputopponentNickname.placeholder = res.message;
  // criar caixa de texto no site informando o erro
})  

socket.on('startGameStatus', (match) => {
  var historyBox = document.getElementById('history');
  historyBox.innerHTML = '';

  socket.removeAllListeners('updateMessage');

  socket.on('updateMessage', (message, nick) => {
    addMessage(message, nick);
  })

  if (userNickname === match.creator.nickname) {
    var user = { points: match.creator.points, point: match.creator.point }
    var oponnent = { nickname: match.guest.nickname, points: match.guest.points, point: match.guest.point }
  } else {
    var user = { points: match.guest.points, point: match.guest.point }
    var oponnent = { nickname: match.creator.nickname, points: match.creator.points, point: match.creator.point }
  }

  divLobby.style.display = 'none';
  divGame.style.display = 'block';
  divPlacar.innerHTML = `
  <div class="placar1">
    <img src="/images/comp-cat1.jpg" alt="Profile Photo" class="placar-profile-img">
    <div class="placar-data1">
      <h1>CompCat ${user.point} (You)</h1>
      <h1 class="placar-player-name1">${userNickname}</h1>
      <h1 class="placar-point1">Score: ${user.points}</h1>
    </div>
  </div>
  <div class="placar2">
    <div class="placar-data2">
      <h1 class="player2">CompCat ${oponnent.point}</h1>
      <h1 class="placar-player-name2">${oponnent.nickname}</h1>
      <h1 class="placar-point2">Score: ${oponnent.points}</h1>
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

  if  (userNickname === match.currentPlayer.nickname) {
    document.querySelector('.placar1').style.backgroundColor = '#00ff88'; // azul claro
    document.querySelector('.placar2').style.backgroundColor = '#201b2c'; 

    document.querySelector('.placar-data1').style.color = '#201b2c'
    document.querySelector('.placar-data2').style.color = '#cccccc'
  } else {
    document.querySelector('.placar1').style.backgroundColor = '#201b2c'; // azul escuro
    document.querySelector('.placar2').style.backgroundColor = '#00ff88'; 

    document.querySelector('.placar-data1').style.color = '#cccccc'
    document.querySelector('.placar-data2').style.color = '#201b2c'
  }
});

socket.on('endGameStage', (match) => {
  divPlacar.innerHTML = `
  <div class="end-placar-container">
    <div class="end-placar">
      <h1 class="winner">${match.winner.nickname} venceu o jogo!</h1>
      <div class="end-game-buttons">
        <button class="end-game-button" id="playAgain">Jogar novamente</button>
        <button class="end-game-button" id="leaveParty">Sair da party</button>
    </div>
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
  socket.emit('activePlayer', userNickname);
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






