let tbody = document.querySelector("tbody");
let addBtn = document.querySelector(".add");
let form = document.querySelector(".form-wrapper");
let saveBtn = document.querySelector(".save");
let cancelBtn = document.querySelector(".cancel");
let nickname = document.querySelector("#nickname");
let email = document.querySelector("#email");
let password = document.querySelector("#password");
let wins = document.querySelector("#wins");
let groupNickname = document.querySelector(".group-nickname");
let groupEmail =  document.querySelector(".group-email");
let groupPassword = document.querySelector(".group-password");

let id = null;
let users = [];

addBtn.onclick = function () {
  registerUser();
};

cancelBtn.onclick = function () {
  hiddenForm();
};

saveBtn.onclick = function () {
  // registro
  if (nickname.value && email.value && password.value)
    return saveUser("/jogodavelha/register", {nickname: nickname.value, email: email.value, password: password.value}); 

  // editar nickname
  if (nickname.value)
    return saveUser("/jogodavelha/user/nickname", {id, nickname: nickname.value}); 

  // editar email
  if (email.value)
  return saveUser("/jogodavelha/user/email", {id, email: email.value}); 

  // editar password
  if (password.value)
  return saveUser("/jogodavelha/user/password", {id, password: password.value}); 
};

function saveUser(url, user) {
  fetch(url,
    { 
      method: "POST", body: JSON.stringify(user), 
      headers: { "Content-type": "application/json" } 
    })
  .then((response)=>{
    response.json().then(responseJson => {
      if (responseJson.message) alert(responseJson.message);
      else if (responseJson.error) alert(responseJson.error);
      clearForm();
      hiddenForm();
      getUsers();
    })
  })
  .catch(error => {
    console.log(error);
  })
}

function getUsers(){
  fetch("/jogodavelha/users")
  .then(response=>response.json())
  .then(data=>{
    users = data.users;
    updateTable();
  })
}

function deleteUser(event) {
  let url = "/jogodavelha/user";
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

function registerUser() {
  clearForm();
  showForm();
  groupNickname.classList.add("active");
  groupEmail.classList.add("active");
  groupPassword.classList.add("active");
}

function editNickname(event) {
  clearForm();
  showForm();
  groupNickname.classList.add("active");
  id = event.target.parentElement.parentElement.id;
}

function editEmail(event) {
  clearForm();
  showForm();
  groupEmail.classList.add("active");
  id = event.target.parentElement.parentElement.id;
}

function editPassword(event) {
  clearForm();
  showForm();
  groupPassword.classList.add("active");
  id = event.target.parentElement.parentElement.id;
}

function showForm() {
  form.classList.add("active");
}

function hiddenForm() {
  form.classList.remove("active");
  groupNickname.classList.remove("active");
  groupEmail.classList.remove("active");
  groupPassword.classList.remove("active");
}

function clearForm() {
  nickname.value = null;
  email.value = null;
  password.value = null;
}

function updateTable() {
  let data = "";

  for (i = 0; i < users.length; i++) {
    data += `<tr id="${users[i]._id}" class="user">
                      <td>${users[i].nickname}</td>
                      <td>${users[i].email}</td>
                      <td>${users[i].wins}</td>
                      <td><button class="btn btn-primary" onclick="editNickname(event)">Editar Nick</button></td>
                      <td><button class="btn btn-primary" onclick="editEmail(event)">Editar Email</button></td>
                      <td><button class="btn btn-primary" onclick="editPassword(event)">Editar Senha</button></td>
                      <td><button class="btn btn-danger" onclick="deleteUser(event)">Deletar</button></td>   
                   </tr>`;
  }

  tbody.innerHTML = data;
}

getUsers()



