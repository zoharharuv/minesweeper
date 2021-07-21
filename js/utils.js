function getSelector(coord) {
  return '#cell-' + coord.i + '-' + coord.j
}

function isEmptyCell(coord) {
  return gBoard[coord.i][coord.j] === ''
}


// TIMER START
function startTimer() {
  gStartTime = Date.now();
  gTimerInterval = setInterval(function () {
    var msDiff = Date.now() - gStartTime;
    var secs = '' + parseInt((msDiff / 1000) % 60);
    if (secs.length === 1) {
      secs = '0' + secs;
    }

    var min = '' + parseInt(msDiff / 1000 / 60);
    if (min.length === 1) min = '0' + min;

    var passedTime = `${min}:${secs}`;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = passedTime;
  }, 10);
}

// random number inclusive max
function getRandomIntegerInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// random number NOT inclusive max
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}