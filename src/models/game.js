export default class JogoDaVelha {
  //construtor
  constructor(creator, guest) {
    this.creator = creator;
    this.guest = guest;
    this.resetGame(creator);
  }

  // reseta o jogo atual
  resetGame(starterPlayer) {
    this.gamestate = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
    this.currentPlayer = starterPlayer;
    this.winner = undefined;
    this.tie = false;
  }

  // marcar um ponto no jogo da velha
  setPoint(player, row, col) {
    if (!this.end() && !this.gamestate[row][col] && this.currentPlayer === player) {
      this.gamestate[row][col] = player;
      this.switchCurrentPlayer();
      this.verifyWinner();
      this.verifyTie();
      return true;
    }

    // caso o ponto não seja marcado
    return false;
  }

  // troca o jogador atual
  switchCurrentPlayer() {
    if (this.currentPlayer == this.creator) this.currentPlayer = this.guest;  
    else this.currentPlayer = this.creator;
  }

  // verifica se existe um ganhador
  verifyWinner() {
    // se o jogo tiver empatado, não verifica se existe um ganhador
    if (this.end()) return; 

    for (let j = 0; j < 3; j++) {
      // verifica se o creator ganhou o jogo
      if ( (this.gamestate[j][0] == this.creator & this.gamestate[j][1] == this.creator & this.gamestate[j][2] == this.creator)    // linhas
        || (this.gamestate[0][j] == this.creator & this.gamestate[1][j] == this.creator & this.gamestate[2][j] == this.creator)    // colunas
        || (this.gamestate[0][0] == this.creator & this.gamestate[1][1] == this.creator & this.gamestate[2][2] == this.creator)    // diagonal principal
        || (this.gamestate[0][2] == this.creator & this.gamestate[1][1] == this.creator & this.gamestate[2][0] == this.creator)) { // diagonal secundária
        return this.setWinner(this.creator);
      }

      // verifica se o guest ganhou o jogo
      if  ((this.gamestate[j][0] == this.guest & this.gamestate[j][1] == this.guest & this.gamestate[j][2] == this.guest)    // linhas
        || (this.gamestate[0][j] == this.guest & this.gamestate[1][j] == this.guest & this.gamestate[2][j] == this.guest)    // colunas
        || (this.gamestate[0][0] == this.guest & this.gamestate[1][1] == this.guest & this.gamestate[2][2] == this.guest)    // diagonal principal
        || (this.gamestate[0][2] == this.guest & this.gamestate[1][1] == this.guest & this.gamestate[2][0] == this.guest)) { // diagonal secundária
        return this.setWinner(this.guest);
      }
    }
  }
  
  // seta um novo ganhador ao jogo
  setWinner(winner) {
    this.winner = winner;
  }

  // verifica se o jogo acabou
  end() {
    if (this.winner || this.tie) 
      return true;
    
    return false;
  }

  // verifica se o jogo empatou
  verifyTie() {
    // se o jogo tiver um ganhador, não verifica se empatou
    if (this.end()) return;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!this.gamestate[i][j]) {
          // ainda há uma posição vazia
          return;
        }
      }
    }

    // se chegar até aqui --> não há ganhador nem posições vazias
    this.tie = true;
  }
}
