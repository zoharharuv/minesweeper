'usestrict'
// CONSTS
const FLAG = '🚩';
const MINE = '💣';
const CLEAN = ' ';

// GLOBAL VARS
var gBoard;
// gLevel
var gLevelName = 'Beginner';
var gLevel = {
    SIZE: 4,
    MINES: 2
};
// gGame
var gGame = {
    isOn: false,
    isHint: false,
    shownCount: 0,
    markedCount: 0,
    winCount: gLevel.SIZE ** 2,
    LIVES: 3,
    HINTS: 3,
    SAFES: 3
};
// Mines locations
var gMinesCords = [];
// timers
var gTimerInterval;
var gStartTime;
var gHighscore;
// double check for board
var gGameFinished;
var gIsManual;
var gIsPlacedMines;
// last cellclicked
var gLastCell = {
    i: 0,
    j: 0
};
// positions of safe clicks
var gSafeCells = [];
// string of lives
var gLiveStr = '❤ ❤ ❤';
// states of last games
var gStates;


// FUNCTIONS 
// disables RMB menu
document.addEventListener('contextmenu', event => event.preventDefault());
// first function that runs
function initGame() {
    // gStates = [];
    renderScore(gLevelName);
    gGameFinished = false;
    gIsManual = false;
    gIsPlacedMines = false;
    buildBoard();
    // addState();
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
    // if manual mode is on
    if (gIsManual) {
        var currCell = gBoard[i][j];
        currCell.isMine = true;
        renderCell({ i, j }, MINE);
        gIsPlacedMines = true;
        return;
    }
    // update gGame to ON and place mines
    if (!gGameFinished) {
        if (!gGame.isOn) {
            gGame.isOn = true;
            startTimer();
            // if didnt place any bombs
            if (!gIsPlacedMines) {
                placeMines(i, j);
            } else { renderBoard(gBoard); }
            setMinesNegsCount(gBoard);
        }
        gLastCell.i = i;
        gLastCell.j = j;
        var currCell = gBoard[i][j];
        if (currCell.isMarked) return;
        if (currCell.isShown) return;
        // if HINT is not-active
        if (!gGame.isHint) {
            // IF NOT ON A MINE
            if (!currCell.isMine) {
                if (currCell.minesAroundCount === 0) { expandShown({ i, j }); }
                else {
                    currCell.isShown = true;
                    gGame.shownCount++;
                }
                // addState();
                renderBoard(gBoard);
                renderStats()
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
                    renderCell({ i, j }, MINE);
                    document.querySelector('.smile').innerHTML = '😢';
                    setTimeout(() => {
                        if (gGame.LIVES !== 0) {
                            document.querySelector('.smile').innerHTML = '😄';
                            renderCell({ i, j }, CLEAN);
                            // addState();
                            renderBoard(gBoard);
                        }
                    }, 1000);
                }
            }
            isGameOver(false);
            // if HINT is used
        } else {
            gGame.HINTS--;
            // get all unshown positions
            var hintedNegs = getAllNegsHinted({ i, j });
            renderBoard(gBoard);
            gGame.isHint = false;
            // after 1 sec unrender them
            setTimeout(() => {
                hideAllNegsHinted(hintedNegs);
                renderBoard(gBoard);
            }, 1000);
        }
    }
}

// marks a cell(FLAG)
function cellMarked(elCell, i, j) {
    if (!gIsManual) {
        if (!gGameFinished) {
            if (!gGame.isOn) {
                gGame.isOn = true;
                startTimer();
                placeMines(i, j);
                setMinesNegsCount(gBoard);
            }
            var currCell = gBoard[i][j];
            if (currCell.isShown) {
                return;
            }
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
}

// if not mine or marked and got negs show only it
function expandShownRecursion(i, j) {
    var currCell = gBoard[i][j];
    // the stop case
    if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
        currCell.isShown = true;
        gGame.shownCount++;
        return true;
    }
    return false;
}

// expands the clean cells around a called pos
function expandShown(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1 && i < gLevel.SIZE; i++) {
        if (i < 0) continue;
        for (var j = pos.j - 1; j <= pos.j + 1 && j < gLevel.SIZE; j++) {
            if (j < 0) continue;
            currCell = gBoard[i][j];
            // RECURSION TEST STOP CASE
            if (currCell.minesAroundCount > 0) { expandShownRecursion(i, j) }
            // RECURSION TEST 
            else {
                if (currCell.isMarked) continue;
                if (currCell.isShown) continue;
                if (!currCell.isMine) {
                    var currCords = {
                        i,
                        j
                    };
                    currCell.isShown = true;
                    expandShown(currCords);
                    gGame.shownCount++;
                }
            }
        }
    }
    renderStats()
    renderBoard(gBoard);
}






