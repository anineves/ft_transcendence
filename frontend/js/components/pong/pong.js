import { drawCenterLine, initializeCanvas, moveOpponentPaddleAI, } from './canvasUtils.js';
import { drawScore, drawGameOver } from './score.js';
import { canvas, context, paddleWidth, paddleHeight, playerY, opponentY, movePaddle, stopPaddle } from './canvasUtils.js';
import {endMatch} from '../tournament.js';

let playerScore = 0;
let opponentScore = 0;
let gameOver = false;

export let ballX, ballY, ballSpeedX, ballSpeedY;
export const ballRadius = 10;
let isAIActive = false;

export const startPongGame = async () => {
    const duration = "01:30:00";
    const winner_id = 0;
    const game = 1;
    const players = [1, 2];
    localStorage.setItem('game', game);
    localStorage.setItem('players', players);

    console.log("entrei Pong");

    try {
        const response = await fetch('http://localhost:8000/api/matches/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ game, players })
        });

        const data = await response.json();

        if (data) {
            console.log('Data:', data);
            localStorage.setItem('id_match', data.id);
        } else {
            console.error('match error', data);
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
        if (localStorage.getItem('game') === 'ai') {
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
        requestAnimationFrame(gameLoop);
    } else {
        const id = localStorage.getItem('id_match');
        console.log('ID da partida:', id);

        try {
            const winner_id = playerScore > opponentScore ? 1 : 2; 
            const score = `${playerScore}-${opponentScore}`;
            const duration = "10";  

            const response = await fetch(`http://localhost:8000/api/match/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ winner_id, score, duration })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Match atualizado com sucesso:', data);
            } else {
                console.error('Erro na atualização da partida:', data);
            }
        } catch (error) {
            console.error('Erro ao processar a partida:', error);
            alert('Ocorreu um erro ao processar a partida.');
        }

        showNextMatchButton();
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
        const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));
        const winner = playerScore > opponentScore ? currentMatch.player1 : currentMatch.player2;

        endMatch(winner);
    });

    app.appendChild(nextMatchButton);
}



    document.addEventListener('keydown', function(event) {
        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            movePaddle(event);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (['w', 'W', 's', 'S'].includes(event.key) && localStorage.getItem('game') === 'player') {
            const game = localStorage.getItem('game');
            console.log(game);
            movePaddle(event);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            stopPaddle(event);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (['w', 'W', 's', 'S'].includes(event.key) && localStorage.getItem('game') === 'player') {
            stopPaddle(event);
        }
    });

    

    gameLoop();
}


