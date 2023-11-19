let tbody = document.querySelector("tbody");
let addBtn = document.querySelector(".add");
let form = document.querySelector(".form-wrapper");
let saveBtn = document.querySelector(".save");
let cancelBtn = document.querySelector(".cancel");
let nickname = document.querySelector("#nickname");
let email = document.querySelector("#email");
let password = document.querySelector("#password");
let wins = document.querySelector("#wins");

let id = null;
let httpm = null;
let users = [];

addBtn.onclick = function () {
  httpm = "POST";
  clearForm();
  form.classList.add("active");
};

cancelBtn.onclick = function () {
  form.classList.remove("active");
};

saveBtn.onclick = function () {
  // salva os dados do form no banco de dados com post ou put
  const user = {
    nickname: nickname.value,
    email: email.value,
    password: password.value
  }

  let url;

  if (httpm === 'POST') {
    url = "http://localhost:3000/register";
  } else {
    url = "http://localhost:3000/user";
    user.id = id;
  }

  if (user.id) console.log(user.id);

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
      getUsers();
    })
  })
  .catch(error => {
    console.log(error);
  })
};

function getUsers(){
  fetch("http://localhost:3000/users")
  .then(response=>response.json())
  .then(data=>{
    users = data.users;
    updateTable();
  })
}


function editUser(event) {
  httpm = "PATCH";
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

  for (i = 0; i < users.length; i++) {
    data += `<tr id="${users[i]._id}">
                      <td>${users[i].nickname}</td>
                      <td>${users[i].email}</td>
                      <td>${users[i].wins}</td>
                      <td><button class="btn btn-primary" onclick="editUser(event)">Editar</button></td>
                      <td><button class="btn btn-danger" onclick="deleteUser(event)">Deletar</button></td>   
                   </tr>`;
  }

  tbody.innerHTML = data;
}

getUsers()



