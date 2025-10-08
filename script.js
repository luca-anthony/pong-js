const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const w = canvas.width;
const h = canvas.height;

let player = { x: w - 20, y: h / 2 - 50, width: 10, height: 100, speed: 9 };
let opponent = { x: 10, y: h / 2 - 50, width: 10, height: 100, speed: 7 };

let ball = { x: w / 2, y: h / 2, size: 20, speedX: 7, speedY: 7 };

let playerScore = 0;
let opponentScore = 0;
let roundCount = 0;
const maxRounds = 10;

let gameActive = false;

// AI difficulty
let aiDifficulty = 0.12;
const aiMin = 0.05;
const aiMax = 0.25;
const aiStep = 0.01;
let aiSpeed = 7;
const aiSpeedMin = 4;
const aiSpeedMax = 10;
const aiMissChance = 0.15;

// Sounds
const assetsPath = "assets/";
const pointGain = new Audio(assetsPath + "point gained.ogg");
const pointLost = new Audio(assetsPath + "point lost.ogg");
const victory = new Audio(assetsPath + "victory.ogg");
const gameLost = new Audio(assetsPath + "game lost.ogg");
const inGame = new Audio(assetsPath + "in game.ogg");
inGame.loop = true;

// Input
let keys = {};
document.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (e.code === "Space") {
        if (!gameActive && roundCount < maxRounds) {
            gameActive = true;
            inGame.play();
        } else if (roundCount >= maxRounds) {
            // reset game
            roundCount = 0;
            playerScore = 0;
            opponentScore = 0;
            aiDifficulty = 0.12;
            aiSpeed = 7;
            resetBall();
            gameActive = true;
            inGame.play();
        }
    }
});
document.addEventListener("keyup", e => keys[e.code] = false);

function resetBall() {
    ball.x = w / 2 - ball.size / 2;
    ball.y = h / 2 - ball.size / 2;
    ball.speedX *= -1;
    ball.speedY *= -1;
    gameActive = false;
    inGame.pause();
    inGame.currentTime = 0;
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x + size / 2, y + size / 2, size / 2, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(text, x, y, color, size = 48) {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
}

function updateAI() {
    if (ball.speedX < 0) {
        let targetY = ball.y + ball.size / 2;
        if (Math.random() < aiMissChance) targetY += (Math.random() * 100 - 50);
        if (opponent.y + opponent.height / 2 < targetY) {
            opponent.y += Math.min(aiSpeed, targetY - (opponent.y + opponent.height / 2));
        } else {
            opponent.y -= Math.min(aiSpeed, (opponent.y + opponent.height / 2) - targetY);
        }
    }
    if (opponent.y < 0) opponent.y = 0;
    if (opponent.y + opponent.height > h) opponent.y = h - opponent.height;
}

function update() {
    if (!gameActive) return;

    // Player movement
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > h) player.y = h - player.height;

    // AI
    updateAI();

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y <= 0 || ball.y + ball.size >= h) ball.speedY *= -1;

    // Collisions
    if (ball.x + ball.size >= player.x && ball.x <= player.x + player.width &&
        ball.y + ball.size >= player.y && ball.y <= player.y + player.height) {
        ball.speedX *= -1;
    }
    if (ball.x <= opponent.x + opponent.width && ball.x + ball.size >= opponent.x &&
        ball.y + ball.size >= opponent.y && ball.y <= opponent.y + opponent.height) {
        ball.speedX *= -1;
    }

    // Score
    if (ball.x + ball.size < 0) {
        playerScore++;
        roundCount++;
        aiDifficulty = Math.min(aiMax, aiDifficulty + aiStep);
        aiSpeed = Math.min(aiSpeedMax, aiSpeed + 0.3);
        pointGain.play();
        resetBall();
    }
    if (ball.x > w) {
        opponentScore++;
        roundCount++;
        aiDifficulty = Math.max(aiMin, aiDifficulty - aiStep);
        aiSpeed = Math.max(aiSpeedMin, aiSpeed - 0.3);
        pointLost.play();
        resetBall();
    }
}

function draw() {
    // Background
    ctx.fillStyle = "#050520";
    ctx.fillRect(0, 0, w, h);

    // Net
    for (let y = 0; y < h; y += 40) drawRect(w / 2 - 2, y, 4, 20, "#b400ff");

    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, "#ff00c8");
    drawRect(opponent.x, opponent.y, opponent.width, opponent.height, "#00c8ff");
    drawCircle(ball.x, ball.y, ball.size, "#fff");

    // Scores
    drawText(playerScore, w / 2 + 40, 60, "#ff00c8", 74);
    drawText(opponentScore, w / 2 - 80, 60, "#00c8ff", 74);

    // Messages
    if (!gameActive && roundCount < maxRounds) drawText("Press SPACE to Serve", w / 2 - 150, h / 2 + 100, "#fff", 48);
    if (roundCount >= maxRounds) {
        let msgText = playerScore > opponentScore ? "You Won!" : (opponentScore > playerScore ? "Game Over" : "Draw!");
        drawText(msgText, w / 2 - 100, h / 2 - 50, "#fff", 64);
        if (playerScore > opponentScore) victory.play();
        else if (opponentScore > playerScore) gameLost.play();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

