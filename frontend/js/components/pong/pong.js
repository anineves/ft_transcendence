import { drawCenterLine, initializeCanvas, moveOpponentPaddleAI } from './canvasUtils.js';
import { drawScore, drawGameOver } from './score.js';
import { canvas, context, paddleWidth, paddleHeight, playerY, opponentY, movePaddle, stopPaddle } from './canvasUtils.js';
import { endMatch } from '../tournament.js';
import { initPongSocket } from './pongSocket.js'
import { navigateTo } from '../../utils.js';
import { closePongSocket } from './pongSocket.js';
import { visibilitychange } from '../../handlevisiblity.js';

let playerScore = 0;
let opponentScore = 0;
let gameOver = false;
let ballSpeedX = 2;
let ballSpeedY = 2;
let isAIActive = false;
let wsPong;
let animationFrameId;
const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;
let  visiblity;
export let ballX, ballY;
export const ballRadius = 10;

export const startPongGame = async () => {
    sessionStorage.setItem("pongGame", "true");
    const user = sessionStorage.getItem('user');
    let inviter = sessionStorage.getItem("Inviter");
    const player = sessionStorage.getItem('player');
    const game = 1;
    let modality2 = sessionStorage.getItem('modality');
    let opponent = 1;
    let friendId = sessionStorage.getItem('friendID');
    let nickTorn = sessionStorage.getItem("nickTorn");
    if (modality2 == 'remote' && inviter == "True" || modality2 == 'tourn-remote')
        opponent = friendId;
    const players = [player, opponent];
    sessionStorage.setItem('game', 'pong');
    sessionStorage.setItem('players', players);
    visiblity = "true";
    resetGameState();
    let match_type = "RM";
    if (modality2 == "ai") match_type = "AI";
    if (modality2 == "remote") match_type = "RM";
    if (modality2 == "tournament" || modality2 == 'tourn-remote'){
        match_type = "TN"
        const match = document.getElementById('match-footer');
            match.innerHTML = `
            <div class="match-footer">
            </div>`
    } 
        
    if (modality2 == "player" || modality2 == "3D") match_type = "MP";
    console.log('Pooong usermodality', modality2, 'nickTorn', nickTorn)
    if (user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True')) &&
    (modality2 != 'tourn-remote'||( modality2 == 'tourn-remote' && nickTorn == 'True')))  {
        if (player) {
            try {
                const urlMatches = `${apiUrl}/api/matches/`;
                const response = await fetch( urlMatches, {
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
            }
        }
    }
    if (modality2 == 'remote' || modality2 == 'tourn-remote') {
        const groupName = sessionStorage.getItem("groupName");

        let initws = `wss://${apiUri}/ws/pong_match/${groupName}/`
        wsPong = initPongSocket(`${initws}`);
        
        wsPong.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if(data.action == 'player_disconnect')
            {
                if(modality2 == "tourn-remote")
                    sessionStorage.setItem("trGiveUp", "true")
                if (wsPong) {
                    wsPong.send(JSON.stringify({
                        'action': 'end_game',
                        'message': {
                            'group_name': groupName,
                        }
                    }));
                }

            drawGameOver(playerScore, opponentScore);
            stopGame();
            const id = sessionStorage.getItem('id_match');
            let winner_id = opponent;
            if (id)  {
                try {
                    wsPong = null;
        
                    let whoGiveUp = sessionStorage.getItem('whoGiveUp')
                    if(whoGiveUp == "Ifriend")
                        playerScore = 5;
                    if(whoGiveUp == "Iplayer")
                        opponentScore = 5; 
                    if (playerScore > opponentScore)
                        winner_id = player;
                    const score = `${playerScore}-${opponentScore}`;
                    const duration = "10";
                    const urlMatchesID = `${apiUrl}/api/match/${id}`;
                    const response = await fetch(urlMatchesID, {
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
                }
            }

            sessionStorage.removeItem("Inviter");
            sessionStorage.removeItem("groupName");
            sessionStorage.removeItem("id_match");
            sessionStorage.setItem('WS', 'clean');
            sessionStorage.removeItem("duelGame");
            wsPong =  null;
            }
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

    //window.addEventListener('popstate
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
        if (modality2 == 'remote' || modality2 == 'tourn-remote') {
            if (currentPlayer === playerID) {
                wsPong.send(JSON.stringify({
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

export function initialize() {
    initializeCanvas();
    initializeBall();
    if (!canvas || !context) return;

    let modality2 = sessionStorage.getItem('modality');
    if (modality2 == 'remote' || modality2 == 'tourn-remote') 
        visibilitychange(wsPong, visiblity);
    
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
    }

    function update() {
        if (gameOver) return;
        updateBall();
        modality2 = sessionStorage.getItem('modality');
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
        modality2 = sessionStorage.getItem('modality');
        const playerID = sessionStorage.getItem('playerID');
        if (ballX - ballRadius < 0) {
            if (!ballOutOfBoundsLeft) {
                opponentScore++;
                if (opponentScore >= 5) {
                    gameOver = true;
                }

                ballOutOfBoundsLeft = true;
                if (modality2 == 'remote' || modality2 == 'tourn-remote') {
                    if (currentPlayer === playerID) {
                        wsPong.send(JSON.stringify({
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
                if (modality2 == 'remote' || modality2 == 'tourn-remote') {
                    if (currentPlayer === playerID) {
                        wsPong.send(JSON.stringify({
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
            if (modality2 == 'remote' || modality2 == 'tourn-remote') {
                if (currentPlayer === playerID) {
                    wsPong.send(JSON.stringify({
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
            if (modality2 == 'remote' || modality2 == 'tourn-remote') {
                if (currentPlayer === playerID) {
                    wsPong.send(JSON.stringify({
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
        if (modality2 == 'remote' && inviter == "True" || modality2 == 'tourn-remote')
            opponent = friendId;
        const players = [player, opponent];
        sessionStorage.setItem('game', 'pong');
        sessionStorage.setItem('players', players);
        let nickTorn = sessionStorage.getItem("nickTorn");

        if (!gameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        } else {
            drawGameOver(playerScore, opponentScore);
            stopGame();
            const id = sessionStorage.getItem('id_match');
            let winner_id = opponent;
            if (player && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True')) &&
            (modality2 != 'tourn-remote'||( modality2 == 'tourn-remote' && nickTorn == 'True')))  {
                try {
                    if(modality2 == 'remote')
                        wsPong =  null;
                    if (playerScore > opponentScore)
                        winner_id = player;
                    const score = `${playerScore}-${opponentScore}`;
                    const duration = "10";

                    const urlMatchesID = `${apiUrl}/api/match/${id}`;
                    const response = await fetch(urlMatchesID, {
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
                }
            }
            if (sessionStorage.getItem('modality') == 'tournament') {
                sessionStorage.setItem('game', 'pong');
                showNextMatchButton();
            }
            if(sessionStorage.getItem('modality') == 'tourn-remote')
            {
                const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
                const winner = playerScore > opponentScore ? currentMatch.player1 : currentMatch.player2;
                endMatch(winner); 
            }
            sessionStorage.removeItem("Inviter");
            sessionStorage.removeItem("groupName");
            sessionStorage.removeItem("id_match");
            sessionStorage.removeItem("duelGame");
            sessionStorage.setItem('WS', 'clean');
            sessionStorage.setItem("pongGame", "false");
            wsPong =  null;
        }
    }



    modality2 = sessionStorage.getItem('modality');
    if (modality2 != 'remote'  &&  modality2 != 'tourn-remote') {
        console.log("modality", modality2);
        document.addEventListener('keydown', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key) && sessionStorage.getItem('modality') !== 'ai') 
                movePaddle(event);
        });

        document.addEventListener('keydown', function (event) {
            if (['w', 'W', 's', 'S'].includes(event.key) )  {
                movePaddle(event);
            }
        });

        document.addEventListener('keyup', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key) && sessionStorage.getItem('modality') !== 'ai') {
                stopPaddle(event);
            }
        });

        document.addEventListener('keyup', function (event) {
            if (['w', 'W', 's', 'S'].includes(event.key)) {
                stopPaddle(event);
            }
        });
    }
    else if (modality2 == 'remote' || modality2 == 'tourn-remote') {
        const playerID = sessionStorage.getItem('player');
        const friendID = sessionStorage.getItem('friendID');
        document.addEventListener('keydown', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                wsPong.send(JSON.stringify({
                    'action': 'move_paddle',
                    'message': {
                        'user': playerID,
                        'key': event.key
                    }
                }));
            }
        });
        document.addEventListener('keyup', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                wsPong.send(JSON.stringify({
                    'action': 'stop_paddle',
                    'message': {
                        'user': playerID,
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

export function showNextMatchButton() {
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

