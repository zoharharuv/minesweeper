'usestrict'
// CONSTS
const FLAG = '🚩';
const MINE = '💣';
const CLEAN = ' ';

// GLOBAL VARS
var gBoard;
// gLevel
var gLevel = {
    SIZE: 4,
    MINES: 2
};
// gGame
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    winCount: gLevel.SIZE ** 2,
    LIVES: 3
};
// Mines locations
var gMinesCords = [];
// timers
var gTimerInterval;
var gStartTime;
var gLastCell = {
    i: 0,
    j: 0
};
// double check for board
var gGameFinished;


// FUNCTIONS 
// disables RMB menu
document.addEventListener('contextmenu', event => event.preventDefault());
// first function that runs
function initGame() {
    gGameFinished = false;
    buildBoard();
    renderBoard(gBoard);
}
// SINGLE CELL CONSTRUCTOR
function buildCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}
// MODEL CONSTRUCTOR
function buildBoard() {
    gBoard = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j] = buildCell();
        }
    }
    return gBoard;
}
// places random mines on MODEL
function placeMines(cellI, cellJ) {
    var count = 0;
    while (count < gLevel.MINES) {
        var rndI = getRandomInteger(0, gLevel.SIZE);
        var rndJ = getRandomInteger(0, gLevel.SIZE);
        if (gBoard[rndI][rndJ].isMine) { continue; }
        if (rndI === cellI && rndJ === cellJ) { continue; }
        gBoard[rndI][rndJ].isMine = true;
        gMinesCords.push({ rndI, rndJ });
        count++;
    }
}

// returns all positions of mines arround called position
function getAllNegs(pos) {
    var negs = [];
    for (var i = pos.i - 1; i <= pos.i + 1 && i < gLevel.SIZE; i++) {
        if (i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1 && j < gLevel.SIZE; j++) {
            if (j < 0 || (i === pos.i && j === pos.j)) continue;
            if (gBoard[i][j].isMine) {
                negs.push({ i, j });
            }
        }
    }
    return negs;
}
// sets the numbers for tiles(negs.length) to be rendered later
function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currPos = { i, j };
            var currMines = getAllNegs(currPos);
            board[i][j].minesAroundCount = currMines.length;
        }
    }
}
// if on mine => gameOver / if not on a mine => if no neighbors => sends pos to expandShown
// each click checks if game won or lost
function cellClicked(elCell, i, j) {
    // update gGame to ON and place mines
    if (!gGameFinished) {
        if (!gGame.isOn) {
            gGame.isOn = true;
            startTimer();
            placeMines(i, j);
            setMinesNegsCount(gBoard);
            console.log('current mines cords', gMinesCords);
        }
        gLastCell.i = i;
        gLastCell.j = j;
        var currCell = gBoard[i][j];
        if (currCell.isMarked) return;
        if (currCell.isShown) return;
        // IF NOT ON A MINE
        if (!currCell.isMine) {
            currCell.isShown = true;
            gGame.shownCount++;
            renderBoard(gBoard);
            renderStats()
            // only expandShown if got no
            if (currCell.minesAroundCount === 0) { expandShown({ i, j }); }
        }
        // IF ON A MINE
        else {
            gGame.LIVES--;
            // if DEAD
            if (gGame.LIVES === 0) {
                isGameOver(true);
                return;
                // 
            } else {
                renderStats();
                renderCell({ i, j }, MINE)
                setTimeout(() => {
                    if(gGame.LIVES !== 0){
                        renderCell({ i, j }, CLEAN)
                    }
                }, 1000);
            }
        }
        isGameOver(false);
    }
}

// marks a cell(FLAG)
function cellMarked(elCell, i, j) {
    if (!gGameFinished) {
        if (!gGame.isOn) {
            gGame.isOn = true;
            startTimer();
            placeMines(i, j);
            setMinesNegsCount(gBoard);
            console.log('current mines cords', gMinesCords);
        }
        var currCell = gBoard[i][j];
        if (currCell.isShown && !currCell.isMarked) return;
        if (gGame.markedCount < gLevel.MINES && !currCell.isMarked) {
            currCell.isMarked = true;
            gGame.markedCount++;
        }
        else if (currCell.isMarked) {
            currCell.isMarked = false;
            gGame.markedCount--;
        }
        renderStats();
        isGameOver(false);
        renderBoard(gBoard);
    }
}


// expands the clean cells around a called pos
function expandShown(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1 && i < gLevel.SIZE; i++) {
        if (i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1 && j < gLevel.SIZE; j++) {
            if (j < 0) continue;
            var currCell = gBoard[i][j];
            if (currCell.isShown) continue;
            if (currCell.isMarked) continue;
            if (!currCell.isMine) {
                currCell.isShown = true;
                gGame.shownCount++;
            }
        }
    }
    renderStats()
    renderBoard(gBoard);
}

// checks if landed on a mine or won the game
function isGameOver(isOnMine) {
    // LOST
    if (isOnMine) {
        document.querySelector('.score').innerText = 'YOU LOST!';
        document.querySelector('.flags').innerText = 'Click a level to try again';
        document.querySelector('.lives').innerHTML = '&zwnj;';
        updateGameEnd();
        var lastCell = document.querySelector('.cell' + gLastCell.i + '-' + gLastCell.j);
        lastCell.style.background = 'red';
        return;
    }
    // WON
    if ((gGame.shownCount + gGame.markedCount) === gGame.winCount) {
        document.querySelector('.score').innerText = 'YOU WON!';
        document.querySelector('.flags').innerText = 'Click a level to restart';
        updateGameEnd();
        return;
    }
}

// button controler
function setLevel(elBtn) {
    var level = elBtn.innerText;
    switch (level) {
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            gGame.winCount = gLevel.SIZE ** 2
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gGame.winCount = gLevel.SIZE ** 2
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gGame.winCount = gLevel.SIZE ** 2
            break;
    }
    resetGame();
    initGame();
}
