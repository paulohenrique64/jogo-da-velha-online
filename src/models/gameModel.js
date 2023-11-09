class jogoDaVelha {

  // construtor da classe
  constructor(creator, guest) {
    this.gameState = [['', '', ''], ['', '', ''], ['', '', '']]
    this.winner = null
    this.tie = false;
    this.creator = creator
    this.creator.point = 'X'
    this.guest = guest
    this.guest.point = 'O'
  }

  // verifica se o jogo empatou
  verifyTie() {
    let points = 0

    for (let i = 0; i < 3; i = i + 1) {
      for (let j = 0; j < 3; j = j + 1) {
        if (this.gameState[i][j] == 'X' || this.gameState[i][j] == 'O') {
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
      if (this.gameState[j][0] == this.creator.point & this.gameState[j][1] == this.creator.point & this.gameState[j][2] == this.creator.point) {
        this.winner = this.creator
      }

      if (this.gameState[j][0] == this.guest.point & this.gameState[j][1] == this.guest.point & this.gameState[j][2] == this.guest.point) {
        this.winner = this.guest
      }
    }
  }

  // marcar um ponto no jogo da velha
  setPoint(player, row, col) {
    // se nao houver empate nem ganhador, o ponto é marcado no jogo
    if (!this.winner && !this.tie) {
      if (this.gameState[row][col] != 'X' || this.gameState[row][col] != 'O') {
        if (player.id == this.creator.id) {
          this.gameState[row][col] = this.creator.point
        } else {
          this.gameState[row][col] = this.guest.point
        }
      }

      console.log(this.gameState)
    }

    this.verifyWinner()
    this.verifyTie()
  }
}

export default jogoDaVelha;