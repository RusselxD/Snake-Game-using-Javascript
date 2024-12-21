const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let currentDirection = "ArrowRight";
let directionChanged = false;

var isGameRunning;
var snakeSize = 15;

determineSize(window.innerWidth);

let middle = Math.floor(canvas.width / 2);
middle = middle - (middle % snakeSize) - snakeSize * 5;
console.log(middle);

let snake = [
    { x: middle, y: middle },
    { x: middle - snakeSize * 1, y: middle },
    { x: middle - snakeSize * 2, y: middle },
    { x: middle - snakeSize * 3, y: middle },
];

const directions = {
    ArrowUp: { x: 0, y: -snakeSize },
    ArrowDown: { x: 0, y: snakeSize },
    ArrowRight: { x: snakeSize, y: 0 },
    ArrowLeft: { x: -snakeSize, y: 0 },
};

let foodX = 0;
let foodY = 0;

var moving = undefined;

window.addEventListener("resize", () => {
    if (isGameRunning) return;
    determineSize(window.innerWidth);
});

function determineSize(screenWidth) {
    // 350 x 350 : (10) (< 465) fff
    // 450 x 450 : (10) (465 - 600) fff
    // 525 x 525 : (15) (600 - 750) fff
    // 690 x 525 : (15) (750 - 900) fff
    // 750 x 525 : (15) (900 - 1100) fff
    // 810 x 570 : (15) (1100 >)

    let config = { snakeSize: 15, width: 810, height: 570 };

    const screenConfigs = [
        { maxWidth: 465, snakeSize: 10, width: 350, height: 350 },
        { maxWidth: 600, snakeSize: 10, width: 450, height: 450 },
        { maxWidth: 750, snakeSize: 15, width: 525, height: 525 },
        { maxWidth: 900, snakeSize: 15, width: 690, height: 525 },
        { maxWidth: 1100, snakeSize: 15, width: 750, height: 525 },
    ];

    for (let scf of screenConfigs) {
        if (screenWidth < scf.maxWidth) {
            config = scf;
            break;
        }
    }

    snakeSize = config.snakeSize;
    canvas.width = config.width;
    canvas.height = config.height;
}

function startGame() {
    document.body.addEventListener("keydown", (event) => changeDirection(event.key));
    addFood();

    moving = setInterval(moveSnake, 70);
    // easy - 80
    // average - 70
    // hard - 55

    isGameRunning = true;
}

function getRandomCoords() {
    do {
        var x = Math.floor(Math.random() * (canvas.width - (snakeSize - 1)));
        var y = Math.floor(Math.random() * (canvas.height - (snakeSize - 1)));

        x = x - (x % snakeSize);
        y = y - (y % snakeSize);

        var coordIsInSnake = false;
        for (let part of snake) {
            if (part.x === x && part.y === y) {
                coordIsInSnake = true;
                break;
            }
        }

        // ensures that the generated random coords
        // are not within the body of the snake
    } while (coordIsInSnake);

    foodX = x;
    foodY = y;
}

function addFood() {
    getRandomCoords();

    // paint food
    ctx.fillStyle = "rgb(217, 40, 81)";
    ctx.fillRect(foodX, foodY, snakeSize, snakeSize);
}

const changeDirection = (key) => {
    if (!directionChanged && directions[key] && !keyIsOppositeDirection(key)) {
        currentDirection = key;
        directionChanged = true;
    }
};

function drawSnakePart({ x, y }) {
    ctx.fillStyle = "rgb(48, 246, 71)";

    ctx.fillRect(x, y, snakeSize, snakeSize);
    ctx.strokeRect(x, y, snakeSize, snakeSize);
}

function drawSnake() {
    // erase tail
    const tail = snake[snake.length - 1];
    ctx.clearRect(tail.x - 1, tail.y - 1, snakeSize + 2, snakeSize + 2);
    snake.pop();

    // draw new head
    ctx.fillStyle = "rgb(12, 206, 227)";
    ctx.fillRect(snake[0].x, snake[0].y, snakeSize, snakeSize);
    ctx.strokeRect(snake[0].x, snake[0].y, snakeSize, snakeSize);

    // draw the rest of the body
    for (let i = 1; i < snake.length; i++) {
        drawSnakePart(snake[i]);
    }

    // if food is eaten
    if (snake[0].x === foodX && snake[0].y === foodY) {
        extendSnake();
        addFood();
    }
}

function extendSnake() {
    const tail = {
        x: snake[snake.length - 1].x + directions[currentDirection],
        y: snake[snake.length - 1].y + directions[currentDirection],
    };
    snake.push(tail);
}

const moveSnake = () => {
    const newHead = {
        x: snake[0].x + directions[currentDirection].x,
        y: snake[0].y + directions[currentDirection].y,
        // create new head (advanced in current direction)
    };

    ctx.strokeStyle = "rgb(0, 0, 0)";

    if (collided(newHead)) {
        stopMoving();
        return;
    }

    // add new head to the snake
    snake.unshift(newHead);
    drawSnake();

    directionChanged = false;
};

function stopMoving() {
    clearInterval(moving);
    document.body.removeEventListener("keydown", (event) =>
        changeDirection(event.key)
    );

    ctx.fillStyle = "rgb(231, 22, 22)";
    ctx.fillStyle = "rgb(255, 50, 50)";

    drawDeadSnake(0);

    isGameRunning = false;
}

function drawDeadSnake(i) {
    if (i >= snake.length) {
        const modal = document.getElementById("you-died-modal");
        modal.classList.add("activate-modal");
        console.log(modal);
        return;
    }

    ctx.fillRect(snake[i].x, snake[i].y, snakeSize, snakeSize);
    ctx.strokeRect(snake[i].x, snake[i].y, snakeSize, snakeSize);

    setTimeout(() => drawDeadSnake(i + 1), 30);
}

function keyIsOppositeDirection(key) {
    const opposite = {
        ArrowUp: "ArrowDown",
        ArrowDown: "ArrowUp",
        ArrowRight: "ArrowLeft",
        ArrowLeft: "ArrowRight",
    };

    return opposite[key] === currentDirection;
}

function collided({ x, y }) {
    // check if head collided with body
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            return true;
        }
    }

    // check if head collided with walls
    return (
        y <= -snakeSize || y >= canvas.height || x <= -snakeSize || x >= canvas.width
    );
}

startGame();
