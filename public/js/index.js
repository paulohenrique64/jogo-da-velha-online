var buttons = []

function jsonData(url) {
    return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.log(error))
}

async function getApi(url) {
    const data = await jsonData(url)
    if (data.message == 'a11') {
        buttons[0].textContent = 'x'
    }
}

var markX=function() {
    console.log('clicou na posicao ' + this.textContent)
    let position = this.textContent
    getApi('http://localhost:3000/' + position)
}

for (let i = 0; i < 9; i = i + 1) {
    buttons.push(document.getElementById('button' + (i + 1)))
    buttons[i].addEventListener('click', markX)
}












