document.querySelector('#form1').addEventListener('login', () => {
  const url = 'http://localhost:3000/auth/login'

  fetch(url).then(() => {
    console.log('pagina de login carregada com sucesso')
  }).catch(() => {
    console.log('pagina de login não carregada, tente novamente!')
  })
})

document.querySelector('#form2').addEventListener('register', () => {
  const url = 'http://localhost:3000/auth/register'

  fetch(url).then(() => {
    console.log('pagina de registro carregada com sucesso')
  }).catch(() => {
    console.log('pagina de registro não carregada, tente novamente!')
  })
})






