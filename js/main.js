const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let score = 0;

const canvas_container = canvas.parentElement;
const window_height = canvas_container.clientHeight;
const window_width = canvas_container.clientWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "url('assets/img/background.jpg') no-repeat center";

canvas.style.cursor = "none";

class Cursor {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.imagePath = image;
        this.image = new Image();
        this.image.src = this.imagePath;
        this.radius = this.image.width / 3;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y);
    }
}

const cursor = new Cursor(0, 0, "assets/img/cursors/hand_open.png");

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    cursor.x = e.clientX - rect.left - cursor.image.width / 3;
    cursor.y = e.clientY - rect.top - cursor.image.height / 2;
});

const intro = document.getElementById("intro");
const start = document.getElementById("start");
start.addEventListener("click", (e) => {
    intro.style.display = "none";
    canvas.style.display = "block";
});

const FRUITS = [
    "assets/img/fruits/apple.png",
    "assets/img/fruits/orange.png",
    "assets/img/fruits/peach.png",
    "assets/img/fruits/pear.png",
];

const TREES = [
    "assets/img/fruits/apple-tree.png",
    "assets/img/fruits/orange-tree.png",
    "assets/img/fruits/peach-tree.png",
    "assets/img/fruits/pear-tree.png",
];

const CROW = "assets/img/crows/crow.png";

const TREE_WIDTH = 495;
const TREE_HEIGHT = 600;

class Fruit {
    constructor(x, y, radius, speed, fruitIndex) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.speed = speed;

        this.img = new Image();
        this.img.src = FRUITS[fruitIndex];

        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    draw(context) {
        context.save();

        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);

        context.closePath();
        context.clip();

        context.drawImage(
            this.img,
            this.posX - this.radius,
            this.posY - this.radius,
            2 * this.radius,
            2 * this.radius
        );
        context.restore();
    }

    update(context) {
        this.draw(context);

        if (this.posX + this.radius > window_width) {
            this.dx = -this.dx;
        }

        if (this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        if (this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        if (this.posY + this.radius > window_height) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }
}

class Tree {
    constructor(x, y, treeIndex, factor, fruits, delay) {
        this.x = x;
        this.y = y;
        this.factor = factor;
        this.treeIndex = treeIndex;
        this.img = new Image();
        this.img.src = TREES[treeIndex];
        this.fruits = fruits;
        this.delay = delay;
    }

    draw(context) {
        context.drawImage(
            this.img,
            this.x,
            this.y,
            TREE_WIDTH * this.factor,
            TREE_HEIGHT * this.factor
        );
    }

    update(context) {
        this.draw(context);
        if (Math.random() < this.delay) {
            let r = getRandomBetween(20, 80 * this.factor);
            let x = getRandomBetween(this.x, this.x + TREE_WIDTH * this.factor);
            let y = getRandomBetween(
                this.y,
                (this.y + TREE_HEIGHT * this.factor) / 2 + r
            );
            let s = getRandomBetween(1, 4);
            let fruit = new Fruit(x, y, r, s, this.treeIndex);
            fruits.push(fruit);
        }
    }

    isOverlapping(rect) {
        return !(
            this.x + TREE_WIDTH * this.factor < rect.x ||
            this.x > rect.x + TREE_WIDTH * rect.factor ||
            this.y + TREE_HEIGHT * this.factor < rect.y ||
            this.y > rect.y + TREE_WIDTH * rect.factor
        );
    }
}

class Crow {
    constructor(x, y, image, speed, direction) {
        this.x = x;
        this.y = y;
        this.imagePath = image;
        this.image = new Image();
        this.image.src = this.imagePath;
        this.speed = speed;
        this.direction = direction;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, 150, 150);
    }

    update(context) {
        this.draw(context);
        if (this.direction === -1) {
            this.x -= this.speed;
        } else if (this.direction === 1) {
            this.x += this.speed;
        }
    }
}

let crows = [];

function isCircleInsideRect(cx, cy, radius, rx, ry, rw, rh) {
    if (cx - radius < rx) return false;
    if (cx + radius > rx + rw) return false;
    if (cy - radius < ry) return false;
    if (cy + radius > ry + rh) return false;
    return true;
}

function getRandomColor() {
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
}

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function getDistance(x1, y1, x2, y2) {
    let sqr1 = Math.pow(x2 - x1, 2);
    let sqr2 = Math.pow(y2 - y1, 2);
    return Math.sqrt(sqr1 + sqr2);
}

let fruits = [];
let trees = [];

for (let i = 0; i < 4; i++) {
    let factor = getRandomBetween(0.3, 0.6);
    let idx = Math.floor(Math.random() * TREES.length);
    let overlap = false;
    let newTree;
    const MAX_ATTEMPTS = 200;
    let attempt = 0;
    do {
        if (attempt >= MAX_ATTEMPTS) break;
        let randomX = getRandomBetween(0, window_width - TREE_WIDTH);
        let randomY = getRandomBetween(
            window_height / 2,
            window_height - TREE_HEIGHT
        );
        newTree = new Tree(randomX, randomY, idx, factor, fruits, 0.005);
        overlap = trees.some((tree) => tree.isOverlapping(newTree));
        attempt++;
    } while (overlap);
    trees.push(newTree);
}

let mouseX;
let mouseY;

document.addEventListener("mousedown", (e) => {
    let canvas_rect = canvas.getBoundingClientRect();
    mouseX = Math.floor(e.clientX - canvas_rect.left);
    mouseY = Math.floor(e.clientY - canvas_rect.top);
});

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    fruits.length = 0;
});

let updateGame = function () {
    requestAnimationFrame(updateGame);

    ctx.clearRect(0, 0, window_width, window_height);

    trees.forEach((tree) => {
        tree.update(ctx);
    });

    if (Math.random() > 0.99) {
        let crow;
        if (Math.random() > 0.5) {
            let y = Math.floor((3 * (Math.random() * window_height)) / 4);
            let s = Math.floor(Math.random() * 8) + 2;
            crow = new Crow(window_width + 300, y, CROW, s, -1);
        } else {
            let y = Math.floor((3 * (Math.random() * window_height)) / 4);
            let s = Math.floor(Math.random() * 8) + 2;
            crow = new Crow(-300, y, CROW, s, 1);
        }
        crows.push(crow);
    }

    let index = 0;
    fruits.forEach((fruit) => {
        fruit.update(ctx);
        fruits.forEach((fruit2) => {
            if (
                fruit !== fruit2 &&
                getDistance(fruit.posX, fruit.posY, fruit2.posX, fruit2.posY) <
                    fruit.radius + fruit2.radius
            ) {
                let color = getRandomColor();
                fruit.color = color;
                fruit2.color = color;

                // calcula el ángulo de colisión
                let dx = fruit2.posX - fruit.posX;
                let dy = fruit2.posY - fruit.posY;
                let collisionAngle = Math.atan2(dy, dx);

                fruit.dx = -Math.cos(collisionAngle) * fruit.speed;
                fruit.dy = -Math.sin(collisionAngle) * fruit.speed;
            }
        });

        if (
            getDistance(fruit.posX, fruit.posY, mouseX, mouseY) <
            fruit.radius + cursor.radius
        ) {
            console.log("Picked up fruit");
            score += 10;
            fruits.splice(index, 1);
            mouseX = -1;
            mouseY = -1;
        }

        // comprueba si el circulo ha salido del canvas
        if (fruit.posY + fruit.radius <= 0) {
            fruits.splice(index, 1);
            console.log(
                `Removed fruit ${fruit.text} at (${fruit.posX}, ${fruit.posY}) cause flew too high`
            );
        }

        index++;
    });

    cursor.draw(ctx);

    crows.forEach((crow) => {
        crow.update(ctx);
        if (
            isCircleInsideRect(
                mouseX,
                mouseY,
                cursor.radius,
                crow.x,
                crow.y,
                crow.image.width,
                crow.image.height
            )
        ) {
            score -= 50;
            mouseX = -1;
            mouseY = -1;
        }
    });

    ctx.font = "48px Verdana";
    ctx.fillText(`Score: ${score}`, window_width / 2, 60);
};

updateGame();
