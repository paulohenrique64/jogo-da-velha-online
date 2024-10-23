const form = document.querySelector('#form');
const spans  = document.querySelectorAll('.span-required');
const campos = document.querySelectorAll('.required');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (validarSenha()) {

    const url = `/jogodavelha/user/password/${resetPasswordToken}`;
    const user = { password: campos[0].value };

    // Opções da solicitação (método, cabeçalhos, corpo)
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Especifica que você está enviando JSON
      },
      body: JSON.stringify(user), // Converte o objeto JSON em uma string JSON
    }

    fetch(url, options).then((response) => {
      response.json().then((responseJson) => {
        if (responseJson.message)
          alert(responseJson.message);
        else if (responseJson.error)
          alert(responseJson.error);

        formClear();
      })
    }).catch((error) => {
      console.log(error)
    })
  }
})

function validarSenha() {
  // verificar se a senha digitada no primeiro campo tem mais de 8 caracteres
  if (campos[0].value.length < 8) {
    setError(0);
    return false;
  } else {
    removeError(0);
  }

  // verificar se as senhas coicidem
  if (campos[0].value !== campos[1].value) {
    setError(1);
    return false;
  } else {
    removeError(1);
  }

  // passou por todas as verificações 
  return true;
}

function formClear() {
  campos[0].value = "";
  campos[1].value = "";
}

function setError(index){
  campos[index].style.border = '2px solid #e63636';
  spans[index].style.display = 'block';
}

function removeError(index){
  campos[index].style.border = '';
  spans[index].style.display = 'none';
}


