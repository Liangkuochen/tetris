const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10, ROWS = 20, BLOCK = 30;
const NEXT_BLOCK = 24;

const COLORS = {
  I: "#00d9ff", J: "#4d7cff", L: "#ff9f1c",
  O: "#ffd60a", S: "#2ec4b6", T: "#b967ff", Z: "#ff4d6d"
};

const SHAPES = {
  I: [[1,1,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  T: [[0,1,0],[1,1,1]],
  Z: [[1,1,0],[0,1,1]]
};

const TYPES = Object.keys(SHAPES);
const LEVEL_SPEED = [800, 650, 500, 350, 220];
const LEVEL_LINES = [0, 5, 12, 20, 30];

let board, piece, nextPiece;
let score = 0, lines = 0, level = 1;
let gameOver = false, paused = false, running = false;
let dropCounter = 0, lastTime = 0, animationId;

const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const highScoreEl = document.getElementById("highScore");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

let highScore = Number(localStorage.getItem("tetrisHighScore") || 0);
highScoreEl.textContent = highScore;

function createBoard() {
  return Array.from({length: ROWS}, () => Array(COLS).fill(null));
}

function randomPiece() {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const shape = SHAPES[type].map(row => [...row]);
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0
  };
}

function resetGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  gameOver = false;
  paused = false;
  running = true;
  dropCounter = 0;
  lastTime = performance.now();
  nextPiece = randomPiece();
  spawnPiece();
  hideMessage();
  updateUI();
  startBtn.textContent = "重新開始";
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(update);
}

function spawnPiece() {
  piece = nextPiece || randomPiece();
  piece.x = Math.floor((COLS - piece.shape[0].length) / 2);
  piece.y = 0;
  nextPiece = randomPiece();
  drawNext();

  if (collides(piece)) {
    gameOver = true;
    running = false;
    showMessage("遊戲結束\n按「重新開始」再挑戰一次");
  }
}

function collides(p, dx = 0, dy = 0, testShape = p.shape) {
  for (let y = 0; y < testShape.length; y++) {
    for (let x = 0; x < testShape[y].length; x++) {
      if (!testShape[y][x]) continue;
      const nx = p.x + x + dx;
      const ny = p.y + y + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function merge() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) board[piece.y + y][piece.x + x] = piece.type;
    });
  });
}

function rotate() {
  const old = piece.shape;
  const rotated = old[0].map((_, i) => old.map(row => row[i]).reverse());

  const kicks = [0, -1, 1, -2, 2];
  for (const dx of kicks) {
    if (!collides(piece, dx, 0, rotated)) {
      piece.shape = rotated;
      piece.x += dx;
      return;
    }
  }
}

function clearLines() {
  let cleared = 0;
  outer:
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      y++;
    }
  }

  if (cleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[cleared] * level;
    lines += cleared;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("tetrisHighScore", highScore);
    }

    const newLevel = Math.min(5, 1 + LEVEL_LINES.filter(n => lines >= n && n > 0).length);
    if (newLevel > level) {
      level = newLevel;
      showMessage(`🎉 第 ${level} 關！\n速度提升！`);
      setTimeout(() => {
        if (running && !gameOver) hideMessage();
      }, 900);
    }

    if (lines >= LEVEL_LINES[4]) {
      level = 5;
    }
  }
}

function drop() {
  if (!running || paused || gameOver) return;
  if (!collides(piece, 0, 1)) {
    piece.y++;
  } else {
    merge();
    clearLines();
    if (lines >= 30) {
      gameOver = true;
      running = false;
      showMessage("🏆 恭喜完成五個關卡！\n你是俄羅斯方塊高手！");
    } else {
      spawnPiece();
    }
  }
  dropCounter = 0;
}

function hardDrop() {
  if (!running || paused || gameOver) return;
  let distance = 0;
  while (!collides(piece, 0, 1)) {
    piece.y++;
    distance++;
  }
  score += distance * 2;
  drop();
  updateUI();
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (running && !paused && !gameOver) {
    dropCounter += delta;
    if (dropCounter > LEVEL_SPEED[level - 1]) drop();
  }

  draw();
  updateUI();

  if (running || paused) animationId = requestAnimationFrame(update);
}

function drawCell(context, x, y, color, size = BLOCK) {
  context.fillStyle = color;
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
  context.fillStyle = "rgba(255,255,255,.22)";
  context.fillRect(x * size + 3, y * size + 3, size - 8, 4);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * BLOCK, 0); ctx.lineTo(x * BLOCK, ROWS * BLOCK); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * BLOCK); ctx.lineTo(COLS * BLOCK, y * BLOCK); ctx.stroke();
  }
}

function draw() {
  ctx.fillStyle = "#101522";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  board.forEach((row, y) => row.forEach((type, x) => {
    if (type) drawCell(ctx, x, y, COLORS[type]);
  }));

  if (piece) {
    piece.shape.forEach((row, y) => row.forEach((v, x) => {
      if (v) drawCell(ctx, piece.x + x, piece.y + y, COLORS[piece.type]);
    }));
  }

  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("暫停", canvas.width / 2, canvas.height / 2);
  }
}

function drawNext() {
  nextCtx.fillStyle = "#101522";
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!nextPiece) return;

  const s = nextPiece.shape;
  const offsetX = (5 - s[0].length) / 2;
  const offsetY = (5 - s.length) / 2;
  s.forEach((row, y) => row.forEach((v, x) => {
    if (v) drawCell(nextCtx, offsetX + x, offsetY + y, COLORS[nextPiece.type], NEXT_BLOCK);
  }));
}

function updateUI() {
  levelEl.textContent = `${level} / 5`;
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  highScoreEl.textContent = highScore;
}

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.remove("hidden");
}

function hideMessage() {
  messageEl.classList.add("hidden");
}

document.addEventListener("keydown", e => {
  if (!running && e.key.toLowerCase() !== "p") return;

  if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," "].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowLeft" && !paused && !collides(piece, -1, 0)) piece.x--;
  else if (e.key === "ArrowRight" && !paused && !collides(piece, 1, 0)) piece.x++;
  else if (e.key === "ArrowDown") drop();
  else if (e.key === "ArrowUp" && !paused) rotate();
  else if (e.key === " ") hardDrop();
  else if (e.key.toLowerCase() === "p" && !gameOver) {
    paused = !paused;
    if (paused) showMessage("⏸ 暫停");
    else hideMessage();
  }
});

startBtn.addEventListener("click", resetGame);

draw();
drawNext();
