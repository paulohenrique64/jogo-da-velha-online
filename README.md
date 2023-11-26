![1](https://github.com/paulohenrique64/jogo-da-velha-online-js/blob/main/public/images/game-gif.gif)

# Jogo da Velha Online

Jogo de velha online feito utilizando a biblioteca Socket.IO

- Além do Socket.io, também foram utilizadas outras tecnologias como Node.js, Express, CSS, HTML e Java Script
- Suporta múltiplas partidas ao mesmo tempo
- Simples e rápido de se iniciar um novo jogo

# Como rodar localmente

#### Requisitos: ter o Node e o NPM instalados

- Clone a branch main deste repositório para seu computador
- Abra a pasta do projeto
- Certifique-se de criar o arquivo ".env" na raiz do repositorio
  - Utilize o ".env.example" como exemplo e insira os dados do seu banco de dados (mongodb) e utilize os dados do seu <a href="https://mailtrap.io">Mailer</a>
- Após isso execute os seguintes comandos:
  - <strong>npm install</strong>
  - <strong>npm start</strong>

E pronto! Mantenha o terminal aberto e clique <a href="http://localhost:3000">aqui</a> para abrir o projeto no seu navegador.

# Usuários admins

- Para definir um usuário como <strong>admin</strong>, é necessário alterar manualmente o campo "isAdmin" no banco de dados, setando o campo como true. Usuários admins tem acesso a uma página de configurações diferente da página exibida para jogadores não admins.

- Página de configurações dos Jogadores admins

  - Serão exibidos os dados de todos os jogadores cadastrados no site
  - O admin poderá registrar um novo jogador
  - O admin podera editar email, nickname, e senha de si mesmo e de qualquer jogador
  - O admin poderá excluir a conta de si mesmo e de qualquer jogador

- Página de configurações dos Jogadores não admins
  - Será exibido somente os dados do próprio usuário
  - O usuário podera editar email, nickname, e senha de si mesmo
  - O usuário poderá excluir a conta de si mesmo
