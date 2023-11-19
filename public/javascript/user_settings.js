let tbody = document.querySelector("tbody");
let form = document.querySelector(".form-wrapper");
let saveBtn = document.querySelector(".save");
let cancelBtn = document.querySelector(".cancel");
let nickname = document.querySelector("#nickname");
let email = document.querySelector("#email");
let password = document.querySelector("#password");
let wins = document.querySelector("#wins");

let id = null;
let httpm = 'PATCH';
let user;

cancelBtn.onclick = function () {
  form.classList.remove("active");
};

saveBtn.onclick = function () {
  // salva os dados do form no banco de dados com post ou put
  const user = {
    nickname: nickname.value,
    email: email.value,
    password: password.value,
    id
  }

  let url = 'http://localhost:3000/user';

  fetch(url,
    { 
      method: httpm, body: JSON.stringify(user), 
      headers: { "Content-type": "application/json" } 
    })
  .then((response)=>{
    response.json().then(responseJson => {
      if (responseJson.message) alert(responseJson.message);
      else if (responseJson.error) alert(responseJson.error);
      clearForm();
      form.classList.remove('active');
      getUser();
    })
  })
  .catch(error => {
    console.log(error);
  })
};

function getUser(){
  fetch("http://localhost:3000/user")
  .then(response=>response.json())
  .then(data=>{
    if (data.user) user = data.user;
    if (data.error) console.log(data.error);
    updateTable();
  })
}


function editUser(event) {
  clearForm();
  form.classList.add("active");
  id = event.target.parentElement.parentElement.id;
}

function deleteUser(event) {
  let url = "http://localhost:3000/user";
  id= event.target.parentElement.parentElement.id;
  fetch(url+"/"+id, {method:'DELETE'})
  .then((response)=>{
    response.json().then(responseJson => {
      if (responseJson.message) alert(responseJson.message);
      else if (responseJson.error) alert(responseJson.error);
      getUsers();
    })
  })
  .catch(error => {
    console.log(error);
  })
}

function clearForm() {
  nickname.value = null;
  email.value = null;
  password.value = null;
}

function updateTable() {
  let data = "";

  data += `<tr id="${user._id}">
                    <td>${user.nickname}</td>
                    <td>${user.email}</td>
                    <td>${user.wins}</td>
                    <td><button class="btn btn-primary" onclick="editUser(event)">Editar</button></td>
                    <td><button class="btn btn-danger" onclick="deleteUser(event)">Deletar</button></td>   
                  </tr>`;


  tbody.innerHTML = data;
}

getUser()



