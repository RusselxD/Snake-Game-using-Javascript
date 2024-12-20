const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let currentDirection = "ArrowRight";
let directionChanged = false;

let snake = [
    { x: 150, y: 150 },
    { x: 140, y: 150 },
    { x: 130, y: 150 },
    { x: 120, y: 150 },
    { x: 110, y: 150 },
    { x: 100, y: 150 },
    { x: 90, y: 150 },
    { x: 80, y: 150 },
];

const directions = {
    ArrowUp: { x: 0, y: -10 },
    ArrowDown: { x: 0, y: 10 },
    ArrowRight: { x: 10, y: 0 },
    ArrowLeft: { x: -10, y: 0 },
};

let foodX = 0;
let foodY = 0;

document.body.addEventListener("keydown", (event) => changeDirection(event.key));
addFood();

function addFood() {
    let x = Math.floor(Math.random() * canvas.width - 9);
    let y = Math.floor(Math.random() * canvas.height - 9);

    foodX = x - (x % 10);
    foodY = y - (y % 10);
}

const changeDirection = (key) => {
    if (!directionChanged && directions[key] && !keyIsOppositeDirection(key)) {
        currentDirection = key;
        directionChanged = true;
    }
};

function drawSnakePart({ x, y }) {
    ctx.fillStyle = "rgb(48, 246, 71)";
    ctx.strokeStyle = "rgb(2, 95, 13)";

    ctx.fillRect(x, y, 10, 10);
    ctx.strokeRect(x, y, 10, 10);
}

function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // painting food
    ctx.strokeStyle = "rgb(197, 13, 56)";
    ctx.fillStyle = "rgb(217, 40, 81)";
    ctx.fillRect(foodX, foodY, 10, 10);
    ctx.strokeRect(foodX, foodY, 10, 10);

    snake.forEach((part) => drawSnakePart(part));

    if (snake[0].x === foodX && snake[0].y === foodY) {
        extendSnake();
        addFood();
    }
}

function extendSnake() {
    const tail = {
        x: snake[snake.length - 1].x - 10,
        y: snake[snake.length - 1].y,
    };
    snake.push(tail);
}

const moveSnake = () => {
    const head = {
        x: snake[0].x + directions[currentDirection].x,
        y: snake[0].y + directions[currentDirection].y,
    };

    if (collided(head)) {
        clearInterval(moving);
        document.body.removeEventListener("keydown", (event) => changeDirection(event.key));
        return;
    }

    snake.unshift(head);
    snake.pop();

    drawSnake();

    directionChanged = false;
};

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
    // check if collided with body
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            return true;
        }
    }

    // check if collided with walls
    return y <= -10 || y >= canvas.height || x <= -10 || x >= canvas.width;
}

const moving = setInterval(moveSnake, 70);
// easy - 70
// average - 55
// hard - 40