import JogoDaVelha from "../models/game";

const moviesMatrix = [
    [0, 0], [0, 1], [0, 2], // 0 index -> x
    [1, 0], [1, 1], [1, 2], // 1 index -> y
    [2, 0], [2, 1], [2, 2]
];

const winningCombinations = [
	{ 'combination': [0, 1, 2]},
	{ 'combination': [3, 4, 5]},
	{ 'combination': [6, 7, 8]},
	{ 'combination': [0, 3, 6]},
	{ 'combination': [1, 4, 7]},
	{ 'combination': [2, 5, 8]},
	{ 'combination': [0, 4, 8]},
	{ 'combination': [2, 4, 6]},
];

const computer = (game) => {
    game.gameStateArray = convertMatrixGameToArray(game.gamestate);
    let empty = emptyCells(game);
    
    if (empty.length > 0) {
        let bestMove = miniMax(game, game.guest, empty.length);
        
        return moviesMatrix[bestMove.index];
    }
};

const checkWinner = (gameCurrent, player) => {
    const arrayGamestate = convertMatrixGameToArray(gameCurrent.gamestate);

    for (let k = 0; k < winningCombinations.length; k++) {
        const winningPattern = winningCombinations[k]["combination"];

        let count = 0;
        for (let kk = 0; kk < 3; kk++) {
           if (arrayGamestate[winningPattern[kk]] && arrayGamestate[winningPattern[kk]].nickname === player.nickname) {
                count++;      
           }
                
        }

        if (count === 3) 
            return true;
    }

	return false;
}

const emptyCells = (game) => {
    let empty = [];

    for (let i = 0; i < 9; i++) {
        if (!game.gameStateArray[i]) 
            empty.push(i);
    }

    return empty;
};

const convertMatrixGameToArray = (gameMatrix) => {
    let index = 0;
    let gameArray = new Array(9);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameMatrix[i][j]) {
                gameArray[index] = gameMatrix[i][j];
            }
            index++;
        }
    }

    return gameArray;
};

const convertGameArrayToMatrix = (gameArray) => {
    let index = 0;
    let gameMatrix = new Array(3);

    for (let i = 0; i < 3; i++) {
        gameMatrix[i] = new Array(3);
        for (let j = 0; j < 3; j++) {
            gameMatrix[i][j] = gameArray[index] || null;
            index++;
        }
    }

    return gameMatrix;
};

const miniMax = (gameCurrent, player, depth) => {
    const min = (a, b) => {
		return a < b ? a : b;
	}
	
	const max = (a, b) => {
		return a > b ? a : b;
	}

    let empty = emptyCells(gameCurrent);

    if (checkWinner(gameCurrent, player)) {
        return { score: -1 };
    }

    if (checkWinner(gameCurrent, gameCurrent.guest)) {
        return { score: 1 };
    }

    if (empty.length === 0 || depth === 0) {
        return { score: 0 };
    }

    depth--;

    let movePossibles = [];

    for (let i = 0; i < empty.length; i++) {
        let move = {};
        move.index = empty[i];

        // Cria uma cópia do estado do jogo para simular o movimento
        let newGame = new JogoDaVelha(gameCurrent.creator, gameCurrent.guest);


        newGame.gameStateArray = new Array(9);

        for (let i = 0; i < gameCurrent.gameStateArray.length; i++) {
            if (gameCurrent.gameStateArray[i])
                newGame.gameStateArray[i] = {
                    nickname: gameCurrent.gameStateArray[i].nickname,
                }
        }

        newGame.gameStateArray[empty[i]] = {
            nickname: player.nickname,
        };
        newGame.gamestate = convertGameArrayToMatrix(newGame.gameStateArray);

        let result = miniMax(newGame, player.nickname === gameCurrent.guest.nickname ? gameCurrent.creator : gameCurrent.guest, depth);

        move.score = result.score;
        movePossibles.push(move);
    }

    // Escolhe o movimento com a melhor pontuação
    let bestMove;
    if (player.nickname === gameCurrent.guest.nickname) {
        let bestScore = -Infinity;
        for (let i = 0; i < movePossibles.length; i++) {
            bestScore = max(bestScore, movePossibles[i].score);
            if (movePossibles[i].score === bestScore) {
				bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < movePossibles.length; i++) {
            bestScore = min(bestScore, movePossibles[i].score);
            if (movePossibles[i].score === bestScore) {
				bestMove = i;
            }
        }
    }

    // console.log(movePossibles[bestMove]);
    return movePossibles[bestMove];
};

module.exports = {
    computer,
    winningCombinations
};