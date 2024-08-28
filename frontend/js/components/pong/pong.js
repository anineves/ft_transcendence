import { drawCenterLine, initializeCanvas, moveOpponentPaddleAI } from './canvasUtils.js';
import { drawScore, drawGameOver } from './score.js';
import { canvas, context, paddleWidth, paddleHeight, playerY, opponentY, movePaddle, stopPaddle } from './canvasUtils.js';
import { endMatch } from '../tournament.js';

let playerScore = 0;
let opponentScore = 0;
let gameOver = false;
let ballSpeedX = 2;
let ballSpeedY = 2;

export let ballX, ballY;
export const ballRadius = 10;
let isAIActive = false;
let animationFrameId;

export const startPongGame = async () => {
    console.log("Starting game...");
    const duration = "01:30:00";
    const winner_id = 0;
    const game = 1;
    const players = [1, 2];
    sessionStorage.setItem('game', game);
    sessionStorage.setItem('players', players);

    try {
        const response = await fetch('http://localhost:8000/api/matches/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ game, players })
        });

        const data = await response.json();

        if (data) {
            console.log('Data:', data);
            sessionStorage.setItem('id_match', data.id);
        } else {
            console.error('Match error', data);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error occurred while processing match.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}

export function initializeBall() {
    if (!canvas) {
        console.error('Canvas element not found for ball');
        return;
    }
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 2;
    ballSpeedY = 2;
}

export function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }
}

export function resetBall() {
    setTimeout(() => {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
    }, 10);
}

function initialize() {

    initializeCanvas();
    initializeBall();

    if (!canvas || !context) {
        console.error('Canvas or context not found');
        return;
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
        drawScore(playerScore, opponentScore);
        if (gameOver) {
            drawGameOver(playerScore);
        }
    }

    function update() {
        if (gameOver) return;
        updateBall();
        if (sessionStorage.getItem('modality') === 'ai') {
            moveOpponentPaddleAI();
            isAIActive = true;
        }
        checkCollisions();
        draw();
    }

    let ballOutOfBoundsLeft = false;
    let ballOutOfBoundsRight = false;

    function checkCollisions() {
        if (ballX - ballRadius < 0) {
            if (!ballOutOfBoundsLeft) {
                opponentScore++;
                if (opponentScore >= 5) {
                    gameOver = true;
                }
                ballOutOfBoundsLeft = true;
                resetBall();
            }
        } else {
            ballOutOfBoundsLeft = false;
        }

        if (ballX + ballRadius > canvas.width) {
            if (!ballOutOfBoundsRight) {
                playerScore++;
                if (playerScore >= 5) {
                    gameOver = true;
                }
                ballOutOfBoundsRight = true;
                resetBall();
            }
        } else {
            ballOutOfBoundsRight = false;
        }

        if (ballX - ballRadius < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
        }

        if (ballX + ballRadius > canvas.width - paddleWidth && ballY > opponentY && ballY < opponentY + paddleHeight) {
            ballSpeedX = -ballSpeedX;
        }
    }

    async function gameLoop() {
        update();

        if (!gameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
            const id = sessionStorage.getItem('id_match');
            console.log('Match ID:', id);

            try {
                const winner_id = playerScore > opponentScore ? 1 : 2;
                const score = `${playerScore}-${opponentScore}`;
                const duration = "10";

                const response = await fetch(`http://localhost:8000/api/match/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ winner_id, score, duration })
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Match updated successfully:', data);
                } else {
                    console.error('Error updating match:', data);
                }
            } catch (error) {
                console.error('Error processing match:', error);
                alert('An error occurred while processing the match.');
            }
            if (sessionStorage.getItem('modality') === 'tournament') {
                showNextMatchButton();
            }
        }
    }

    function showNextMatchButton() {
        const app = document.getElementById('app');
        const nextMatchButton = document.createElement('button');
        nextMatchButton.innerText = 'Next Match';
        nextMatchButton.className = 'btn';
        nextMatchButton.style.display = 'block';
        nextMatchButton.style.margin = '20px auto';

        nextMatchButton.addEventListener('click', () => {
            const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
            const winner = playerScore > opponentScore ? currentMatch.player1 : currentMatch.player2;
            endMatch(winner);
        });
        app.appendChild(nextMatchButton);

    }

    const modality2 = sessionStorage.getItem('modality');
    if (modality2 == 'remote') {

        const ws = new WebSocket('ws://localhost:8000/ws/pong_match/pong1/');  //Change /pong1/

        const user = sessionStorage.getItem('user');
        const user_json = JSON.parse(user)

        console.log('user_id')
        console.log(user_json['id'])

        ws.onopen = () => {
            ws.send(JSON.stringify({
                'action': 'create_match',
                'user': user_json,
                'game': 1,
                'players': [1, 2]
            }));
        }
        ws.onmessage = (event) => {
            console.log('On message event: ')
            console.log(event.data)

            let data = JSON.parse(event.data)

            if (data.action === 'match_created') {
                console.log(`Match created with ID: ${data.match_id}`);
            }

            movePaddle(data);
        }

        document.addEventListener('keydown', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                console.log("Arrow Up/Down -> Keydown")

                ws.send(JSON.stringify({
                    'action': 'move',
                    'user': user_json,
                    'key': event.key
                }));
            }
        });


        document.addEventListener('keyup', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                console.log("Arrow Up/Down -> Keyup")

                ws.send(JSON.stringify({
                    'user': user_json,
                    'key': event.key
                }));

                // stopPaddle(event);
            }
        });

        document.addEventListener('keyup', function (event) {
            if (['w', 'W', 's', 'S'].includes(event.key) && user_json['id'] === 1) {
                console.log("W/S -> Keyup")

                ws.send(JSON.stringify({
                    'user': user_json,
                    'key': event.key
                }));

                // stopPaddle(event);
            }
        });
    }

    if (modality2 != 'remote') {
        document.addEventListener('keydown', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                movePaddle(event);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (['w', 'W', 's', 'S'].includes(event.key) && sessionStorage.getItem('modality') !== 'ai' && sessionStorage.getItem('modality') !== 'remote') {
                movePaddle(event);
            }
        });

        document.addEventListener('keyup', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                stopPaddle(event);
            }
        });

        document.addEventListener('keyup', function (event) {
            if (['w', 'W', 's', 'S'].includes(event.key) && sessionStorage.getItem('modality') !== 'ai' && sessionStorage.getItem('modality') !== 'remote') {
                stopPaddle(event);
            }
        });
    }

    gameLoop();
}

export function stopGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

export function resetGameState() {
    playerScore = 0;
    opponentScore = 0;
    ballSpeedX = 2;
    ballSpeedY = 2;
    initializeCanvas();
    initializeBall();
    stopGame();
}