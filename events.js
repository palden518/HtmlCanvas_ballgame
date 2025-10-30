document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let balls = [];
  let square = null;
  let isRunning = false;
  let animationId = null;
  let score = 0;
  let scoreInterval = null;
  let speedMultiplier = 1;

  const startBtn = document.getElementById("startBtn");
  const addBallBtn = document.getElementById("addBallBtn");
  const changeColorBtn = document.getElementById("changeColorBtn");
  const restartBtn = document.getElementById("restartBtn");
  const increaseSpeedBtn = document.getElementById("increaseSpeedBtn");
  const decreaseSpeedBtn = document.getElementById("decreaseSpeedBtn");
  const addSquareBtn = document.getElementById("addSquareBtn");
  const upBtn = document.getElementById("upBtn");
  const downBtn = document.getElementById("downBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  // Factory for Ball objects
  function createBall(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2;
    return {
      x,
      y,
      radius: 7,
      strokeWidth: 2,
      color: "#00ff00",
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();
      },
      update() {
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
          this.vx = -this.vx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
          this.vy = -this.vy;
        }

        this.x = Math.max(
          this.radius,
          Math.min(canvas.width - this.radius, this.x)
        );
        this.y = Math.max(
          this.radius,
          Math.min(canvas.height - this.radius, this.y)
        );
      },
    };
  }

  // Factory for Square object
  function createSquare() {
    const size = 30;
    return {
      x: Math.random() * (canvas.width - size),
      y: Math.random() * (canvas.height - size),
      size,
      color: "#ff0000",
      speed: 5,
      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
      },
      move(direction) {
        if (direction === "up") this.y = Math.max(0, this.y - this.speed);
        if (direction === "down")
          this.y = Math.min(canvas.height - this.size, this.y + this.speed);
        if (direction === "left") this.x = Math.max(0, this.x - this.speed);
        if (direction === "right")
          this.x = Math.min(canvas.width - this.size, this.x + this.speed);
      },
      checkCollision(ball) {
        const closestX = Math.max(this.x, Math.min(ball.x, this.x + this.size));
        const closestY = Math.max(this.y, Math.min(ball.y, this.y + this.size));
        const dx = ball.x - closestX;
        const dy = ball.y - closestY;
        return dx * dx + dy * dy < ball.radius * ball.radius;
      },
    };
  }

  function updateButtonStates() {
    const hasStarted = balls.length > 0 || isRunning;
    addBallBtn.disabled = !hasStarted;
    changeColorBtn.disabled = balls.length === 0;
    increaseSpeedBtn.disabled = !hasStarted;
    decreaseSpeedBtn.disabled = !hasStarted;
    addSquareBtn.disabled = !hasStarted || square !== null;

    const hasSquare = square !== null;
    upBtn.disabled = !hasSquare;
    downBtn.disabled = !hasSquare;
    leftBtn.disabled = !hasSquare;
    rightBtn.disabled = !hasSquare;
  }

  function addBall() {
    balls.push(createBall(10, canvas.height - 10));
    updateButtonStates();
  }

  function changeBallColor() {
    const color = `rgb(${rand255()}, ${rand255()}, ${rand255()})`;
    balls.forEach((ball) => (ball.color = color));
  }

  function rand255() {
    return Math.floor(Math.random() * 256);
  }

  function updateScore() {
    document.getElementById("score").textContent = `Score: ${score}`;
  }

  function startScoring() {
    if (scoreInterval) clearInterval(scoreInterval);
    scoreInterval = setInterval(() => {
      if (square && balls.length > 0 && isRunning) {
        score += balls.length * speedMultiplier;
        updateScore();
      }
    }, 1000);
  }

  function checkCollisions() {
    if (!square) return;
    for (let ball of balls) {
      if (square.checkCollision(ball)) {
        gameOver();
        return;
      }
    }
  }

  // Call updateScore() to show integer score
  function updateScore() {
    document.getElementById("score").textContent = `Score: ${Math.floor(
      score
    )}`;
  }

  // Robust time-based scoring loop
  function startScoring() {
    // clear any previous loop
    if (scoreInterval) clearInterval(scoreInterval);

    // last timestamp in ms
    let last = performance.now();

    // run fairly often so changes (pause, speed change) reflect quickly
    scoreInterval = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000; // elapsed seconds since last tick
      last = now;

      // only accumulate when game is running, square exists and there are balls
      if (isRunning && square && balls.length > 0) {
        // points = elapsedSeconds * numberOfBalls * speedMultiplier
        score += dt * balls.length * speedMultiplier;
        updateScore();
      }
      // if not running, we still updated `last` so when resumed there is no jump
    }, 200); // 200ms is a good balance
  }

  // When pausing/stopping the game clear the interval:
  function stopScoring() {
    if (scoreInterval) {
      clearInterval(scoreInterval);
      scoreInterval = null;
    }
  }

  function gameOver() {
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (scoreInterval) clearInterval(scoreInterval);

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    ctx.font = "32px Arial";
    ctx.fillText(
      `Final Score: ${score}`,
      canvas.width / 2,
      canvas.height / 2 + 50
    );

    startBtn.textContent = "Start";
    updateButtonStates();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach((ball) => {
      ball.update();
      ball.draw();
    });
    if (square) square.draw();
    checkCollisions();
    if (isRunning) animationId = requestAnimationFrame(animate);
  }

  function restart() {
    balls = [];
    square = null;
    score = 0;
    speedMultiplier = 1;
    isRunning = false;

    if (animationId) cancelAnimationFrame(animationId);
    if (scoreInterval) clearInterval(scoreInterval);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startBtn.textContent = "Start";
    updateScore();
    updateButtonStates();
  }

  // EVENT HANDLERS
  startBtn.addEventListener("click", function () {
    if (!isRunning) {
      if (balls.length === 0) addBall();
      isRunning = true;
      this.textContent = "Pause";
      startScoring();
      animate();
    } else {
      isRunning = false;
      this.textContent = "Resume";
      cancelAnimationFrame(animationId);
      clearInterval(scoreInterval);
    }
    updateButtonStates();
  });

  addBallBtn.addEventListener("click", addBall);
  changeColorBtn.addEventListener("click", changeBallColor);
  restartBtn.addEventListener("click", restart);
  increaseSpeedBtn.addEventListener("click", () => (speedMultiplier += 0.5));
  decreaseSpeedBtn.addEventListener(
    "click",
    () => (speedMultiplier = Math.max(0.5, speedMultiplier - 0.5))
  );
  addSquareBtn.addEventListener("click", () => {
    if (!square) {
      square = createSquare();
      updateButtonStates();
    }
  });

  // Helper to move the square if it exists
  function moveSquare(direction) {
    if (square) square.move(direction);
  }

  // Set up button controls in a loop
  ["up", "down", "left", "right"].forEach((dir) => {
    document
      .getElementById(dir + "Btn")
      .addEventListener("click", () => moveSquare(dir));
  });

  // Keyboard controls
  document.addEventListener("keydown", (e) => {
    const keyMap = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
    };
    const dir = keyMap[e.key];
    if (dir) {
      moveSquare(dir);
      e.preventDefault();
    }
  });

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  updateScore();
  updateButtonStates();
});
