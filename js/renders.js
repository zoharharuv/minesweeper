// RENDER DOM
function renderBoard(board) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            // basic class name
            var className = 'cell cell' + i + '-' + j;
            // if not clicked any cells show a CLEAN board
            if (!gGame.isOn && gGame.shownCount === 0) {
                currCell = CLEAN;
                strHTML += `<td class="${className}" oncontextmenu="cellMarked(this,${i},${j})" 
                onclick="cellClicked(this,${i},${j})">${currCell}</td>`;
                continue;
            }
            // if marked show a FLAG
            if (currCell.isMarked) {
                currCell = FLAG;
            }
            // else if the cells isShown = true =>
            else if (currCell.isShown) {
                // if isMine show MINE, if not show the minesAroundCount(max 8)
                if (currCell.isMine) {
                    currCell = MINE;
                } else {
                    currCell = currCell.minesAroundCount;
                    // dynamic className (0-8 = different colors)
                    className += ` shown ${numberColor(currCell)}`;
                    if (currCell === 0) {
                        currCell = CLEAN;
                    }
                }
            }
            else { currCell = CLEAN; }
            strHTML += `<td class="${className}" oncontextmenu="cellMarked(this,${i},${j})" 
            onclick="cellClicked(this,${i},${j})">${currCell}</td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board');
    elContainer.innerHTML = strHTML;
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

// renders entire board(isShown to all)
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

// renders stats on top of board
function renderStats() {
    var elScore = document.querySelector('.score');
    var elFlags = document.querySelector('.flags');
    var elLives = document.querySelector('.lives');
    elScore.innerHTML = `Your score is: ${gGame.shownCount}`;
    elFlags.innerHTML = `You have ${gLevel.MINES - gGame.markedCount} flags remaining`;
    elLives.innerHTML = `You have ${gGame.LIVES} lives left`;
}

// renders end of game
function updateGameEnd() {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    getAllBombs();
    gGameFinished = true;
}

// resets other params
function resetGame() {
    gGame.LIVES = 3;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gMinesCords = [];
    clearInterval(gTimerInterval);
    gGame.isOn = false;
    gStartTime = 0;
    document.querySelector('.timer').innerText = 'Click a tile to start';
    document.querySelector('.score').innerHTML = '&zwnj;';
    document.querySelector('.flags').innerText = 'Good luck!';
    document.querySelector('.lives').innerHTML = '&zwnj;';
    document.querySelector('.smile').innerHTML = '😄';
}

// different colors switch case for CSS
function numberColor(num) {
    switch (num) {
        case 0:
            return null;
        case 1:
            return 'one';
        case 2:
            return 'two';
        case 3:
            return 'three';
        case 4:
            return 'four';
        case 5:
            return 'five';
        case 6:
            return 'six';
        case 7:
            return 'seven';
        case 8:
            return 'eight';
        default: return null;
    }
}