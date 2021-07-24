// MANUAL functions
function setManual() {
    if (!gGameFinished) {
        if (!gGame.isOn) {
            // switch manual to TRUE/FALSE
            gIsManual = !gIsManual;
            if (gIsManual) {
                document.querySelector('.timer').innerHTML = 'Manual mode ON!';
            } else {
                document.querySelector('.timer').innerHTML = 'Manual mode OFF!';
            }
        }
    }

}

// GETS rnd clean SINGLE CELL #3
function getCleanCells() {
    var counter = 0;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine &&
                !gBoard[i][j].isShown) {
                gSafeCells.push({ i, j });
                counter++;
            }
        }
    }
}
// GETS rnd clean CELLS^^^ #2
function getCleanCell() {
    var rndNum = getRandomInteger(0, gSafeCells.length);
    var rndPos = gSafeCells.splice(rndNum, 1)[0];
    return rndPos;
}

// SAFE CLICK functions^^^ #1
function safeClicked(elBtn) {
    if (!gGame.isOn) return;
    if (gGame.SAFES < 1) return;
    getCleanCells();
    if (gSafeCells.length === 0) return;
    gGame.SAFES--;
    var rndPos = getCleanCell();
    gBoard[rndPos.i][rndPos.j].isShown = true;
    renderBoard(gBoard);
    setTimeout(() => {
        gBoard[rndPos.i][rndPos.j].isShown = false;
        renderBoard(gBoard);
    }, 2000);
    isCellFound = true;
    if (gGame.SAFES === 0) {
        elBtn.style.background = 'lightcoral';
        elBtn.style.cursor = 'not-allowed';
        elBtn.innerText = 'Out of safe clicks';
    } else {
        elBtn.innerText = `${gGame.SAFES} Safe clicks`;
    }
}

// HINT IMG functions
function clickedHint(elHint) {
    if (gGame.isHint || gGameFinished || gIsManual) { return; }
    gGame.isHint = true;
    elHint.src = "img/on.png";
    elHint.removeAttribute("onclick");
    elHint.style.cursor = "not-allowed";
    return;
}

// (isShown to all bombs if lost or won)
function getAllBombs() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) {
                currCell.isShown = true;
            }
            if (currCell.isMarked && currCell.isMine) {
                currCell.isMarked = false;
            } else { continue; }
        }
    }
    renderBoard(gBoard);
}
// LIVES switch case
function getLivesString() {
    switch (gGame.LIVES) {
        case 3:
            gLiveStr = '❤ ❤ ❤';
            break;
        case 2:
            gLiveStr = '❤ ❤';
            break;
        case 1:
            gLiveStr = '❤';
            break;
        case 0:
            gLiveStr = ' ';
            break;
    }
}
// LEVEL BUTTON fuctions
function setLevel(elBtn) {
    gLevelName = elBtn.innerText;
    switch (gLevelName) {
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
    forceReset();
}

// SMILE functions
function forceReset() {
    resetGame();
    initGame();
}

// resets all params
function resetGame() {
    gGame.LIVES = 3;
    gGame.HINTS = 3;
    gGame.SAFES = 3;
    gGame.isHint = false;
    gIsManual = false;
    gIsPlacedMines = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gMinesCords = [];
    gSafeCells = [];
    clearInterval(gTimerInterval);
    gGame.isOn = false;
    gStartTime = 0;
    renderFreshStats();
}

// clears intervals and gGame playing state
function updateGameEnd() {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    getAllBombs();
    gGameFinished = true;
}

// checks if landed on a mine or won the game
function isGameOver(isOnMine) {
    // LOST
    if (isOnMine) {
        renderLost()
        updateGameEnd();
        renderBoard(gBoard);
        // render last mine clicked
        var lastCell = document.querySelector(
            '.cell' + gLastCell.i + '-' + gLastCell.j);
        lastCell.style.background = 'red';
        return;
    }
    // WON
    if ((gGame.shownCount + gGame.markedCount) === gGame.winCount) {
        gHighscore = (Date.now() - gStartTime);
        setHighscore(gHighscore);
        renderWon()
        updateGameEnd();
        return;
    }
}

// change the highscore in LOCALSTORAGE
function setHighscore(score) {
    if (!gIsPlacedMines) {
        var prevHighScore = localStorage.getItem(gLevelName);
        var newHighScore = score / 1000;
        if (localStorage.getItem(gLevelName) === null
            || newHighScore < prevHighScore) {
            localStorage.setItem(gLevelName, newHighScore);
            var elHighScore = document.querySelector('.highscore');
            elHighScore.innerText = 'Current Highscore: ' + newHighScore + ' seconds!';
        }
    }
}



// pushes a the last overall state to the gStates for UNDO button
// function addState() {
//     var boardState = gBoard.slice();
//     var gameState = gGame.constructor();
//     for (var key in gGame) {
//         if (gGame.hasOwnProperty(key)) gameState[key] = gGame[key];
//     }
//     gStates.push({ boardState, gameState });
// }

// UNDO BUTTON functions^^^
// function undoClicked(elBtn) {
//     if (gStates.length < 1) { return; }
//     gStates.pop();
//     var lastState = gStates.pop();
//     gBoard = lastState.boardState.slice();
//     for (var key in lastState.gameState) {
//         if (gGame.hasOwnProperty(key)) gGame[key] = lastState.gameState[key];
//     }
//     renderStats();
//     renderBoard(gBoard);
// }