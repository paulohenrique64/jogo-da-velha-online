class jogoDaVelha {
  // construtor da classe
  constructor(creator, guest) {
    this.creator = creator
    this.guest = guest
    this.gamestate = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]]
    this.currentPlayer = creator
    this.creator.point = 'X'
    this.guest.point = 'O'
    this.winner = undefined
    this.tie = false;
  }

  // troca o jogador atual
  switchCurrentPlayer() {
    if (this.currentPlayer == this.creator) 
      this.currentPlayer = this.guest;
    else 
      this.currentPlayer = this.creator;
  }

  end() {
    if (this.winner || this.tie)  
      return true;
    else  
      return false;
  }

  // verifica se o jogo acabou
  verifyTie() {
    let points = 0;
  
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.gamestate[i][j]) {
          points++;
        }
      }
    }
    
    if (points == 9) {
      this.tie = true;
    }
  }

  // se existe um ganhador do jogo da velha, seta ao atribuito winner e retorna o vencedor
  verifyWinner() {
    for (let j = 0; j < 3; j = j + 1) {
      // verifica se o creator ganhou o jogo pelas lihas
      if (this.gamestate[j][0] == this.creator & this.gamestate[j][1] == this.creator & this.gamestate[j][2] == this.creator) {
        this.winner = this.creator
        return;
      }

      // verifica se o guest ganhou o jogo pelas lihas
      if (this.gamestate[j][0] == this.guest & this.gamestate[j][1] == this.guest & this.gamestate[j][2] == this.guest) {
        this.winner = this.guest
        return;
      }

      // verifica se o creator ganhou o jogo pelas colunas
      if (this.gamestate[0][j] == this.creator & this.gamestate[1][j] == this.creator & this.gamestate[2][j] == this.creator) {
        this.winner = this.creator
        return;
      }

      // verifica se o guest ganhou o jogo pelas colunas
      if (this.gamestate[0][j] == this.guest & this.gamestate[1][j] == this.guest & this.gamestate[2][j] == this.guest) {
        this.winner = this.guest
        return;
      }
    }

    // verifica se o creator ganhou o jogo pelas diagonais
    if (this.gamestate[0][0] == this.creator & this.gamestate[1][1] == this.creator & this.gamestate[2][2] == this.creator) {
      this.winner = this.creator
      return;
    }

    // verifica se o guest ganhou o jogo pelas diagonais
    if (this.gamestate[0][0] == this.guest & this.gamestate[1][1] == this.guest & this.gamestate[2][2] == this.guest) {
      this.winner = this.guest
      return;
    }
  }

  // marcar um ponto no jogo da velha
  setPoint(player, row, col) {
    if (!this.winner && !this.tie && !this.gamestate[row][col] && this.currentPlayer == player) {
      this.gamestate[row][col] = player;
      this.switchCurrentPlayer();
      this.verifyTie();
      this.verifyWinner();
      return true;
    }
    return false;
  }
}

export default jogoDaVelha;