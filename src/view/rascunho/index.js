var buttons = []

var inputName = document.getElementById('input1')
var gameId = document.getElementById('input2')
var startButton = document.getElementById('button13')
var updateButton = document.getElementById('button14')

var color
var gameData = {}

function jsonData(url, options) {
    return fetch(url, options)
    .then((response) => response.json())
    .catch((error) => console.log(error))
}

async function getApi(url) {
    const data = await jsonData(url)

    // linha 0
    if (data.board[0][0] == 'X') {
        buttons[0].style.backgroundColor = 'red'
    }

    if (data.board[0][1] == 'X') {
        buttons[1].style.backgroundColor = 'red'
    }

    if (data.board[0][2] == 'X') {
        buttons[2].style.backgroundColor = 'red'
    }

    // linha 1
    if (data.board[1][0] == 'X') {
        buttons[3].style.backgroundColor = 'red'
    }

    if (data.board[1][1] == 'X') {
        buttons[4].style.backgroundColor = 'red'
    }

    if (data.board[1][2] == 'X') {
        buttons[5].style.backgroundColor = 'red'
    }

    // linha  2
    if (data.board[2][0] == 'X') {
        buttons[6].style.backgroundColor = 'red'
    }

    if (data.board[2][1] == 'X') {
        buttons[7].style.backgroundColor = 'red'
    }

    if (data.board[2][2] == 'X') {
        buttons[8].style.backgroundColor = 'red'
    }
}

async function postApi(url, options) {
    const data = await jsonData(url, options)
    console.log(data.message)
}

var markX=function() {
    this.style.backgroundColor = 'red'
    let position = this.className
    let number = position[6]

    let row
    let col

    if (number == 1) {
        row = 0
        col = 0
    }

    if (number == 2) {
        row = 0
        col = 1
    }

    if (number == 3) {
        row = 0
        col = 2
    }

    if (number == 4) {
        row = 1
        col = 0
    }

    if (number == 5) {
        row = 1
        col = 1
    }

    if (number == 6) {
        row = 1
        col = 2
    }

    if (number == 7) {
        row = 2
        col = 0
    }

    if (number == 8) {
        row = 2
        col = 1
    }
 
    if (number == 9) {
        row = 2
        col = 2
    }

    const data = {
        player: gameData.user,
        row: row,
        col: col,
    }

    const url = 'http://localhost:3000/markx/' + gameData.gameId;

    // Opções da solicitação (método, cabeçalhos, corpo)
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Especifica que você está enviando JSON
        },
        body: JSON.stringify(data), // Converte o objeto JSON em uma string JSON
    };

    postApi(url, options)
}

function startGame() {
    gameData = {
        user: inputName.value,
        gameId: gameId.value,
    }
}

startButton.addEventListener('click', startGame)
updateButton.addEventListener('click', updateGame)

for (let i = 0; i < 9; i = i + 1) {
    buttons.push(document.getElementById('button' + (i + 1)))
    buttons[i].addEventListener('click', markX)
}

// preciso que esta funcao fique rodando a cada segundo
// para verificar se houve alguma alteração no jogo
// o jogo so pode começar quando o botao start for apertado ou algo do tipo
function updateGame() {
    const url = 'http://localhost:3000/gameStatus/' + gameData.gameId;
    getApi(url)
}
  














