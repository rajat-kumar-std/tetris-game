function startGame() {
  const COL_COUNT = 10;
  const ROW_COUNT = 2 * COL_COUNT;

  let SCALE_FACTOR = 20;

  const WORLD_HEIGHT = ROW_COUNT * SCALE_FACTOR;
  const WORLD_WIDTH = COL_COUNT * SCALE_FACTOR;

  document.querySelector('.model').classList.add('hide');
  const scoreBox = document.querySelector('#score');
  const lineBox = document.querySelector('#line');
  const highScoreBox = document.querySelector('#high_score');

  const canvas = document.querySelector('#myCanvas');
  const ctx = canvas.getContext('2d');

  //----------------------
  const nextShape = document.querySelector('#nextPiece');
  nextShape.height = 4 * SCALE_FACTOR;
  nextShape.width = 4 * SCALE_FACTOR;
  const nextCtx = nextShape.getContext('2d');
  nextCtx.scale(20, 20);
  //-----------------------
  canvas.height = WORLD_HEIGHT;
  canvas.width = WORLD_WIDTH;

  ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //===============
  const colors = [
    null,
    '#ECECEC', // .
    '#00FFFF', // i cyan
    '#0000FF', // J blue
    '#FF8100', // L orange
    '#FFFF00', // o yellow
    '#00FF00', //s green
    '#FF00FF', // t purple
    '#ae00da', //u brown
    '#FF0000', //z red
  ];

  const pieces = '.IJLOSTUZ';
  // let currentPiece;
  let nextMatrix = createPiece();
  const dataMatrix = initDataMatrix(ROW_COUNT, COL_COUNT); //20 row , 10 column
  let dropSpeed = 1000;
  let dropInterval = dropSpeed;
  const player = {
    pos: {
      x: 0,
      y: 0,
    },
    piece: null,
    score: 0,
    line: 0,
  };
  resetPlayer();

  function initDataMatrix(h, w) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  function createPiece(type = pieces[(Math.random() * pieces.length) | 0]) {
    switch (type) {
      case '.':
        currentPiece = '.';
        return [[1]];
      case 'I':
        currentPiece = 'I';
        return [
          [0, 0, 0, 0],
          [2, 2, 2, 2],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ];
      case 'J':
        currentPiece = 'J';
        return [
          [0, 0, 0],
          [3, 3, 3],
          [0, 0, 3],
        ];
      case 'L':
        currentPiece = 'L';
        return [
          [0, 0, 0],
          [4, 4, 4],
          [4, 0, 0],
        ];
      case 'O':
        currentPiece = 'O';
        return [
          [5, 5],
          [5, 5],
        ];
      case 'S':
        currentPiece = 'S';
        return [
          [0, 6, 6],
          [6, 6, 0],
          [0, 0, 0],
        ];
      case 'T':
        currentPiece = 'T';
        return [
          [0, 7, 0],
          [7, 7, 7],
          [0, 0, 0],
        ];
      case 'U':
        currentPiece = 'U';
        return [
          [8, 0, 8],
          [8, 8, 8],
          [0, 0, 0],
        ];
      case 'Z':
        currentPiece = 'Z';
        return [
          [9, 9, 0],
          [0, 9, 9],
          [0, 0, 0],
        ];
    }
  }

  function refreshFrame() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(dataMatrix, {
      x: 0,
      y: 0,
    });
    drawMatrix(player.piece, player.pos);
  }

  function drawMatrix(matrix, pos) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = colors[value];
          ctx.fillRect(x + pos.x, y + pos.y, 1, 1);
        }
      });
    });
  }

  function drawNextMatrix(matrix) {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextShape.width, nextShape.height);
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          nextCtx.fillStyle = colors[value];
          nextCtx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  function updateScore() {
    let p_hs = window.localStorage.getItem('p_hs');

    if (!p_hs) {
      p_hs = player.score;
      window.localStorage.setItem('p_hs', p_hs);
    }

    if (player.score > p_hs) {
      p_hs = player.score;
      window.localStorage.setItem('p_hs', p_hs);
    }

    scoreBox.textContent = player.score;
    lineBox.textContent = player.line;
    highScoreBox.textContent = p_hs;
  }

  function gameOver() {
    alert(`Game Over, You scored: ${player.score}`);
    dataMatrix.forEach((row) => row.fill(0));
    player.score = 0;
    player.line = 0;
    dropSpeed = 1000;
    dropInterval = dropSpeed;
  }

  function resetPlayer() {
    updateScore();

    player.piece = nextMatrix;
    nextMatrix = createPiece();
    drawNextMatrix(nextMatrix);
    player.pos = {
      x: ((dataMatrix[0].length / 2) | 0) - ((player.piece[0].length / 2) | 0),
      y: 0,
    };
    increaseSpeed();
    if (collide(dataMatrix, player)) {
      gameOver();
    }
  }

  // startGame();

  window.requestAnimationFrame(update);
  let lastTime;
  let dropCounter = 0;

  function update(currentTime) {
    //update loop
    if (lastTime == null) {
      lastTime = currentTime;
      window.requestAnimationFrame(update);
      return;
    }
    const deltaT = currentTime - lastTime;
    lastTime = currentTime;
    dropCounter += deltaT;
    if (dropCounter >= dropInterval) {
      playerDrop();
    }
    refreshFrame();
    window.requestAnimationFrame(update);
  }

  function playerDrop() {
    player.pos.y++;
    dropCounter = 0;
    if (collide(dataMatrix, player)) {
      player.pos.y--;
      mergeToDataMatrix(dataMatrix, player);
      clearLine();
      resetPlayer();
    }
  }

  function increaseSpeed() {
    if (dropSpeed > 100) {
      dropSpeed -= 5;
      dropInterval = dropSpeed;
    }
  }

  //collide implement then save data (merge) then others;
  function collide(dataMatrix, player) {
    for (let y = 0; y < player.piece.length; ++y) {
      for (let x = 0; x < player.piece[y].length; ++x) {
        if (
          player.piece[y][x] !== 0 &&
          (dataMatrix[y + player.pos.y] &&
            dataMatrix[y + player.pos.y][x + player.pos.x]) !== 0
        ) {
          return true;
        }
      }
    }
    return false;
  }

  function mergeToDataMatrix(dataMatrix, player) {
    player.piece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          dataMatrix[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
    // console.table(dataMatrix);
  }

  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(dataMatrix, player)) {
      player.pos.x -= dir;
    }
  }

  function playerRotate(player) {
    rotate(player, 1);

    while (player.pos.x < 0) player.pos.x++;

    while (player.pos.x + player.piece[0].length - 1 > dataMatrix[0].length - 1)
      player.pos.x--;

    // check collide if collide then rotate back
    if (collide(dataMatrix, player)) {
      rotate(player, -1);
    }

    function rotate(player, dir) {
      for (let y = 0; y < player.piece.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [player.piece[y][x], player.piece[x][y]] = [
            player.piece[x][y],
            player.piece[y][x],
          ];
        }
      }
      if (dir > 0) player.piece.forEach((row) => row.reverse());
      if (dir < 0) player.piece.reverse();
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') playerMove(-1);
    else if (e.key === 'ArrowRight') playerMove(1);
    else if (e.key === 'ArrowDown') {
      if (dropInterval === Number.MAX_VALUE) dropInterval = dropSpeed;
      playerDrop();
      player.score += 1;
    } else if (e.key === 'ArrowUp') {
      dropInterval = Number.MAX_VALUE;
    } else if (e.code === 'Space' || e.key === '') {
      playerRotate(player);
    }
  });

  function clearLine() {
    for (let y = dataMatrix.length - 1; y > 0; --y) {
      let isFilled = true;
      for (let x = 0; x < dataMatrix[y].length; x++) {
        if (dataMatrix[y][x] === 0) {
          isFilled = false;
          break;
        }
      }
      if (isFilled) {
        player.score += 10;
        player.line++;
        const row = dataMatrix.splice(y, 1)[0].fill(0); //delete 1 that y index line and fill with 0
        dataMatrix.unshift(row);
        y++;
        increaseSpeed();
      }
    }
  }
}
