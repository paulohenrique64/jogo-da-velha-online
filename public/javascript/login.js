const urlLogin = "http://localhost:3000/login";
const form = document.getElementById('form');

form.addEventListener('submit', () => {
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
      console.log(response.status)
    })
    .catch(error => {
      console.log(error)
  })
})





