const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// const factor = 2 / 3;
//Obtiene las dimensiones de la pantalla actual
const canvas_container = canvas.parentElement;
const window_height = canvas_container.clientHeight; // * factor;
const window_width = canvas_container.clientWidth; //* factor;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "hsl(260, 50%, 80%)";

const src = "assets/img/googly-a-removebg.png";

class Circle {
    constructor(x, y, radius, color, text, speed, img) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;

        this.img = new Image();
        this.img.src = img;

        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    draw(context) {
        context.save();

        context.beginPath();
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        // context.stroke();

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

function getRandomColor() {
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
}

function getDistance(x1, y1, x2, y2) {
    let sqr1 = Math.pow(x2 - x1, 2);
    let sqr2 = Math.pow(y2 - y1, 2);
    return Math.sqrt(sqr1 + sqr2);
}

let circles = [];
for (let i = 0; i < 15; i++) {
    let radius = Math.floor(Math.random() * 100) + 20;
    let randomX = Math.floor(
        Math.random() * (window_width - radius * 2) + radius
    );
    let randomY =
        // window_height +
        Math.floor(
            Math.random() * /* 2 *  */ (window_height - radius * 2) + radius
        );
    let speed = Math.random() * 5 + 1;

    console.log(`Circle[${i + 1}] at: ${randomX}, ${randomY}`);
    let circle = new Circle(
        randomX,
        randomY,
        radius,
        "purple",
        `${i + 1}`,
        speed,
        src
    );
    circles.push(circle);
}

let mouseX;
let mouseY;

document.addEventListener("click", (e) => {
    let canvas_rect = canvas.getBoundingClientRect();
    mouseX = Math.floor(e.clientX - canvas_rect.left);
    mouseY = Math.floor(e.clientY - canvas_rect.top);
});

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    let canvas_rect = canvas.getBoundingClientRect();
    x = Math.floor(e.clientX - canvas_rect.left);
    y = Math.floor(e.clientY - canvas_rect.top);

    let newCircle = new Circle(x, y, 100, "red", "hey", 3, src);
    circles.push(newCircle);
    mouseX = -1;
    mouseY = -1;
});

let updateCircle = function () {
    requestAnimationFrame(updateCircle);

    ctx.clearRect(0, 0, window_width, window_height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px Arial";
    ctx.fillText(`x: ${mouseX} y:${mouseY}`, 75, 15);

    let index = 0;
    circles.forEach((circle) => {
        circle.update(ctx);
        circles.forEach((circle2) => {
            if (
                circle !== circle2 &&
                getDistance(
                    circle.posX,
                    circle.posY,
                    circle2.posX,
                    circle2.posY
                ) <
                    circle.radius + circle2.radius
            ) {
                let color = getRandomColor();
                circle.color = color;
                circle2.color = color;

                // calcula el ángulo de colisión
                let dx = circle2.posX - circle.posX;
                let dy = circle2.posY - circle.posY;
                let collisionAngle = Math.atan2(dy, dx);

                circle.dx = -Math.cos(collisionAngle) * circle.speed;
                circle.dy = -Math.sin(collisionAngle) * circle.speed;
            }
        });

        if (
            getDistance(circle.posX, circle.posY, mouseX, mouseY) <
            circle.radius
        ) {
            console.log(
                // `Popped circle ${circle.text} at (${circle.posX}, ${circle.posY}) mouse shot at (${mouseX}, ${mouseY})`
                "Popped circle mouse shot"
            );
            circle.color = getRandomColor();
            circles.splice(index, 1);
            mouseX = -1;
            mouseY = -1;
        }

        // comprueba si el circulo ha salido del canvas
        if (circle.posY + circle.radius <= 0) {
            circles.splice(index, 1);
            console.log(
                `Popped circle ${circle.text} at (${circle.posX}, ${circle.posY}) cause flew too high`
            );
        }

        index++;
    });
};

updateCircle();
