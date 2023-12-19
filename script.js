// link canvas
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Images
let bgImg = new Image();
bgImg.src = './img/flappyBgImg.png';
let birdImg = new Image();
birdImg.src = './img/birdMan.png';

// --------  VARIABLES ---------
// variable player
let player;
//variable obstacle
let obstacles;
// variable to keep track on how often you can jump
let lastJump = 0;
// handle time between obstacles
let spawnTimer;
let newSpawnTimer;
// manage time
let lastTime;
// points
let points;
// level
let level;
// Can we start game?
let startGame = false;
// check if lost
let lose = false;

// Access dom elements
let btnStart = document.getElementById('btn-start');

//--------------- FUNCTIONS -----------------

// function to start game: also store player info and reset variables for new game
function initGame() {
    //player info
    player = {
        x: 100,
        y: 100,
        velY: 0,
        width: 35,
        height: 35,
    };

    //reset time and points
    lastTime = Date.now();
    points = 0;
    newSpawnTimer = 5;
    level = 1;

    //obstacles
    obstacles = [];
    spawnTimer = 1;

    // Call tick: START GAME!
    requestAnimationFrame(tick);
}

// handle jump
function jump(player) {
    //adjust jump speed
    player.velY = -140;
}

// generate random heights for obstacles
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// ---- Obstacles functions ----
// store obstacle info
function spawnObstacles() {
    let space = getRandomInt(100, canvas.height - 100);

    let obstacleDown = {
        x: 840,
        y: space + 50,
        width: 40,
        height: canvas.height - (space + 50),
        color: 'green',
        velX: -60,
    };

    let obstacleUp = {
        x: 840,
        y: 0,
        width: 40,
        height: space - 50,
        color: 'green',
        velX: -60,
    };

    obstacles.push(obstacleDown, obstacleUp);
}

// draw obstacles
function tickObstacle(obstacle, deltaTime) {
    //draw obstacles
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // move obstacles smoothly
    obstacle.x += obstacle.velX * deltaTime;
}

// --- Function for collisions ---
function isColliding(rect1, rect2) {
    if (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    ) {
        return true;
    } else {
        return false;
    }
}

// --- loser functions ---
// change lose variable when loosing
function toggleLost() {
    lose = true;
}
// Loser message
function youLost() {
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width / 2 - 200, 100, 400, 200);
    //write message
    ctx.fillStyle = 'white';
    ctx.font = '34px Silkscreen';
    ctx.fillText('YOU LOST!', 300, 150);
    ctx.font = '20px monospace';
    ctx.fillText('Your score this round was:', 245, 210);
    ctx.font = '30px monospace';
    ctx.fillText(points, canvas.width / 2 - 15, 260);
    lose = !lose;
}

// ---------- EVENT LISTENERS ------------
//listen for space key down: --> if 400ms have passed we call jump()
window.addEventListener('keydown', function (event) {
    event.preventDefault();
    let now = Date.now();
    if (event.key === ' ' && now - lastJump > 400) {
        jump(player);
        lastJump = now;
    }
});

// listen for startBtn --> call initGame --> START GAME
btnStart.addEventListener('click', initGame);

// -----------------TICK----------------
// Function to make everything work
function tick() {
    // manage time
    let now = Date.now();
    let deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    // clear canvas
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // draw player
    let rotation = 0;
    if (player.velY < 0) {
        rotation = -Math.PI / 8;
    } else if (player.velY > 20) {
        rotation = Math.PI / 4;
    }
    // animate movement of nose diving
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(rotation);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        birdImg,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
    );
    ctx.restore();

    //keep the player moving smoothly
    player.y += player.velY * deltaTime;
    //adjust gravity
    player.velY += 300 * deltaTime;

    //keep player within canvas
    if (player.y + player.height / 2 >= canvas.height) {
        toggleLost();
    }
    if (player.y <= 0) {
        player.y = 1;
        player.velY = 0;
    }

    // define pointsThisRound
    let pointsThisRound = 0;

    // ---- Handle obstacles ----
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        let overBefore = obstacle.x < 59;

        // Handle collision between player and obstacles
        if (isColliding(player, obstacle)) {
            toggleLost();
        }

        tickObstacle(obstacle, deltaTime);

        // splice if obstacles go out of frame
        if (obstacle.x <= -40) {
            obstacles.splice(i, 1);
            i--;
            continue;
        }

        // get points if obstacles pass
        let overAfter = obstacle.x < 59;
        let receivePoint = !overBefore && overAfter;
        if (obstacle.x < player.x - obstacle.width && receivePoint) {
            pointsThisRound++;
        }

        // change level
        switch (true) {
            case points >= 5 && points < 10:
                obstacle.velX = -80;
                newSpawnTimer = 3;
                level = 2;
                break;
            case points >= 10 && points < 15:
                obstacle.velX = -100;
                newSpawnTimer = 2.5;
                level = 3;
                break;
            case points >= 15 && points < 20:
                obstacle.velX = -120;
                newSpawnTimer = 2;
                level = 4;
                break;
            case points >= 20 && points < 25:
                obstacle.velX = -140;
                newSpawnTimer = 1.5;
                level = 5;
                break;
            case points >= 25 && points < 30:
                obstacle.velX = -160;
                newSpawnTimer = 1.2;
                level = 6;
                break;
            case points >= 30 && points < 35:
                obstacle.velX = -180;
                newSpawnTimer = 1;
                level = 7;
                break;
            case points >= 35 && points < 40:
                obstacle.velX = -200;
                newSpawnTimer = 0.8;
                level = 8;
                break;
            case points >= 40:
                obstacle.velX = -220;
                newSpawnTimer = 0.6;
                level = 9;
                break;
        }
    }

    //call spawn obstacles
    spawnTimer -= deltaTime;
    if (spawnTimer <= 0) {
        spawnObstacles();
        // Spawn a new obstacle when timer in out.
        spawnTimer = newSpawnTimer;
    }

    // handle points
    points += pointsThisRound / 2;

    // Display points in canvas
    ctx.fillStyle = 'black';
    ctx.font = '22px Silkscreen';
    ctx.fillText('Points: ' + points, 10, 60);

    // Display level
    ctx.fillStyle = 'black';
    ctx.font = '22px Silkscreen';
    ctx.fillText('Level: ' + level, 10, 30);

    // Handle losing
    if (lose) {
        youLost();
        return;
    }

    requestAnimationFrame(tick);
}
