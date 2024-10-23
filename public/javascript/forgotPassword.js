const form = document.querySelector('#form');
const span  = document.querySelector('.span-required');
const campo = document.querySelector('.required');
const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

function validarEmail() {
  if(!emailRegex.test(campo.value)) {
    setError();
    return false;
  } else {
    removeError();
    return true;
  }
}

function formClear() {
  campo.value = "";
}

function setError(){
  campo.style.border = '2px solid #e63636';
  span.style.display = 'block';
}

function removeError(){
  campo.style.border = '';
  span.style.display = 'none';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const url = "/jogodavelha/user/forgot-password";
  const user = { email: campo.value };
  
  if (validarEmail()) {
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


