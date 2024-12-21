const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let currentDirection = "ArrowRight";
let directionChanged = false;

var snakeSize = 15;

let snake = [
    { x: 150, y: 150 },
    { x: 135, y: 150 },
    { x: 120, y: 150 },
    { x: 105, y: 150 },
    // { x: 110, y: 150 },
    // { x: 100, y: 150 },
    // { x: 90, y: 150 },
    // { x: 80, y: 150 },
];

const directions = {
    ArrowUp: { x: 0, y: -snakeSize },
    ArrowDown: { x: 0, y: snakeSize },
    ArrowRight: { x: snakeSize, y: 0 },
    ArrowLeft: { x: -snakeSize, y: 0 },
};

let foodX = 0;
let foodY = 0;



document.body.addEventListener("keydown", (event) => changeDirection(event.key));
addFood();
snake.forEach((part) => drawSnakePart(part));

function getRandomCoords() {
    do {
        var x = Math.floor(Math.random() * (canvas.width - (snakeSize - 1)));
        var y = Math.floor(Math.random() * (canvas.height - (snakeSize - 1)));

        console.log(x)
       
        x = x - (x % snakeSize);
        y = y - (y % snakeSize);

        var coordIsInSnake = false;
        for(let part of snake){
            if (part.x === x && part.y === y) {
                coordIsInSnake = true;
                break;
            }
        }
        
        // this ensures that the generate coords
        // are not within the body of the snake
    } while (coordIsInSnake);

    foodX = x;
    foodY = y;
}

function addFood() {
    getRandomCoords();

    // painting food
    ctx.strokeStyle = "rgb(197, 13, 56)";
    ctx.fillStyle = "rgb(217, 40, 81)";
    ctx.fillRect(foodX, foodY, snakeSize, snakeSize);
    ctx.strokeRect(foodX, foodY, snakeSize, snakeSize);
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
    ctx.clearRect(tail.x - 1, tail.y - 1, snakeSize + 2, snakeSize + 2 );
    snake.pop();

    ctx.fillStyle = "rgb(12, 206, 227)";

    ctx.fillRect(snake[0].x, snake[0].y, snakeSize, snakeSize);
    ctx.strokeRect(snake[0].x, snake[0].y, snakeSize, snakeSize);

    for(let i = 1; i < snake.length; i++){
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
    const head = {
        x: snake[0].x + directions[currentDirection].x,
        y: snake[0].y + directions[currentDirection].y,
    };

    console.log(head.x, head.y);

    ctx.strokeStyle = "rgb(0, 0, 0)";

    if (collided(head)) {
        clearInterval(moving);
        document.body.removeEventListener("keydown", (event) =>
            changeDirection(event.key)
        );

        ctx.fillStyle = "rgb(231, 22, 22)";

        ctx.fillRect(snake[0].x, snake[0].y, snakeSize, snakeSize);
        ctx.strokeRect(snake[0].x, snake[0].y, snakeSize, snakeSize);

        return;
    }

    snake.unshift(head);
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
    // check if head collided with body
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            return true;
        }
    }

    // check if head collided with walls
    return y <= -snakeSize || y >= canvas.height || x <= -snakeSize || x >= canvas.width;
}

const moving = setInterval(moveSnake, 70);
// easy - 80
// average - 70
// hard - 55