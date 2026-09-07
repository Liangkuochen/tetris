const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const nextCanvas =
    document.getElementById("next");

const nextCtx =
    nextCanvas.getContext("2d");


/* ========================= */
/* 遊戲設定 */
/* ========================= */

const COLS = 10;
const ROWS = 20;

const BLOCK = 30;
const NEXT_BLOCK = 24;


/* 五種方塊顏色 */

const COLORS = {

    I: "#00d9ff",

    J: "#4d7cff",

    L: "#ff9f1c",

    O: "#ffd60a",

    S: "#2ec4b6",

    T: "#b967ff",

    Z: "#ff4d6d"
};


/* 七種俄羅斯方塊 */

const SHAPES = {

    I: [
        [1,1,1,1]
    ],

    J: [
        [1,0,0],
        [1,1,1]
    ],

    L: [
        [0,0,1],
        [1,1,1]
    ],

    O: [
        [1,1],
        [1,1]
    ],

    S: [
        [0,1,1],
        [1,1,0]
    ],

    T: [
        [0,1,0],
        [1,1,1]
    ],

    Z: [
        [1,1,0],
        [0,1,1]
    ]
};


const TYPES =
    Object.keys(SHAPES);


/* 五個關卡速度 */

const LEVEL_SPEED = [

    800,
    650,
    500,
    350,
    220

];


/* 過關行數 */

const LEVEL_LINES = [

    0,
    5,
    12,
    20,
    30

];


/* ========================= */
/* 遊戲變數 */
/* ========================= */

let board;

let piece;

let nextPiece;

let score = 0;

let lines = 0;

let level = 1;

let running = false;

let paused = false;

let gameOver = false;

let dropCounter = 0;

let lastTime = 0;

let animationId;


/* 最高分 */

let highScore =
    Number(
        localStorage.getItem(
            "tetrisHighScore"
        ) || 0
    );


/* ========================= */
/* HTML 元件 */
/* ========================= */

const levelElement =
    document.getElementById("level");

const scoreElement =
    document.getElementById("score");

const linesElement =
    document.getElementById("lines");

const highScoreElement =
    document.getElementById("highScore");

const messageElement =
    document.getElementById("message");

const startButton =
    document.getElementById("startBtn");


/* ========================= */
/* 建立棋盤 */
/* ========================= */

function createBoard() {

    return Array.from(
        { length: ROWS },

        () =>
            Array(COLS).fill(null)
    );
}


/* ========================= */
/* 隨機產生方塊 */
/* ========================= */

function randomPiece() {

    const type =
        TYPES[
            Math.floor(
                Math.random() *
                TYPES.length
            )
        ];

    return {

        type: type,

        shape:
            SHAPES[type].map(
                row => [...row]
            ),

        x: 0,

        y: 0
    };
}


/* ========================= */
/* 開始遊戲 */
/* ========================= */

function resetGame() {

    board =
        createBoard();

    score = 0;

    lines = 0;

    level = 1;

    running = true;

    paused = false;

    gameOver = false;

    dropCounter = 0;

    lastTime =
        performance.now();

    nextPiece =
        randomPiece();

    spawnPiece();

    hideMessage();

    startButton.textContent =
        "重新開始";

    cancelAnimationFrame(
        animationId
    );

    animationId =
        requestAnimationFrame(
            update
        );
}


/* ========================= */
/* 產生下一個方塊 */
/* ========================= */

function spawnPiece() {

    piece =
        nextPiece ||
        randomPiece();

    piece.x =
        Math.floor(
            (
                COLS -
                piece.shape[0].length
            ) / 2
        );

    piece.y = 0;

    nextPiece =
        randomPiece();

    drawNext();


    if (collides(piece)) {

        gameOver = true;

        running = false;

        showMessage(
            "遊戲結束\n" +
            "按「重新開始」再挑戰一次"
        );
    }
}


/* ========================= */
/* 碰撞判斷 */
/* ========================= */

function collides(
    p,
    dx = 0,
    dy = 0,
    shape = p.shape
) {

    for (
        let y = 0;
        y < shape.length;
        y++
    ) {

        for (
            let x = 0;
            x < shape[y].length;
            x++
        ) {

            if (!shape[y][x])
                continue;


            const nx =
                p.x + x + dx;

            const ny =
                p.y + y + dy;


            if (
                nx < 0 ||
                nx >= COLS ||
                ny >= ROWS
            ) {

                return true;
            }


            if (
                ny >= 0 &&
                board[ny][nx]
            ) {

                return true;
            }
        }
    }

    return false;
}


/* ========================= */
/* 左右移動 */
/* ========================= */

function move(dx) {

    if (
        !running ||
        paused ||
        gameOver
    ) {
        return;
    }


    if (
        !collides(
            piece,
            dx,
            0
        )
    ) {

        piece.x += dx;
    }
}


/* ========================= */
/* 旋轉 */
/* ========================= */

function rotate() {

    if (
        !running ||
        paused ||
        gameOver
    ) {
        return;
    }


    const rotated =
        piece.shape[0].map(
            (_, index) =>
                piece.shape
                    .map(row => row[index])
                    .reverse()
        );


    /* 防止旋轉後卡在牆壁 */

    const kicks = [

        0,
        -1,
        1,
        -2,
        2

    ];


    for (
        const dx of kicks
    ) {

        if (
            !collides(
                piece,
                dx,
                0,
                rotated
            )
        ) {

            piece.shape =
                rotated;

            piece.x += dx;

            return;
        }
    }
}


/* ========================= */
/* 方塊下降 */
/* ========================= */

function drop() {

    if (
        !running ||
        paused ||
        gameOver
    ) {
        return;
    }


    if (
        !collides(
            piece,
            0,
            1
        )
    ) {

        piece.y++;

    } else {

        lockPiece();
    }


    dropCounter = 0;
}


/* ========================= */
/* 直接到底 */
/* ========================= */

function hardDrop() {

    if (
        !running ||
        paused ||
        gameOver
    ) {
        return;
    }


    let distance = 0;


    while (
        !collides(
            piece,
            0,
            1
        )
    ) {

        piece.y++;

        distance++;
    }


    score +=
        distance * 2;


    lockPiece();
}


/* ========================= */
/* 固定方塊 */
/* ========================= */

function lockPiece() {

    piece.shape.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (value) {

                        board[
                            piece.y + y
                        ][
                            piece.x + x
                        ] =
                            piece.type;
                    }
                }
            );
        }
    );


    clearLines();


    if (lines >= 30) {

        level = 5;

        gameOver = true;

        running = false;

        showMessage(
            "🏆 恭喜完成五個關卡！\n" +
            "你是俄羅斯方塊高手！"
        );

    } else {

        spawnPiece();
    }
}


/* ========================= */
/* 消除完整的行 */
/* ========================= */

function clearLines() {

    let cleared = 0;


    for (
        let y = ROWS - 1;
        y >= 0;
        y--
    ) {

        if (
            board[y].every(Boolean)
        ) {

            board.splice(
                y,
                1
            );

            board.unshift(
                Array(COLS).fill(null)
            );

            cleared++;

            y++;
        }
    }


    if (!cleared)
        return;


    const points = [

        0,
        100,
        300,
        500,
        800

    ];


    score +=
        points[cleared] *
        level;


    lines += cleared;


    /* 更新最高分 */

    if (
        score > highScore
    ) {

        highScore = score;

        localStorage.setItem(
            "tetrisHighScore",
            highScore
        );
    }


    /* 判斷是否升級 */

    const newLevel =
        Math.min(
            5,

            1 +
            LEVEL_LINES.filter(
                n =>
                    n > 0 &&
                    lines >= n
            ).length
        );


    if (
        newLevel > level
    ) {

        level = newLevel;


        showMessage(
            `🎉 第 ${level} 關！\n` +
            "速度提升！"
        );


        setTimeout(
            () => {

                if (
                    running &&
                    !gameOver
                ) {

                    hideMessage();
                }

            },

            900
        );
    }
}


/* ========================= */
/* 暫停 */
/* ========================= */

function togglePause() {

    if (
        !running ||
        gameOver
    ) {
        return;
    }


    paused =
        !paused;


    if (paused) {

        showMessage(
            "⏸️ 暫停"
        );

    } else {

        hideMessage();
    }
}


/* ========================= */
/* 遊戲主迴圈 */
/* ========================= */

function update(time = 0) {

    const delta =
        time - lastTime;

    lastTime = time;


    if (
        running &&
        !paused &&
        !gameOver
    ) {

        dropCounter +=
            delta;


        if (
            dropCounter >
            LEVEL_SPEED[level - 1]
        ) {

            drop();
        }
    }


    draw();

    updateUI();


    if (
        running ||
        paused
    ) {

        animationId =
            requestAnimationFrame(
                update
            );
    }
}


/* ========================= */
/* 畫方塊 */
/* ========================= */

function drawCell(
    context,
    x,
    y,
    color,
    size = BLOCK
) {

    context.fillStyle =
        color;

    context.fillRect(
        x * size + 1,
        y * size + 1,
        size - 2,
        size - 2
    );


    /* 方塊高光 */

    context.fillStyle =
        "rgba(255,255,255,.25)";

    context.fillRect(
        x * size + 3,
        y * size + 3,
        size - 8,
        4
    );
}


/* ========================= */
/* 棋盤格線 */
/* ========================= */

function drawGrid() {

    ctx.strokeStyle =
        "rgba(255,255,255,.07)";


    for (
        let x = 0;
        x <= COLS;
        x++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x * BLOCK,
            0
        );

        ctx.lineTo(
            x * BLOCK,
            ROWS * BLOCK
        );

        ctx.stroke();
    }


    for (
        let y = 0;
        y <= ROWS;
        y++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * BLOCK
        );

        ctx.lineTo(
            COLS * BLOCK,
            y * BLOCK
        );

        ctx.stroke();
    }
}


/* ========================= */
/* 畫遊戲 */
/* ========================= */

function draw() {

    ctx.fillStyle =
        "#101522";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawGrid();


    /* 已固定方塊 */

    board?.forEach(
        (row, y) => {

            row.forEach(
                (type, x) => {

                    if (type) {

                        drawCell(
                            ctx,
                            x,
                            y,
                            COLORS[type]
                        );
                    }
                }
            );
        }
    );


    /* 目前方塊 */

    if (piece) {

        piece.shape.forEach(
            (row, y) => {

                row.forEach(
                    (value, x) => {

                        if (value) {

                            drawCell(
                                ctx,
                                piece.x + x,
                                piece.y + y,
                                COLORS[
                                    piece.type
                                ]
                            );
                        }
                    }
                );
            }
        );
    }


    /* 暫停 */

    if (paused) {

        ctx.fillStyle =
            "rgba(0,0,0,.55)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "white";

        ctx.font =
            "bold 34px sans-serif";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "暫停",
            canvas.width / 2,
            canvas.height / 2
        );
    }
}


/* ========================= */
/* 下一個方塊 */
/* ========================= */

function drawNext() {

    nextCtx.fillStyle =
        "#101522";

    nextCtx.fillRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );


    if (!nextPiece)
        return;


    const shape =
        nextPiece.shape;


    const offsetX =
        (5 - shape[0].length) / 2;

    const offsetY =
        (5 - shape.length) / 2;


    shape.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (value) {

                        drawCell(
                            nextCtx,
                            offsetX + x,
                            offsetY + y,
                            COLORS[
                                nextPiece.type
                            ],
                            NEXT_BLOCK
                        );
                    }
                }
            );
        }
    );
}


/* ========================= */
/* 更新資訊 */
/* ========================= */

function updateUI() {

    levelElement.textContent =
        `${level} / 5`;

    scoreElement.textContent =
        score;

    linesElement.textContent =
        lines;

    highScoreElement.textContent =
        highScore;
}


/* ========================= */
/* 訊息 */
/* ========================= */

function showMessage(text) {

    messageElement.textContent =
        text;

    messageElement.classList.remove(
        "hidden"
    );
}


function hideMessage() {

    messageElement.classList.add(
        "hidden"
    );
}


/* ================================================= */
/* ⌨️ 電腦鍵盤操作 */
/* ================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            [
                "ArrowLeft",
                "ArrowRight",
                "ArrowDown",
                "ArrowUp",
                " "
            ].includes(event.key)
        ) {

            event.preventDefault();
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            move(-1);

        } else if (
            event.key ===
            "ArrowRight"
        ) {

            move(1);

        } else if (
            event.key ===
            "ArrowDown"
        ) {

            drop();

        } else if (
            event.key ===
            "ArrowUp"
        ) {

            rotate();

        } else if (
            event.key ===
            " "
        ) {

            hardDrop();

        } else if (
            event.key.toLowerCase()
            === "p"
        ) {

            togglePause();
        }
    }
);


/* ================================================= */
/* 📱 手機觸控按鈕 */
/* ================================================= */

const touchButtons =
    document.querySelectorAll(
        ".control-btn"
    );


touchButtons.forEach(
    button => {

        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();


                const action =
                    button.dataset.action;


                if (
                    action === "left"
                ) {

                    move(-1);

                } else if (
                    action === "right"
                ) {

                    move(1);

                } else if (
                    action === "rotate"
                ) {

                    rotate();

                } else if (
                    action === "down"
                ) {

                    drop();

                } else if (
                    action === "drop"
                ) {

                    hardDrop();

                } else if (
                    action === "pause"
                ) {

                    togglePause();
                }
            }
        );
    }
);


/* ================================================= */
/* 👆 手機滑動操作 */
/* ================================================= */

let touchStartX = 0;
let touchStartY = 0;


canvas.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;
    },

    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    event => {

        const touch =
            event.changedTouches[0];


        const dx =
            touch.clientX -
            touchStartX;


        const dy =
            touch.clientY -
            touchStartY;


        const absX =
            Math.abs(dx);

        const absY =
            Math.abs(dy);


        /*
         * 點一下
         * → 旋轉
         */

        if (
            Math.max(
                absX,
                absY
            ) < 20
        ) {

            rotate();

            return;
        }


        /*
         * 左右滑
         */

        if (
            absX > absY
        ) {

            if (dx > 0) {

                move(1);

            } else {

                move(-1);
            }

        }

        /*
         * 向下滑
         */

        else if (
            dy > 0
        ) {

            drop();
        }

        /*
         * 向上滑
         * → 旋轉
         */

        else {

            rotate();
        }
    },

    {
        passive: true
    }
);


/* ========================= */
/* 開始按鈕 */
/* ========================= */

startButton.addEventListener(
    "click",
    resetGame
);


/* ========================= */
/* 初始化 */
/* ========================= */

board =
    createBoard();

updateUI();

draw();

drawNext();
