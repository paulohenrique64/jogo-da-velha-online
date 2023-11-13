const urlLogin = "http://localhost:3000/login/user";
const form = document.getElementById('form');
const spans  = document.querySelectorAll('.span-required');
const campos = document.querySelectorAll('.required');

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





