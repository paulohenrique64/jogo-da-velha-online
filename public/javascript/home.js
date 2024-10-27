const urlLogin = "login";
const span  = document.querySelector('.span-required');
const campo = document.querySelector('.required');
const startGameButton = document.querySelector(".start-game-button");

startGameButton.addEventListener("click", (event) => {
    console.log(campo.value);
    const user = {};
    user["nickname"] = campo.value;

    if (validarNickname()) {
        const optionsForLogin = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
          };
        
        fetch(urlLogin, optionsForLogin)
            .then(response => {
                if (response.status === 201) {
                    // se o servidor retornar 201 --> login aprovado --> recarrega a pagina
                    window.location.replace("game");
                } else {
                    // se o servidor não retornar 201 --> login não aprovado --> exibe o erro na pagina atual
                    response.json()
                        .then(responseJson => {
                            alert(responseJson.error);
                        })
                        .catch(error => {
                            console.log(error);
                        })
                }
            })
            .catch(error => {
                console.log(error)
            })
    }
});

function validarNickname() {
    if (campo.value.length < 3 || campo.value.length > 20) {
        setError();
        return false;
    } else {
        removeError();
        return true;
    }
}

function setError(){
    campo.style.border = '2px solid #e63636';
    span.style.display = 'block';
}

function removeError(){
  campo.style.border = '';
  span.style.display = 'none';
}

