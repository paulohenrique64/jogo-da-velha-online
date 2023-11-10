document.querySelector('#form').addEventListener('submit', (event) => {
  event.preventDefault()

  const url = "http://localhost:3000/auth/register/user";

  const formData = new FormData(document.getElementById('form'))
  const user = {}
  formData.forEach((value, key) => {
    user[key] = value;
  })

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
      console.log(responseJson)
    })
  }).catch((error) => {
    console.log(error)
  })

})