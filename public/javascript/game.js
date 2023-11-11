const socket = io();
const nickname = document.querySelector('#nickname').textContent;
const inputOponentNickname = document.querySelector('#oponentNickname');
const buttons = [];
const div = document.querySelector('#div2');
const playAgainButton = document.createElement('button')
playAgainButton.textContent = 'Play Again'; 

// ----- colocar o player online-------
function executar() {
  socket.emit('activePlayer', nickname);
}
executar()
// -------------------------------------

document.querySelector('#startgame').addEventListener('click', () => {
  socket.emit('invitePlayer', inputOponentNickname.value);
  inputOponentNickname.value = '';
})

socket.on('inviteError', res =>{
  inputOponentNickname.placeholder = res.message;
})  

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

// atualizar o jogo do cliente de acordo com o servidor
socket.on('gameStatus', (match) => {
  if (div.contains(playAgainButton))
    div.removeChild(playAgainButton);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (match.gamestate[i][j]) {
        buttons[i][j].textContent = match.gamestate[i][j].point;

        // botao fica verde para quem marca e vermelho para o oponente
        if (nickname == match.gamestate[i][j].nickname) {
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

  if (match.winner) {
    console.log('Vencedor: ' + match.winner);
  } else if (match.tie) {
    console.log('Empate');
  }

  if (match.winner || match.tie) {
    div.appendChild(playAgainButton);
  }
});

playAgainButton.addEventListener('click', () => {
  socket.emit('playAgain');
});

document.getElementById('logoutForm').addEventListener('submit', () => {
  fetch('http://localhost:3000/game/logout').then(response => {
    console.log('logout')
  }).catch(error => {
    console.log(error)
  })
})




