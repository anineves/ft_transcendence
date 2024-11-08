import { closePongSocket, initPongSocket } from '../pong/pongSocket.js'
import { showNextMatchButton } from '../pong/pong.js';
import { endMatch } from '../tournament.js';
import { navigateTo } from '../../utils.js';
import { visibilitychange } from '../../handlevisiblity.js';
const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;

let canvas, ctx;
let numCells;
let gridSize = 16;
let gameOver = false;
let gameInterval;
let speed;
let ws = null;

export const translations = {
    english: {
        player: "Player", 
        opponent: "Opponent", 
        gameOver: "Game Over", 
        giveUp: "Someone gave up!"
    }, 
    portuguese: {
        player: "Jogador",
        opponent: "Adversário",
        gameOver: "Fim de Jogo",
        giveUp: "Alguém desistiu!"
    },
    french: {
        player: "Joueur",
        opponent: "Adversaire",
        gameOver: "Jeu Terminé",
        giveUp: "Quelqu'un abandonne!"
    }
};



let snakePlayer = {
    body: [{ x: 3, y: 3 }],
    direction: { x: 1, y: 0 },
    color: 'purple',
    foodCount: 0,
    hitWall: false
};

let snakeOpponent = {
    body: [{ x: 4, y: 4 }],
    direction: { x: 1, y: 0 },
    color: 'blue',
    foodCount: 0,
    hitWall: false
};

let foods = [{ x: null, y: null }];
let visiblity;

export const startSnakeGame = async () => {
    sessionStorage.setItem('game', 'snake');
    let modality2 = sessionStorage.getItem('modality');
    const user = sessionStorage.getItem('user');
    visiblity = "true";
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) {
        return;
    }
    
    ctx = canvas.getContext('2d');
    numCells = canvas.width / gridSize;
    gridSize = 16;
    gameOver = false;
    gameInterval;
    speed = 200;
    ws;
    
    
    resetGameSnake();
    
    gameInterval = setInterval(gameLoop, speed);

    let inviter = sessionStorage.getItem("Inviter");
    const player = sessionStorage.getItem('player');
    const game = 2;

    let opponent = 1;

    let friendID = sessionStorage.getItem('friendID');
    let playerID = sessionStorage.getItem('playerID');

    let nickTorn = sessionStorage.getItem("nickTorn");
    if (modality2 == 'remote' && inviter == "True")
        opponent = friendID;
    const players = [player, opponent];
    let match_type = "RM";
    if (modality2 == "ai") match_type = "AI";
    if (modality2 == "remote") match_type = "RM";
    if (modality2 == "tournament") {
        match_type = "TN"
        const match = document.getElementById('match-footer');
        match.innerHTML = `
            <div class="match-footer">
            </div>`
    }
    if (modality2 == "player" || modality2 == "3D") match_type = "MP";
    
    sessionStorage.setItem('players', players);


    if (modality2 == 'remote') {

        let groupName = sessionStorage.getItem("groupName");
        if(!groupName)
            groupName = 'snakeGroup';
        const wssocket1 = `wss://${apiUri}/ws/snake_match/${groupName}/`
        ws = initPongSocket(wssocket1);
        
        if (ws) {
            document.addEventListener('keydown', handleKeyPress);
        }

        ws.onmessage = async (event) => {

            const data = JSON.parse(event.data);
            let message = data.message
            if (data.action == 'player_disconnect') {
                if (ws) {
                    ws.send(JSON.stringify({
                        'action': 'end_game',
                        'message': {
                            'group_name': groupName,
                        }
                    }));
                }

                const id = sessionStorage.getItem('id_match');
                let friendID = sessionStorage.getItem('friendID');
                opponent = friendID;
                let winner_id = opponent;
                let whoGiveUp = sessionStorage.getItem('whoGiveUp')
                if (whoGiveUp) {
                    sessionStorage.setItem("losingSnake", "opponent");
                    snakeOpponent.foodCount = 99;
                }
                else {
                    snakePlayer.foodCount = 99;
                    sessionStorage.setItem("losingSnake", "player");
                }
                drawGameOver(snakePlayer.foodCount, snakeOpponent.foodCount);
                sessionStorage.removeItem("whoGiveUp");
                if (ws) {
                    ws.close();
                    console.log("SnakeSocket 4")
                }
                if (id) {
                    try {
                        if (sessionStorage.getItem("losingSnake") == 'player')
                            winner_id = player;
                        ws = null
                        const score = `${snakePlayer.foodCount}-${snakeOpponent.foodCount}`;
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
                            //console.log('Match updated successfully:', data);
                        } else {
                            //console.log('Error updating match:', data);
                        }
                    } catch (error) {
                        console.error('Error processing match:', error);
                    }
                }
               
                sessionStorage.removeItem("Inviter");
                sessionStorage.removeItem("groupName");
                sessionStorage.removeItem("id_match");
                sessionStorage.setItem('WS', 'clean');
                sessionStorage.removeItem("losingSnake");
                sessionStorage.removeItem("duelGame");
                sessionStorage.removeItem("whoGiveUp");
                sessionStorage.removeItem('findOpponent');
                sessionStorage.removeItem("duelwait");
                closePongSocket(ws)
            }


            if (data.action === 'move_snake') {
                friendID = sessionStorage.getItem('friendID');
                playerID = sessionStorage.getItem('playerID');

                const updateSnakeState = (snake, direction, message) => {
                    snake.direction = direction;
                    snakePlayer.body = message.snake_player.body;
                    snakePlayer.foodCount = message.snake_player.foodCount;
                    snakePlayer.hitWall = message.snake_player.hitWall;
                    snakeOpponent.body = message.snake_opponent.body;
                    snakeOpponent.foodCount = message.snake_opponent.foodCount;
                    snakeOpponent.hitWall = message.snake_opponent.hitWall;
                };

                let direction;
                switch (message.key) {
                    case 'ArrowUp':
                        direction = { x: 0, y: -1 };
                        if (playerID === message.player && snakePlayer.direction.y === 0) {
                            updateSnakeState(snakePlayer, direction, message);
                        } else if (friendID === message.player && snakeOpponent.direction.y === 0) {
                            updateSnakeState(snakeOpponent, direction, message);
                        }
                        break;

                    case 'ArrowDown':
                        direction = { x: 0, y: 1 };
                        if (playerID === message.player && snakePlayer.direction.y === 0) {
                            updateSnakeState(snakePlayer, direction, message);
                        } else if (friendID === message.player && snakeOpponent.direction.y === 0) {
                            updateSnakeState(snakeOpponent, direction, message);
                        }
                        break;

                    case 'ArrowLeft':
                        direction = { x: -1, y: 0 };
                        if (playerID === message.player && snakePlayer.direction.x === 0) {
                            updateSnakeState(snakePlayer, direction, message);
                        } else if (friendID === message.player && snakeOpponent.direction.x === 0) {
                            updateSnakeState(snakeOpponent, direction, message);
                        }
                        break;

                    case 'ArrowRight':
                        direction = { x: 1, y: 0 };
                        if (playerID === message.player && snakePlayer.direction.x === 0) {
                            updateSnakeState(snakePlayer, direction, message);
                        } else if (friendID === message.player && snakeOpponent.direction.x === 0) {
                            updateSnakeState(snakeOpponent, direction, message);
                        }
                        break;
                }
            }
            if (data.action == 'place_food') {
                foods.push({
                    x: message.x,
                    y: message.y
                });
            }
            if (data.action == 'game_over') {
                gameOver = true;
                ws.close();
            }
        };
    
    }
  
    //sessionStorage.setItem("snakeGame", "true");

    if (modality2 != 'remote') {

        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp': if (snakePlayer.direction.y === 0) snakePlayer.direction = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (snakePlayer.direction.y === 0) snakePlayer.direction = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (snakePlayer.direction.x === 0) snakePlayer.direction = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (snakePlayer.direction.x === 0) snakePlayer.direction = { x: 1, y: 0 }; break;
                case 'w': if (snakeOpponent.direction.y === 0) snakeOpponent.direction = { x: 0, y: -1 }; break;
                case 's': if (snakeOpponent.direction.y === 0) snakeOpponent.direction = { x: 0, y: 1 }; break;
                case 'a': if (snakeOpponent.direction.x === 0) snakeOpponent.direction = { x: -1, y: 0 }; break;
                case 'd': if (snakeOpponent.direction.x === 0) snakeOpponent.direction = { x: 1, y: 0 }; break;
            }
        });
    }

    if (user && (modality2 != 'remote' || (modality2 == 'remote' && inviter == 'True')) && (modality2 != 'tournament' || (modality2 == 'tournament' && nickTorn == 'True'))) {
        if (player) {
            const urlMatches = `${apiUrl}/api/matches/`;
            try {
                const response = await fetch(urlMatches, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ game, players, match_type })
                });

                const data = await response.json();

                if (data) {
                    //console.log('Match created successfully:', data);
                    sessionStorage.setItem('id_match', data.id);
                } else {
                   // console.log('Match error', data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    if (modality2 == 'remote')
        visibilitychange(ws, visiblity);
}

function handleKeyPress(event) {
    const player = sessionStorage.getItem('player');
    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if (validKeys.includes(event.key) && ws != null) {
        ws.send(JSON.stringify({
            'action': 'move_snake',
            'message': {
                'player': player,
                'key': event.key,
                'snake_player': {
                    'body': snakePlayer.body,
                    'foodCount': snakePlayer.foodCount,
                    'hitWall': snakePlayer.hitWall,

                },
                'snake_opponent': {
                    'body': snakeOpponent.body,
                    'foodCount': snakeOpponent.foodCount,
                    'hitWall': snakeOpponent.hitWall,
                }
            }
        }));
    }
}

export function resetGameSnake() {

    snakePlayer.body = [{ x: 3, y: 3 }];
    snakePlayer.direction = { x: 1, y: 0 };
    snakePlayer.foodCount = 0;
    snakePlayer.hitWall = false;

    snakeOpponent.body = [{ x: 4, y: 4 }];
    snakeOpponent.direction = { x: 1, y: 0 };
    snakeOpponent.foodCount = 0;
    snakeOpponent.hitWall = false;
    foods = [{
        x: 15,
        y: 7
    }];
    gameOver = false;

}

function gameLoop() {
    if (!gameOver) {
        updateSnake(snakePlayer);
        updateSnake(snakeOpponent);
        checkCollisions();
        drawGame();
    }
}

function updateSnake(snake) {

    const newHead = {
        x: snake.body[0].x + snake.direction.x,
        y: snake.body[0].y + snake.direction.y
    };

    snake.body.unshift(newHead);

    for (let i = 0; i < foods.length; i++) {
        if (newHead.x === foods[i].x && newHead.y === foods[i].y) {
            snake.foodCount++;
            foods.splice(i, 1);
            placeFood();
            return;
        }
    }
    snake.body.pop();


}

function placeFood() {
    let modality2 = sessionStorage.getItem('modality');
    let x = Math.floor(Math.random() * 36);
    let y = Math.floor(Math.random() * 20);
    const snakes = [
        { snake: snakePlayer, name: "player" },
        { snake: snakeOpponent, name: "opponent" }
    ];

    for (const { snake, name } of snakes) {
        if (snake.body.x == x)
            x = Math.floor(Math.random() * 36);
        if (snake.body.y == y)
            y = Math.floor(Math.random() * 20);
    }
    if (modality2 == 'remote') {
        const player = sessionStorage.getItem('player');
        const playerID = sessionStorage.getItem('playerID');
        if (player === playerID) {
            ws.send(JSON.stringify({
                'action': 'place_food',
                'message': {
                    'player': player,
                    'test': 'test',
                    'x': x,
                    'y': y
                }
            }));
        }
        return;
    } else {
        foods.push({
            x: x,
            y: y
        });
    }
}


function checkCollisions() {
    const snakes = [
        { snake: snakePlayer, name: "player" },
        { snake: snakeOpponent, name: "opponent" }
    ];


    for (const { snake, name } of snakes) {
        const head = snake.body[0];
        if (head.x < 0 || head.x >= (numCells - 1) || head.y < 0 || head.y >= (canvas.height / gridSize - 1)) {
            sessionStorage.setItem("losingSnake", name);
            snake.hitWall = true;
            endGame();
            return;
        }
    }


    const playerHead = snakePlayer.body[0];
    const opponentHead = snakeOpponent.body[0];

    if (playerHead.x === opponentHead.x && playerHead.y === opponentHead.y) {
        if (snakePlayer.body.length > snakeOpponent.body.length) {
            sessionStorage.setItem("losingSnake", "opponent");
        } else if (snakePlayer.body.length < snakeOpponent.body.length) {
            sessionStorage.setItem("losingSnake", "player");
        } else {
            sessionStorage.setItem("losingSnake", "both");
        }
        endGame();

    }
    for (let i = 1; i < snakeOpponent.body.length; i++) {
        if (playerHead.x === snakeOpponent.body[i].x && playerHead.y === snakeOpponent.body[i].y) {
            sessionStorage.setItem("losingSnake", "player");
            endGame();
            return;
        }
    }

    for (let i = 1; i < snakePlayer.body.length; i++) {
        if (opponentHead.x === snakePlayer.body[i].x && opponentHead.y === snakePlayer.body[i].y) {
            sessionStorage.setItem("losingSnake", "opponent");
            endGame();
            return;
        }
    }
}


function endGame() {
    gameOver = true;
    let modality2 = sessionStorage.getItem('modality');
    if (modality2 == 'remote') {
        const player = sessionStorage.getItem('player');
        ws.send(JSON.stringify({
            'action': 'end_game',
            'message': {
                'player': player,
                'end_game': true
            }
        }));
    }
}



async function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSnake(snakePlayer);
    drawSnake(snakeOpponent);
    drawFoods();
    drawScore();

    if (gameOver) {
        drawGameOver(snakePlayer.foodCount, snakeOpponent.foodCount);
        const id = sessionStorage.getItem('id_match');
        const user = sessionStorage.getItem('user');
        let inviter = sessionStorage.getItem("Inviter");
        const player = sessionStorage.getItem('player');
        const game = 0;
        let modality2 = sessionStorage.getItem('modality');
        let opponent = 1;
        let friendId = sessionStorage.getItem('friendID');
        if (modality2 == 'remote' && inviter == "True")
            opponent = friendId;
        const players = [player, opponent];
        sessionStorage.setItem('game', 'snake');
        sessionStorage.setItem('players', players);
        let nickTorn = sessionStorage.getItem("nickTorn");
        sessionStorage.setItem("snakeGame", "false");
        let winner_id = opponent;
        if (ws) {
            ws.close();
            console.log("SnakeSocket 3")
        }
        if (user && (modality2 != 'remote' || (modality2 == 'remote' && inviter == 'True')) && (modality2 != 'tournament' || (modality2 == 'tournament' && nickTorn == 'True'))) {
            if (player) {
                try {

                    let nameWinner = sessionStorage.getItem('losingSnake');
                    if (nameWinner == 'player')
                        winner_id = player;
                    const score = `${snakePlayer.foodCount}-${snakeOpponent.foodCount}`;
                    const duration = "10";
                    if (modality2 == 'remote')
                        ws = null;
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
                        //console.log('Match updated successfully:', data,  sessionStorage.getItem("snakeGame") )
                    } else {
                        //console.log('Error updating match:', data);
                    }
                } catch (error) {
                    console.error('Error processing match:', error);
                }
            }
        }
        if (sessionStorage.getItem('modality') == 'tournament') {
            sessionStorage.setItem('game', 'snake');
            showNextMatchButton();
        }
        sessionStorage.removeItem("Inviter");
        sessionStorage.removeItem("groupName");
        sessionStorage.removeItem("id_match");
        sessionStorage.removeItem("duelGame");
        sessionStorage.setItem('WS', 'clean');
        sessionStorage.setItem("snakeGame", "false");
        sessionStorage.removeItem('findOpponent');
        sessionStorage.removeItem("losingSnake");
        sessionStorage.removeItem("duelwait");
        closePongSocket(ws);

    }
}

function drawFoods() {
    ctx.fillStyle = 'green';
    foods.forEach(food => {
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSnake(snake) {
    ctx.fillStyle = gameOver && snake.hitWall ? 'red' : snake.color;

    snake.body.forEach((segment, index) => {
        ctx.beginPath();
        ctx.arc(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();

        if (index === 0) {
            drawEyes(segment, snake.direction);
            ctx.fillStyle = gameOver && snake.hitWall ? 'red' : snake.color;
        }
    });
}

function drawEyes(head, direction) {
    ctx.fillStyle = 'white';
    const eyeSize = 2;
    const eyeOffset = gridSize / 4;

    if (direction.x === 1) {
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
    } else if (direction.x === -1) {
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
    } else if (direction.y === -1) {
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 - eyeOffset);
    } else if (direction.y === 1) {
        drawEye(head.x * gridSize + gridSize / 2 - eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
        drawEye(head.x * gridSize + gridSize / 2 + eyeOffset, head.y * gridSize + gridSize / 2 + eyeOffset);
    }
}

function drawEye(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawScore() {
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage || !translations[savedLanguage]) 
        savedLanguage = 'english'; 
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    let friendID = sessionStorage.getItem('friendID');
    let playerID = sessionStorage.getItem('playerID');
    let player = JSON.parse(sessionStorage.getItem('playerInfo'));
    const modality = sessionStorage.getItem('modality');
    let player1 = translations[savedLanguage].player
    let player2 = translations[savedLanguage].opponent
    const nickname = sessionStorage.getItem('nickname'); 
    if(nickname) {
        if (player.id == friendID) 
            player2 = nickname ? nickname.replace(/^"|"$/g, '') : "";
        else if (player.id == playerID)
            player1 = nickname ? nickname.replace(/^"|"$/g, '') : ""; 
    }
    if (modality == 'tournament') {
        ({ player1, player2 } = currentMatch);
    }

    ctx.font = '16px Arial';
    ctx.fillStyle = 'blue';
    ctx.fillText(`${player2}: ${snakeOpponent.foodCount}`, 10, 20);

    ctx.fillStyle = 'purple';
    ctx.fillText(`${player1}: ${snakePlayer.foodCount}`, canvas.width - 200, 20);
}

export function drawGameOver(playerScore, opponentScore) {
    
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage || !translations[savedLanguage]) 
        savedLanguage = 'english'; 
    let nameWinner = sessionStorage.getItem('losingSnake');
    let player1 = translations[savedLanguage].player
    let player2 = translations[savedLanguage].opponent
    ctx.fillStyle = 'yellow';
    ctx.font = '30px Arial';
    const giveUp = sessionStorage.getItem('giveUP');

    ctx.font = "30px 'Press Start 2P', cursive";
    ctx.fillStyle = "#ffcc00";
    ctx.fillText(`${translations[savedLanguage].gameOver}`, canvas.width / 2 - 130, canvas.height / 2 -40);
    if(giveUp == "true")
    {
        ctx.font = "20px 'Press Start 2P', cursive";
        ctx.fillStyle = "#ff0000";
        ctx.fillText(`${translations[savedLanguage].giveUp}`,canvas.width / 2 - 140, canvas.height / 2 + 70);
        sessionStorage.setItem('giveUP', 'false');
        sessionStorage.setItem('trGiveUp', 'false');
    }
    else
    {
        ctx.font = "20px 'Press Start 2P', cursive";
        ctx.fillText(`${player1}: ${playerScore} | ${player2}: ${opponentScore}`, canvas.width / 3 - 130, canvas.height / 2 + 70);

    }
    stopGame();
}

export function stopGame() {
    document.removeEventListener('keydown', handleKeyPress);
    const modality = sessionStorage.getItem('modality');
    clearInterval(gameInterval);
    const giveUp = sessionStorage.getItem('giveUP');
    if (modality == 'remote' || giveUp == 'true') {
        sessionStorage.setItem('giveUP', 'false')

        setTimeout(() => {
            navigateTo('/live-chat');
        }, 2000);
    }
    else if (modality != 'tournament') {
        setTimeout(() => {
            navigateTo('/snake-selector');
        }, 2000);

    }
}

export function changeGameSpeed(newSpeed) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, newSpeed);
}

export function addExtraFood() {
    placeFood();
}