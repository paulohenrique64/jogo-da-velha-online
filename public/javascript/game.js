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
      invitePlayerButton.className = player.nickname;
      li.textContent = player.nickname;
      li.appendChild(invitePlayerButton);
      ul.appendChild(li);

      invitePlayerButton.addEventListener('click', () =>{
        socket.emit('invitePlayer', invitePlayerButton.className)
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

  console.log('jogo começou')
  divLobby.style.display = 'none';
  divGame.style.display = 'block';
  divPlacar.innerHTML = `
  <div class="placar">
    <h1 class="placar-player-name">${match.creator.nickname}</h1>
    <img src="/images/profilephoto.png" alt="Profile Photo" class="placar-profile-img">
    <h1 class="placar-point1">${match.creator.points}</h1>
    <h1 class="placar-point2">${match.guest.points}</h1>
    <img src="/images/profilephoto.png" alt="Profile Photo" class="placar-profile-img">
    <h1  class="placar-player-name">${match.guest.nickname}</h1>
  </div> `;
})

// atualizar o jogo do cliente de acordo com o servidor
socket.on('gameStatus', (match) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (match.gamestate[i][j]) {
        buttons[i][j].textContent = match.gamestate[i][j].point;

        // botao fica verde para quem marca e vermelho para o oponente
        if (userNickname == match.gamestate[i][j].nickname) {
          buttons[i][j].style.backgroundColor = "green";
        } else {
          buttons[i][j].style.backgroundColor = "red";
        }
      } else {
        buttons[i][j].textContent = '';
        buttons[i][j].style.backgroundColor = "gray";
      }
    }
  }
});

socket.on('endGameStage', (match) => {
  divPlacar.innerHTML = `
  <div class="end-placar-container">
    <div class="end-placar">
      <h1 class="winner">Jogador ${match.winner.nickname} venceu o jogo</h1>
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

socket.on('updateMessage', (message, nick) => {
  addMessage(message, nick);
})

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






