import { winningCombinations } from "../util/miniMax";

export default class JogoDaVelha {
  constructor(creator, guest) {
    this.creator = creator;
    this.guest = guest;
    this.resetGame(creator);
  }

  resetGame(starterPlayer) {
    this.gamestate = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
    this.currentPlayer = starterPlayer;
    this.winner = undefined;
    this.winCombination = undefined;
    this.tie = false;
  }

  setPoint(player, row, col) {
    if (!this.checkEnd() && !this.gamestate[row][col] && this.currentPlayer.nickname === player.nickname) {
      this.gamestate[row][col] = player;
      this.switchCurrentPlayer();
      return true;
    }

    return false;
  }

  switchCurrentPlayer() {
    if (this.currentPlayer.nickname === this.creator.nickname) 
      this.currentPlayer = this.guest;  
    else 
      this.currentPlayer = this.creator;
  }

  checkWinner() {
    let players = [this.creator, this.guest];
    let gameStateArray = this.gamestate.flat();

    for (let k = 0; k < 2; k++) {
      let player = players[k];

      for (let i = 0; i < winningCombinations.length; i++) {
        let count = 0;
  
        for (let j = 0; j < 3; j++)  {
          if (gameStateArray[winningCombinations[i]["combination"][j]] && gameStateArray[winningCombinations[i]["combination"][j]].nickname === player.nickname) {
            count++;
          }
        }
          
        if (count === 3) {
          this.winner = player;
          this.winCombination = winningCombinations[i];
          return true;
        }
      }
    }

    return false;
  }

  checkTie() {
    let gameStateArray = this.gamestate.flat();

    if (this.checkWinner()) return false;
    
    for (let i = 0; i < gameStateArray.length; i++) 
      if (!gameStateArray[i]) return false;
        
    this.tie = true;
    return true;
  }

  checkEnd() {
    return this.checkWinner() || this.checkTie();
  }
}
