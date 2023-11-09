class jogoDaVelha {

  // construtor da classe
  constructor(creator, guest) {
    this.creator = creator
    this.guest = guest
    this.gameState = [['', '', ''], ['', '', ''], ['', '', '']]
    this.currentPlayer = creator
    this.creator.point = 'X'
    this.guest.point = 'O'
    this.winner = null
    this.tie = false;
  }

  // troca o jogador atual
  switchCurrentPlayer() {
    if (this.currentPlayer == this.creator) {
      this.currentPlayer = this.guest
    } else {
      this.currentPlayer = this.creator
    }
  }

  // verifica se o jogo empatou
  verifyTie() {
    let points = 0

    for (let i = 0; i < 3; i = i + 1) {
      for (let j = 0; j < 3; j = j + 1) {
        if (this.gameState[i][j] == this.creator || this.gameState[i][j] == this.guest) {
          points = points + 1
        }
      }
    }

    if (points == 9) 
      this.tie = true
  }

  // se existe um ganhador do jogo da velha, seta ao atribuito winner e retorna o vencedor
  verifyWinner() {
    for (let j = 0; j < 3; j = j + 1) {

      // verifica se o creator ganhou o jogo pelas lihas
      if (this.gameState[j][0] == this.creator & this.gameState[j][1] == this.creator & this.gameState[j][2] == this.creator) {
        this.winner = this.creator
      }

      // verifica se o guest ganhou o jogo pelas lihas
      if (this.gameState[j][0] == this.guest & this.gameState[j][1] == this.guest & this.gameState[j][2] == this.guest) {
        this.winner = this.guest
      }

      // verifica se o creator ganhou o jogo pelas colunas
      if (this.gameState[0][j] == this.creator & this.gameState[1][j] == this.creator & this.gameState[2][j] == this.creator) {
        this.winner = this.creator
      }

      // verifica se o guest ganhou o jogo pelas colunas
      if (this.gameState[0][j] == this.guest & this.gameState[1][j] == this.guest & this.gameState[2][j] == this.guest) {
        this.winner = this.guest
      }
    }

    // verifica se o creator ganhou o jogo pelas diagonais
    if (this.gameState[0][0] == this.creator & this.gameState[1][1] == this.creator & this.gameState[2][2] == this.creator) {
      this.winner = this.creator
    }

    // verifica se o guest ganhou o jogo pelas diagonais
    if (this.gameState[0][0] == this.guest & this.gameState[1][1] == this.guest & this.gameState[2][2] == this.guest) {
      this.winner = this.guest
    }
  }

  // marcar um ponto no jogo da velha
  setPoint(player, row, col) {
    // se nao houver empate nem ganhador, o ponto é marcado no jogo
    if (!this.winner && !this.tie) {
      if (this.gameState[row][col] != this.guest && this.gameState[row][col] != this.creator) {

        if (player.id == this.creator.id) {
          this.gameState[row][col] = this.creator
        } else {
          this.gameState[row][col] = this.guest
        }

      }
    }

    this.verifyWinner()
    this.verifyTie()
  }
}

export default jogoDaVelha;