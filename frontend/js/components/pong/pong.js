import { drawCenterLine, initializeCanvas, moveOpponentPaddleAI } from './canvasUtils.js';
import { drawScore, drawGameOver } from './score.js';
import { canvas, context, paddleWidth, paddleHeight, playerY, opponentY, movePaddle, stopPaddle } from './canvasUtils.js';
import { endMatch } from '../tournament.js';
import { initPongSocket } from './pongSocket.js'
import { navigateTo } from '../../utils.js';

let playerScore = 0;
let opponentScore = 0;
let gameOver = false;
let ballSpeedX = 2;
let ballSpeedY = 2;
let isAIActive = false;
let ws;
let animationFrameId;

export let ballX, ballY;
export const ballRadius = 10;

export const startPongGame = async () => {
    const user = sessionStorage.getItem('user');
    let inviter = sessionStorage.getItem("Inviter");
    const player = sessionStorage.getItem('player');
    const game = 1;
    let modality2 = sessionStorage.getItem('modality');
    let opponent = 1;
    let friendId = sessionStorage.getItem('friendID');
    let nickTorn = sessionStorage.getItem("nickTorn");
    if (modality2 == 'remote' && inviter == "True")
        opponent = friendId;
    const players = [player, opponent];
    sessionStorage.setItem('game', game);
    sessionStorage.setItem('players', players);

    resetGameState();
    let match_type = "RM";
    if (modality2 == "ai") match_type = "AI";
    if (modality2 == "remote") match_type = "RM";
    if (modality2 == "tournament") match_type = "TN";
    if (modality2 == "player" || modality2 == "3D") match_type = "MP";

    if (user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True'))&& (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True')))  {
        if (player) {
            try {
                const response = await fetch('http://localhost:8000/api/matches/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ game, players, match_type })
                });

                const data = await response.json();
                if (data) {
                    console.log('Match created successfully:', data);
                    sessionStorage.setItem('id_match', data.id);
                } else {
                    console.error('Match error', data);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error occurred while processing match.');
            }
        }
    }
    if (modality2 == 'remote') {
        const groupName = sessionStorage.getItem("groupName");
        ws = initPongSocket(`ws://localhost:8000/ws/pong_match/${groupName}/`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === 'ball_track') {
                ballX = data.message.ball_x;
                ballY = data.message.ball_y;
                ballSpeedY = data.message.ballSpeedY;
                ballSpeedX = data.message.ballSpeedX;
            }
            if (data.action === 'move_paddle') movePaddle(data);
            if (data.action === 'stop_paddle') stopPaddle(data);
            if (data.action === 'score_track') {
                playerScore = data.message.player_score;
                opponentScore = data.message.opponent_score;
                gameOver = data.message.game_over;
            }
        };
    }

    initialize();
};

export function initializeBall() {
    if (!canvas) return;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 2;
    ballSpeedY = 2;
}

export function updateBall() {
    let modality2 = sessionStorage.getItem('modality');
    const playerID = sessionStorage.getItem('playerID');
    const currentPlayer = sessionStorage.getItem('player');
    const user = sessionStorage.getItem('user');
    const user_json = JSON.parse(user);
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
        if (modality2 == 'remote') {
            if (currentPlayer === playerID) {
                ws.send(JSON.stringify({
                    'action': 'ball_track',
                    'message': {
                        'user': user_json,
                        'ball_x': ballX,
                        'ball_y': ballY,
                        'ballSpeedY': ballSpeedY,
                        'ballSpeedX': ballSpeedX
                    }
                }));
            }
        }
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
    if (!canvas || !context) return;

    const handleVisibilityChange = () => {
        const user = sessionStorage.getItem('user');
        const user_json = JSON.parse(user);
        let friendID = sessionStorage.getItem('friendID');
        let playerID = sessionStorage.getItem('player');
        let inviter = sessionStorage.getItem("Inviter");
        let groupName = sessionStorage.getItem('groupName')
        
        if (ws) {
            ws.send(JSON.stringify({
                'action': 'player_disconnected',
                'message': {
                    'player_id': playerID,
                    'friend_id': friendID,
                    'inviter': inviter,
                    'group_name': groupName,
                }
            }));
            console.log("group", friendID, groupName);
        }
        stopGame(); 
        navigateTo('/');
        alert("Você saiu do jogo.");
    };

    const handleOffline = () => {
        if (ws) {
            ws.send(JSON.stringify({
                'action': 'player_disconnected'
            }));
            ws.close(); 
        }
        stopGame(); 
        alert("Você perdeu a conexão com a internet. O jogo será encerrado.");
    };

  
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);


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
        if (gameOver) drawGameOver(playerScore);
    }

    function update() {
        if (gameOver) return;
        updateBall();
        let modality2 = sessionStorage.getItem('modality');
        if (modality2 == 'ai') {
            moveOpponentPaddleAI(ballY);
            isAIActive = true;

        }
        checkCollisions();
        draw();
    }

    let ballOutOfBoundsLeft = false;
    let ballOutOfBoundsRight = false;

    function checkCollisions() {
        const currentPlayer = sessionStorage.getItem('player');
        const user = sessionStorage.getItem('user');
        const user_json = JSON.parse(user);
        let modality2 = sessionStorage.getItem('modality');
        const playerID = sessionStorage.getItem('playerID');
        if (ballX - ballRadius < 0) {
            if (!ballOutOfBoundsLeft) {
                opponentScore++;
                if (opponentScore >= 5) {
                    gameOver = true;
                }

                ballOutOfBoundsLeft = true;
                if (modality2 == 'remote') {
                    if (currentPlayer === playerID) {
                        ws.send(JSON.stringify({
                            'action': 'score_track',
                            'message': {
                                'user': user_json,
                                'player_score': playerScore,
                                'opponent_score': opponentScore,
                                'game_over': gameOver
                            }
                        }));
                    }
                }
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
                if (modality2 == 'remote') {
                    if (currentPlayer === playerID) {
                        ws.send(JSON.stringify({
                            'action': 'score_track',
                            'message': {
                                'user': user_json,
                                'player_score': playerScore,
                                'opponent_score': opponentScore,
                                'game_over': gameOver
                            }
                        }));
                    }
                }
                resetBall();
            }
        } else {
            ballOutOfBoundsRight = false;
        }


        if (ballX - ballRadius < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
            ballX = paddleWidth + ballRadius;
            ballSpeedX = -ballSpeedX;
            if (modality2 == 'remote') {
                if (currentPlayer === playerID) {
                    ws.send(JSON.stringify({
                        'action': 'ball_track',
                        'message': {
                            'user': user_json,
                            'ball_x': ballX,
                            'ball_y': ballY,
                            'ballSpeedY': ballSpeedY,
                            'ballSpeedX': ballSpeedX
                        }
                    }));
                }
            }
        }

        if (ballX + ballRadius > canvas.width - paddleWidth && ballY > opponentY && ballY < opponentY + paddleHeight) {
            ballX = canvas.width - paddleWidth - ballRadius;
            ballSpeedX = -ballSpeedX;
            if (modality2 == 'remote') {
                if (currentPlayer === playerID) {
                    ws.send(JSON.stringify({
                        'action': 'ball_track',
                        'message': {
                            'user': user_json,
                            'ball_x': ballX,
                            'ball_y': ballY,
                            'ballSpeedY': ballSpeedY,
                            'ballSpeedX': ballSpeedX
                        }
                    }));
                }
            }
        }
    }
    async function gameLoop() {

        update();
        const user = sessionStorage.getItem('user');
        let inviter = sessionStorage.getItem("Inviter");
        const player = sessionStorage.getItem('player');
        const game = 1;
        const modality2 = sessionStorage.getItem('modality');
        let opponent = 1;
        let friendId = sessionStorage.getItem('friendID');
        if (modality2 == 'remote' && inviter == "True")
            opponent = friendId;
        const players = [player, opponent];
        sessionStorage.setItem('game', game);
        sessionStorage.setItem('players', players);
        let nickTorn = sessionStorage.getItem("nickTorn");

        if (!gameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
            const id = sessionStorage.getItem('id_match');
            let winner_id = opponent;
            if (user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True'))&& (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True'))) {
                try {
                    if(modality2 == 'remote')
                        ws =  null;
                    if (playerScore > opponentScore)
                        winner_id = player;
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
            }
            if (sessionStorage.getItem('modality') == 'tournament') {
                showNextMatchButton();
            }
            sessionStorage.removeItem("Inviter");
            sessionStorage.removeItem("groupName");
            sessionStorage.setItem('WS', 'clean');
            ws =  null;
        }
    }

    function showNextMatchButton() {
        const app = document.getElementById('app');
        const nextMatchButton = document.createElement('button');
        nextMatchButton.innerText = 'Next Match';
        nextMatchButton.className = 'btn';
        nextMatchButton.style.margin = '20px auto';
        nextMatchButton.addEventListener('click', () => {
            const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
            const winner = playerScore > opponentScore ? currentMatch.player1 : currentMatch.player2;
            endMatch(winner);
        });
        app.appendChild(nextMatchButton);
    }

    const modality2 = sessionStorage.getItem('modality');
    if (modality2 != 'remote') {
        //console.log("entreiiiiiiiii")
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
    else if (modality2 == 'remote') {
        //console.log("entreiiiiiiiii remore")
        const player_id = sessionStorage.getItem("player");
        document.addEventListener('keydown', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                ws.send(JSON.stringify({
                    'action': 'move_paddle',
                    'message': {
                        'user': player_id,
                        'key': event.key
                    }
                }));
            }
        });
        document.addEventListener('keyup', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                ws.send(JSON.stringify({
                    'action': 'stop_paddle',
                    'message': {
                        'user': player_id,
                        'key': event.key
                    }
                }));
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
    gameOver = false;
    initializeCanvas();
    initializeBall();
    stopGame();
}