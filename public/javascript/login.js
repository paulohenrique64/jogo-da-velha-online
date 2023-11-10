const urlLogin = "http://localhost:3000/auth/login/user";
const urlGamePage = "http://localhost:3000/game/";

document.getElementById('form').addEventListener('submit', handleFormSubmit)

function handleFormSubmit(event) {
  // event.preventDefault();

  const formData = new FormData(document.getElementById('form'))
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
      response.json()
        .then(responseJson => {
          let token = responseJson.token;
          console.log(token)
        })
    })
    .catch(error => {
      console.log(error)
    })
}

