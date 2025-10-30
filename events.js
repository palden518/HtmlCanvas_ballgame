document.addEventListener("DOMContentLoaded", function () {
  var c = document.querySelector("canvas");
  var ctx = c.getContext("2d");

  c.width = window.innerWidth;
  c.height = window.innerHeight;

  var balls = [];
  var score = 0;
  var speed = 1;

  
  function makeBall(x, y) {
    var angle = Math.random() * Math.PI * 2;
    var ball = {
      x: x,
      y: y,
      radius: 7,
      color: "#00ff00",
      vx: Math.cos(angle) * 2,
      vy: Math.sin(angle) * 2,
    };
    return ball;
  }

  function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  function moveBall(ball) {
    ball.x = ball.x + ball.vx * speed;
    ball.y = ball.y + ball.vy * speed;

    if (ball.x + ball.radius > c.width || ball.x - ball.radius < 0) {
      ball.vx = -ball.vx;
    }
    if (ball.y + ball.radius > c.height || ball.y - ball.radius < 0) {
      ball.vy = -ball.vy;
    }
    if (ball.x < ball.radius) {
      ball.x = ball.radius;
    }
    if (ball.x > c.width - ball.radius) {
      ball.x = c.width - ball.radius;
    }
    if (ball.y < ball.radius) {
      ball.y = ball.radius;
    }
    if (ball.y > c.height - ball.radius) {
      ball.y = c.height - ball.radius;
    }
  }
  var square = null;
  var running = false;

  function makeSquare() {
  var size = 30;
  var sq = {
    x: Math.random() * (c.width - size),
    y: Math.random() * (c.height - size),
    size: size,
    color: "#ff0000",
    speed: 5,
    type: "square", 
  };
  return sq;
}


  function drawSquare(sq) {
    ctx.fillStyle = sq.color;
    ctx.fillRect(sq.x, sq.y, sq.size, sq.size);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(sq.x, sq.y, sq.size, sq.size);
  }

  function moveSquare(direction) {
    if (square === null) return;

    if (direction === "up") {
      square.y = square.y - square.speed;
      if (square.y < 0) square.y = 0;
    }
    if (direction === "down") {
      square.y = square.y + square.speed;
      if (square.y > c.height - square.size) square.y = c.height - square.size;
    }
    if (direction === "left") {
      square.x = square.x - square.speed;
      if (square.x < 0) square.x = 0;
    }
    if (direction === "right") {
      square.x = square.x + square.speed;
      if (square.x > c.width - square.size) square.x = c.width - square.size;
    }
  }

  function hitSquare(ball) {
    if (square === null) {
      return false;
    }
    var closestX = ball.x;
    var closestY = ball.y;

    if (ball.x < square.x) {
      closestX = square.x;
    }
    if (ball.x > square.x + square.size) {
      closestX = square.x + square.size;
    }
    if (ball.y < square.y) {
      closestY = square.y;
    }
    if (ball.y > square.y + square.size) {
      closestY = square.y + square.size;
    }

    var dx = ball.x - closestX;
    var dy = ball.y - closestY;
    var distance = dx * dx + dy * dy;

    return distance < ball.radius * ball.radius;
  }

  function makeRandomShape() {
    var size = 30;
    var shapeTypes = ["square", "circle", "triangle"];
    var randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    var shape = {
      x: Math.random() * (c.width - size),
      y: Math.random() * (c.height - size),
      size: size,
      color: "#ff0000",
      speed: 5,
      type: randomType,
    };
    return shape;
  }
  function drawCircle(shape) {
    ctx.beginPath();
    ctx.arc(
      shape.x + shape.size / 2,
      shape.y + shape.size / 2,
      shape.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = shape.color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawTriangle(shape) {
    ctx.beginPath();
    ctx.moveTo(shape.x + shape.size / 2, shape.y); 
    ctx.lineTo(shape.x, shape.y + shape.size); 
    ctx.lineTo(shape.x + shape.size, shape.y + shape.size); 
    ctx.closePath();
    ctx.fillStyle = shape.color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  function drawRandomShape(shape) {
    if (shape.type === "square") {
      drawSquare(shape);
    } else if (shape.type === "circle") {
      drawCircle(shape);
    } else if (shape.type === "triangle") {
      drawTriangle(shape);
    }
  }

  function showScore() {
    document.getElementById("score").textContent =
      "Score: " + Math.floor(score);
  }

  function updateButtons() {
    var hasStarted = balls.length > 0 || running;
    var hasSquare = square !== null;
    document.getElementById("addBallBtn").disabled = !hasStarted;
    document.getElementById("changeColorBtn").disabled = balls.length === 0;
    document.getElementById("increaseSpeedBtn").disabled = !hasStarted;
    document.getElementById("decreaseSpeedBtn").disabled = !hasStarted;
    document.getElementById("addSquareBtn").disabled = !hasStarted || hasSquare;
    document.getElementById("addRandomshape").disabled = !hasStarted || hasSquare;
    document.getElementById("upBtn").disabled = !hasSquare;
    document.getElementById("downBtn").disabled = !hasSquare;
    document.getElementById("leftBtn").disabled = !hasSquare;
    document.getElementById("rightBtn").disabled = !hasSquare;
  }

  function endGame() {
    running = false;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", c.width / 2, c.height / 2);
    ctx.font = "32px Fantasy";
    ctx.fillText(
      "Final Score: " + Math.floor(score),
      c.width / 2,
      c.height / 2 + 50
    );

    document.getElementById("startBtn").textContent = "Start";
    updateButtons();
  }

  function gameLoop() {
    if (!running) {
      return;
    }
    ctx.clearRect(0, 0, c.width, c.height);
    var i = 0;
    for (i = 0; i < balls.length; i++) {
      moveBall(balls[i]);
      drawBall(balls[i]);
    }
    if (square !== null) {
      drawRandomShape(square);
      for (i = 0; i < balls.length; i++) {
        if (hitSquare(balls[i])) {
          endGame();
          return;
        }
      }
    }

    if (square !== null && balls.length > 0) {
      score = score + balls.length * speed * 0.01;
      showScore();
    }
    requestAnimationFrame(gameLoop);
  }

  function restart() {
    balls = [];
    square = null;
    score = 0;
    speed = 1;
    running = false;
    ctx.clearRect(0, 0, c.width, c.height);
    document.getElementById("startBtn").textContent = "Start";
    showScore();
    updateButtons();
  }

  document.getElementById("startBtn").onclick = function () {
    if (!running) {
      if (balls.length === 0) {
        balls.push(makeBall(10, c.height - 10));
      }
      running = true;
      this.textContent = "Pause";
      gameLoop();
    } else {
      running = false;
      this.textContent = "Resume";
    }
    updateButtons();
  };

  document.getElementById("addBallBtn").onclick = function () {
    balls.push(makeBall(10, c.height - 10));
    updateButtons();
  };
  document.getElementById("changeColorBtn").onclick = function () {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var color = "rgb(" + r + ", " + g + ", " + b + ")";

    var i = 0;
    for (i = 0; i < balls.length; i++) {
      balls[i].color = color;
    }
  };

  document.getElementById("restartBtn").onclick = function () {
    restart();
  };

  document.getElementById("increaseSpeedBtn").onclick = function () {
    speed = speed + 0.5;
  };

  document.getElementById("decreaseSpeedBtn").onclick = function () {
    speed = speed - 0.5;
    if (speed < 0.5) speed = 0.5;
  };

  document.getElementById("addSquareBtn").onclick = function () {
    if (square === null) {
      square = makeSquare();
      updateButtons();
    }
  };
  document.getElementById("addRandomshape").onclick = function () {
    if (square === null) {
      square = makeRandomShape();
      updateButtons();
    }
  };

  document.getElementById("upBtn").onclick = function () {
    moveSquare("up");
  };

  document.getElementById("downBtn").onclick = function () {
    moveSquare("down");
  };

  document.getElementById("leftBtn").onclick = function () {
    moveSquare("left");
  };

  document.getElementById("rightBtn").onclick = function () {
    moveSquare("right");
  };

  document.onkeydown = function (e) {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      moveSquare("up");
    }
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      moveSquare("down");
    }
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      moveSquare("left");
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      moveSquare("right");
    }
  };

  window.onresize = function () {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  };

  showScore();
  updateButtons();
});
