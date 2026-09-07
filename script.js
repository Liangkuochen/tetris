const COLS = 10, ROWS = 20, BLOCK = 30;
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const colors = [
  null, "#22d3ee", "#3b82f6", "#f97316", "#facc15",
  "#22c55e", "#a855f7", "#ef4444"
];

const shapes = [
  [[1,1,1,1]],                         // I
  [[2,0,0],[2,2,2]],                   // J
  [[0,0,3],[3,3,3]],                   // L
  [[4,4],[4,4]],                       // O
  [[0,5,5],[5,5,0]],                   // S
  [[0,6,0],[6,6,6]],                   // T
  [[7,7,0],[0,7,7]]                    // Z
];

let board, player, nextPiece;
let score = 0, lines = 0, level = 1;
let dropCounter = 0, lastTime = 0, dropInterval = 800;
let running = false, paused = false;
let animationId = null;

function newBoard() {
  return Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

function cloneMatrix(m) {
  return m.map(row => row.slice());
}

function randomPiece() {
  const matrix = cloneMatrix(shapes[Math.floor(Math.random() * shapes.length)]);
  return {
    matrix,
    x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2),
    y: 0
  };
}

function resetGame() {
  board = newBoard();
  score = 0; lines = 0; level = 1;
  dropInterval = 800;
  nextPiece = randomPiece();
  spawn();
  updateInfo();
  paused = false;
  running = true;
  document.getElementById("message").textContent = "遊戲進行中";
  if (!animationId) {
    lastTime = performance.now();
    animationId = requestAnimationFrame(update);
  }
  draw();
}

function spawn() {
  player = nextPiece || randomPiece();
  player.x = Math.floor(COLS / 2) - Math.ceil(player.matrix[0].length / 2);
  player.y = 0;
  nextPiece = randomPiece();
  drawNext();
  if (collides(board, player)) gameOver();
}

function collides(grid, p) {
  for (let y = 0; y < p.matrix.length; y++) {
    for (let x = 0; x < p.matrix[y].length; x++) {
      if (!p.matrix[y][x]) continue;
      const nx = p.x + x, ny = p.y + y;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && grid[ny][nx]) return true;
    }
  }
  return false;
}

function merge() {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value && player.y + y >= 0) board[player.y + y][player.x + x] = value;
    });
  });
}

function sweep() {
  let cleared = 0;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (!board[y][x]) continue outer;
    }
    board.splice(y, 1);
    board.unshift(Array(COLS).fill(0));
    y++;
    cleared++;
  }
  if (cleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 800 - (level - 1) * 70);
    updateInfo();
  }
}

function drop() {
  player.y++;
  if (collides(board, player)) {
    player.y--;
    merge();
    sweep();
    spawn();
  }
  dropCounter = 0;
}

function hardDrop() {
  let distance = 0;
  while (!collides(board, player)) {
    player.y++;
    distance++;
  }
  player.y--;
  distance--;
  score += Math.max(0, distance * 2);
  merge();
  sweep();
  spawn();
  updateInfo();
  dropCounter = 0;
}

function move(dir) {
  player.x += dir;
  if (collides(board, player)) player.x -= dir;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++)
    for (let x = 0; x < y; x++)
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function rotatePlayer() {
  const oldX = player.x;
  rotate(player.matrix, 1);
  let offset = 1;
  while (collides(board, player)) {
    player.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -1);
      player.x = oldX;
      return;
    }
  }
}

function ghostY() {
  let y = player.y;
  while (!collides(board, {...player, y: y + 1})) y++;
  return y;
}

function drawCell(context, x, y, size, value) {
  context.fillStyle = colors[value];
  context.fillRect(x * size, y * size, size, size);
  context.strokeStyle = "rgba(255,255,255,.18)";
  context.strokeRect(x * size, y * size, size, size);
}

function drawMatrix(context, matrix, offset, size, alpha = 1) {
  context.globalAlpha = alpha;
  matrix.forEach((row, y) => row.forEach((value, x) => {
    if (value) drawCell(context, x + offset.x, y + offset.y, size, value);
  }));
  context.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  board.forEach((row, y) => row.forEach((v, x) => v && drawCell(ctx, x, y, BLOCK, v)));
  if (player) {
    drawMatrix(ctx, player.matrix, {x: player.x, y: ghostY()}, BLOCK, .18);
    drawMatrix(ctx, player.matrix, {x: player.x, y: player.y}, BLOCK);
  }
}

function drawNext() {
  nextCtx.clearRect(0, 0, 120, 120);
  nextCtx.fillStyle = "#0b1020";
  nextCtx.fillRect(0, 0, 120, 120);
  const size = 25;
  const ox = Math.floor((120 / size - nextPiece.matrix[0].length) / 2);
  const oy = Math.floor((120 / size - nextPiece.matrix.length) / 2);
  drawMatrix(nextCtx, nextPiece.matrix, {x: ox, y: oy}, size);
}

function updateInfo() {
  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = lines;
  document.getElementById("level").textContent = level;
  document.getElementById("highScore").textContent = localStorage.getItem("tetrisHighScore") || 0;
}

function gameOver() {
  running = false;
  paused = false;
  animationId = null;
  const high = Number(localStorage.getItem("tetrisHighScore") || 0);
  if (score > high) localStorage.setItem("tetrisHighScore", score);
  updateInfo();
  document.getElementById("message").textContent = "遊戲結束！按「開始 / 重新開始」再玩一次";
  draw();
}

function update(time = 0) {
  if (!running) { animationId = null; return; }
  const delta = time - lastTime;
  lastTime = time;
  if (!paused) {
    dropCounter += delta;
    if (dropCounter > dropInterval) drop();
    draw();
  }
  animationId = requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (!running || paused) {
    if (e.key.toLowerCase() === "p" && running) togglePause();
    return;
  }
  if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," ","p","P"].includes(e.key)) e.preventDefault();
  if (e.key === "ArrowLeft") move(-1);
  else if (e.key === "ArrowRight") move(1);
  else if (e.key === "ArrowDown") drop();
  else if (e.key === "ArrowUp") rotatePlayer();
  else if (e.key === " ") hardDrop();
  else if (e.key.toLowerCase() === "p") togglePause();
  draw();
});

function togglePause() {
  if (!running) return;
  paused = !paused;
  document.getElementById("message").textContent = paused ? "遊戲已暫停（按 P 繼續）" : "遊戲進行中";
}

document.getElementById("startBtn").addEventListener("click", resetGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);

board = newBoard();
nextPiece = randomPiece();
updateInfo();
draw();
drawNext();
