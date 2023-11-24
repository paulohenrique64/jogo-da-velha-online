const urlLogin = "http://localhost:3000/login";
const form = document.getElementById('form');
const spans  = document.querySelectorAll('.span-required');
const campos = document.querySelectorAll('.required');
const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const validacaoEmail = validarEmail();
  const validacaoSenha = validarSenha();

  if (validacaoEmail && validacaoSenha) {

  const formData = new FormData(form)
  const user = {};
  formData.forEach((value, key) => {
    user[key] = value;
  });
  
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
        location.reload();
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
})

function validarEmail() {
  if(!emailRegex.test(campos[0].value)) {
    setError(0);
    return false;
  } else {
    removeError(0);
    return true;
  }
}

function validarSenha() {
  if(campos[1].value.length < 8) {
    setError(1);
    return false;
  } else {
    removeError(1);
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










