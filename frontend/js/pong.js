const startPongGame = () => {
    var canvas = document.getElementById('pongCanvas');
    var context = canvas.getContext('2d');
    let moldure  = document.getElementsByClassName('tv-container');

    var paddleHeight = 100;
    var paddleWidth = 10;
    var ballRadius = 10;
    var playerY = (canvas.height - paddleHeight) / 2;
    var opponentY = (canvas.height - paddleHeight) / 2;
    var ballX = canvas.width / 2;
    var ballY = canvas.height / 2;
    var ballSpeedX = 5;
    var ballSpeedY = 5;
    var paddleSpeed = 10;

    var playerScore = 0;
    var opponentScore = 0;
    var gameOver = false;

    function drawCenterLine() {
        context.beginPath();
        context.setLineDash([5, 15]);
        context.moveTo(canvas.width / 2, 0);
        context.lineTo(canvas.width / 2, canvas.height);
        context.strokeStyle = '#0000DD';
        context.stroke();
        context.setLineDash([]); 
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawCenterLine();
        context.fillStyle = '#0000DD';
        context.fillRect(0, playerY, paddleWidth, paddleHeight);
        context.fillRect(canvas.width - paddleWidth, opponentY, paddleWidth, paddleHeight);
    
        context.beginPath();
        context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        context.fillStyle = '#00AA00';
        context.fill();
        context.closePath();
    
        context.font = "16px 'Press Start 2P', cursive";
        context.fillStyle = "#ffcc00";
        context.fillText("Player: " + playerScore, 20, 20);
        context.fillText("Opponent: " + opponentScore, canvas.width - 220, 20);
    
        if (gameOver) {
            context.font = "32px 'Press Start 2P', cursive"; 
            context.fillStyle = "#ffcc00";
            context.fillText("Game Over", canvas.width / 2 - 140, canvas.height / 2);
            if (playerScore === 5) {
                context.fillText("Player Wins!", canvas.width / 2 - 170, canvas.height / 2 + 40);
            } else {
                context.fillText("Opponent Wins!", canvas.width / 2 - 220, canvas.height / 2 + 40);
            }
        }
    }

    function update() {
        if (gameOver) return;

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
            ballSpeedY = -ballSpeedY;
        }

        if (ballX - ballRadius < paddleWidth) {
            if (ballY > playerY && ballY < playerY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
            } else {
                opponentScore++;
                if (opponentScore >= 5) {
                    gameOver = true;
                }
                resetBall();
            }
        }

        if (ballX + ballRadius > canvas.width - paddleWidth) {
            if (ballY > opponentY && ballY < opponentY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
            } else {
                playerScore++;
                if (playerScore >= 5) {
                    gameOver = true;
                }
                resetBall();
            }
        }

        if (playerY < 0) {
            playerY = 0;
        } else if (playerY + paddleHeight > canvas.height) {
            playerY = canvas.height - paddleHeight;
        }

        if (opponentY < 0) {
            opponentY = 0;
        } else if (opponentY + paddleHeight > canvas.height) {
            opponentY = canvas.height - paddleHeight;
        }

        draw();
    }

    function resetBall() {
        setTimeout(function() {
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            ballSpeedX = -ballSpeedX;
        }, 10);
    }

    function gameLoop() {
        update();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
            movePaddle(event);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
            stopPaddle(event);
        }
    });

    var playerPaddleInterval, opponentPaddleInterval;

    function movePaddle(event) {
        if (event.key === 'ArrowUp') {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(function() {
                playerY -= paddleSpeed;
                if (playerY < 0) playerY = 0;
            }, 16);
        } else if (event.key === 'ArrowDown') {
            clearInterval(playerPaddleInterval);
            playerPaddleInterval = setInterval(function() {
                playerY += paddleSpeed;
                if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;
            }, 16);
        } else if (event.key === 'w' || event.key === 'W') {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(function() {
                opponentY -= paddleSpeed;
                if (opponentY < 0) opponentY = 0;
            }, 16);
        } else if (event.key === 's' || event.key === 'S') {
            clearInterval(opponentPaddleInterval);
            opponentPaddleInterval = setInterval(function() {
                opponentY += paddleSpeed;
                if (opponentY + paddleHeight > canvas.height) opponentY = canvas.height - paddleHeight;
            }, 16);
        }
    }

    function stopPaddle(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            clearInterval(playerPaddleInterval);
        } else if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
            clearInterval(opponentPaddleInterval);
        }
    }

    gameLoop();
};
