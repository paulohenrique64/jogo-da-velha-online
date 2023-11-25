let tbody = document.querySelector("tbody");
let form = document.querySelector(".form-wrapper");
let saveBtn = document.querySelector(".save");
let cancelBtn = document.querySelector(".cancel");
let nickname = document.querySelector("#nickname");
let email = document.querySelector("#email");
let wins = document.querySelector("#wins");
let groupNickname = document.querySelector(".group-nickname");
let groupEmail =  document.querySelector(".group-email");
let groupPassword = document.querySelector(".group-password");

let id = null;
let user;

cancelBtn.onclick = function () {
  hiddenForm();
};

saveBtn.onclick = function () {
  // editar nickname
  if (nickname.value)
    return saveUser("http://localhost:3000/user/nickname", {id, nickname: nickname.value}); 

  // editar email
  if (email.value)
    return saveUser("http://localhost:3000/user/email", {id, email: email.value}); 

  // editar password
  if (password.value)
    return saveUser("http://localhost:3000/user/password", {id, password: password.value}); 
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
      getUser();
    })
  })
  .catch(error => {
    console.log(error);
  })
}

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
  document.querySelector("#nickname").value = user.nickname;
  document.querySelector("#email").value = user.email;
  id = event.target.parentElement.parentElement.id;
}

function deleteUser(event) {
  let url = "http://localhost:3000/user";
  id = event.target.parentElement.parentElement.id;
  fetch(url+"/"+id, {method:"DELETE"})
  .then((response)=>{

    if (response.status === 201) {
      alert("Ops! Parece que você se deletou não é mesmo? hahaha! Acho que esqueci de adicionar aquela dupla verificação. Sua conta agora é igual ao resultado de uma divisão por zero! hahaha! Bom momento e até mais!");
      location.reload(); 
    } else {
      response.json().then(responseJson => {
        if (responseJson.error) alert(responseJson.error);
        getUser();
      })
    }

  })
  .catch(error => {
    console.log(error);
  })
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

  data += `<tr id="${user._id}">
                    <td>${user.nickname}</td>
                    <td>${user.email}</td>
                    <td>${user.wins}</td>
                    <td><button class="btn btn-primary" onclick="editNickname(event)">Editar Nick</button></td>
                    <td><button class="btn btn-primary" onclick="editEmail(event)">Editar Email</button></td>
                    <td><button class="btn btn-primary" onclick="editPassword(event)">Editar Senha</button></td>
                    <td><button class="btn btn-danger" onclick="deleteUser(event)">Excluir Conta</button></td>   
                  </tr>`;


  tbody.innerHTML = data;
}

getUser()



