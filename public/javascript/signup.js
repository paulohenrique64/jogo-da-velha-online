const url = "http://localhost:3000/register";
const form = document.getElementById('form');
const spans  = document.querySelectorAll('.span-required');
const campos = document.querySelectorAll('.required');
const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const validacaoNickname = validarNickname();
  const validacaoEmail = validarEmail();
  const validacaoSenha = validarSenha();

  if (validacaoNickname && validacaoEmail && validacaoSenha) {
  
    const formData = new FormData(form)
    const user = {};
    formData.forEach((value, key) => {
      user[key] = value;
    });

    console.log(user)
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
    })
    }).catch((error) => {
      console.log(error)
    })
  }
})

function validarNickname() {
  if(campos[0].value.length < 3) {
    setError(0);
    return false;
  } else {
    removeError(0);
    return true;
  }
}

function validarEmail() {
  if(!emailRegex.test(campos[1].value)) {
    setError(1);
    return false;
  } else {
    removeError(1);
    return true;
  }
}

function validarSenha() {
  if(campos[2].value.length < 8) {
    setError(2);
    return false;
  } else {
    removeError(2);
    return true;
  }
}

function setError(index){
  campos[index].style.border = '2px solid #e63636';
  spans[index].style.display = 'block';
}

function removeError(index){
  campos[index].style.border = '';
  spans[index].style.display = 'none';
}






