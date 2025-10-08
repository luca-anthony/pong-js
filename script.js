const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let playerScore = 0;
let aiScore = 0;
let maxRounds = 10;
let roundCount = 0;
let gameActive = false;
let aiDifficulty = 4; // how quickly AI moves (starts medium)

// Sounds
const bounceSound = new Audio("assets/bounce.mp3");
const scoreSound = new Audio("assets/score.mp3");
const winSound = new Audio("assets/victory.mp3");
const loseSound = new Audio("assets/lose.mp3");

// Paddles and Ball
const paddleHeight = 100;
const paddleWidth = 10;
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 3;

function drawPaddle(x, y, color) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#0ff";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#0ff";
    ctx.fill();
    ctx.closePath();
}

function drawText(text, x, y, size = "30px", color = "#fff") {
    ctx.fillStyle = color;
    ctx.font = `${size} monospace`;
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    ctx.fillText(text, x, y);
}

function resetBall() {
    ballSpeedX = -ballSpeedX;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    gameActive = false;
}

function moveAI() {
    const centerAI = aiY + paddleHeight / 2;
    if (centerAI < ballY - 35) aiY += aiDifficulty;
    else if (centerAI > ballY + 35) aiY -= aiDifficulty;
}

function moveBall() {
    if (!gameActive) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and bottom bounce
    if (ballY < 0 || ballY > canvas.height) {
        ballSpeedY = -ballSpeedY;
        bounceSound.play();
    }

    // Left paddle
    if (
        ballX < 20 &&
        ballY > playerY &&
        ballY < playerY + paddleHeight
    ) {
        ballSpeedX = -ballSpeedX;
        bounceSound.play();
    }

    // Right paddle (AI)
    if (
        ballX > canvas.width - 30 &&
        ballY > aiY &&
        ballY < aiY + paddleHeight
    ) {
        ballSpeedX = -ballSpeedX;
        bounceSound.play();
    }

    // Scoring
    if (ballX < 0) {
        aiScore++;
        roundCount++;
        scoreSound.play();
        adjustDifficulty(false);
        resetBall();
    } else if (ballX > canvas.width) {
        playerScore++;
        roundCount++;
        scoreSound.play();
        adjustDifficulty(true);
        resetBall();
    }
}

function adjustDifficulty(playerScored) {
    // Adaptive AI — smarter if you score, dumber if you lose
    if (playerScored && aiDifficulty < 8) aiDifficulty += 0.5;
    else if (!playerScored && aiDifficulty > 2) aiDifficulty -= 0.5;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPaddle(10, playerY, "#0f0");
    drawPaddle(canvas.width - 20, aiY, "#f00");
    drawBall();
    drawText(`${playerScore} : ${aiScore}`, canvas.width / 2, 50);

    if (!gameActive && roundCount < maxRounds) {
        drawText("Press SPACE to serve", canvas.width / 2, canvas.height / 2);
    }

    if (roundCount >= maxRounds) {
        const result =
            playerScore > aiScore ? "YOU WIN!" : "YOU LOSE!";
        drawText(result, canvas.width / 2, canvas.height / 2, "40px", "#0ff");
    }
}

function gameLoop() {
    moveBall();
    moveAI();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" && playerY > 0) playerY -= 8;
    if (e.code === "ArrowDown" && playerY < canvas.height - paddleHeight)
        playerY += 8;
    if (e.code === "Space" && !gameActive && roundCount < maxRounds) {
        gameActive = true;
    }
});

gameLoop();