import { initPongSocket } from '../pong/pongSocket.js'
import { showNextMatchButton } from '../pong/pong.js';
import { endMatch } from '../tournament.js';
import { navigateTo } from '../../utils.js';
const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;

let canvas, ctx;
let numCells;
let gridSize = 16;
let gameOver = false;
let gameInterval;
let speed = 200;
let ws = null;

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

// const friendID = sessionStorage.getItem('friendID');
// const playerID = sessionStorage.getItem('playerID');
// const player = sessionStorage.getItem('player');

export const startSnakeGame = async () => {
    let modality2 = sessionStorage.getItem('modality');
    const user = sessionStorage.getItem('user');
   
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) {
        console.error("Canvas element with id 'snakeCanvas' not found.");
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
    
    const friendID = sessionStorage.getItem('friendID');
    const playerID = sessionStorage.getItem('playerID');

    let nickTorn = sessionStorage.getItem("nickTorn");
    if (modality2 == 'remote' && inviter == "True" || modality2 == 'tourn-remote')
        opponent = friendID;
    const players = [player, opponent];
    let match_type = "RM";
    if (modality2 == "ai") match_type = "AI";
    if (modality2 == "remote") match_type = "RM";
    if (modality2 == "tournament" || modality2 == 'tourn-remote') {
        match_type = "TN"
        const match = document.getElementById('match-footer');
        match.innerHTML = `
            <div class="match-footer">
            </div>`
    }
    if (modality2 == "player" || modality2 == "3D") match_type = "MP";
    sessionStorage.setItem('game', game);
    sessionStorage.setItem('players', players);


    if (modality2 == 'remote' || modality2 == 'tourn-remote') {
        const groupName = sessionStorage.getItem("groupName");
        console.log("groupName", groupName);
        const wssocket1= `wss://${apiUri}/ws/snake_match/${groupName}/`
        ws =    initPongSocket(wssocket1);

        if (ws) {
            document.addEventListener('keydown', handleKeyPress);
        }

        ws.onmessage = (event) => {

            const data = JSON.parse(event.data);
            let message = data.message

            if (data.action === 'move_snake') {
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
            
        ws.onclose = () => {
            document.removeEventListener('keydown', handleKeyPress);
            ws = null;
            sessionStorage.removeItem('friendID');
            sessionStorage.removeItem('playerID');
            sessionStorage.removeItem('duelGame');
            sessionStorage.removeItem('modality');
            sessionStorage.removeItem('players');
            sessionStorage.removeItem("Inviter");
            sessionStorage.removeItem("groupName");
            sessionStorage.setItem('WS', 'clean');
            console.error("Snake socket was closed");
        };
    }

    if (modality2 != 'remote') {

        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'w': if (snakePlayer.direction.y === 0) snakePlayer.direction = { x: 0, y: -1 }; break;
                case 's': if (snakePlayer.direction.y === 0) snakePlayer.direction = { x: 0, y: 1 }; break;
                case 'a': if (snakePlayer.direction.x === 0) snakePlayer.direction = { x: -1, y: 0 }; break;
                case 'd': if (snakePlayer.direction.x === 0) snakePlayer.direction = { x: 1, y: 0 }; break;
                case 'ArrowUp': if (snakeOpponent.direction.y === 0) snakeOpponent.direction = { x: 0, y: -1 }; break;
                case 'ArrowDown': if (snakeOpponent.direction.y === 0) snakeOpponent.direction = { x: 0, y: 1 }; break;
                case 'ArrowLeft': if (snakeOpponent.direction.x === 0) snakeOpponent.direction = { x: -1, y: 0 }; break;
                case 'ArrowRight': if (snakeOpponent.direction.x === 0) snakeOpponent.direction = { x: 1, y: 0 }; break;
            }
        });
    } 
    
    if (user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True')) &&
    (modality2 != 'tourn-remote'||( modality2 == 'tourn-remote' && nickTorn == 'True')))  {
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
                    console.log('Data:', data);
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

}

function handleKeyPress(event) {
    const player = sessionStorage.getItem('player');
    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    if (validKeys.includes(event.key)) {
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

    // if (modality2 == 'remote' || modality2 == 'tourn-remote') {
    //     const player = sessionStorage.getItem('player');
    //     const playerID = sessionStorage.getItem('playerID'); 
    //     if (player === playerID) {
    //         ws.send(JSON.stringify({
    //             'action': 'update_snake',
    //             'message': {
    //                 'player': player,
    //                 'snake_body': snake.body,
    //                 'snake_color': snake.color,
    //                 'snake_direction': snake.direction,
    //                 'snake_food_count': snake.foodCount,
    //                 'snake_hit_wall': snake.hitWall
    //             }
    //         }));
    //     }
    // }
}

function placeFood() {
    const modality2 = sessionStorage.getItem('modality');
    
    if (modality2 == 'remote' || modality2 == 'tourn-remote') {
        console.log("entrei comidaaaaaaaaaa remote");
        const player = sessionStorage.getItem('player');
        const playerID = sessionStorage.getItem('playerID'); 
        console.log('Place Food Called')
        console.log('Player:', player)
        console.log('PlayerID:', playerID)
        if (player === playerID) {
            ws.send(JSON.stringify({
                'action': 'place_food',
                'message': {
                    'player': player,
                    'test': 'test',
                    'x': Math.floor(Math.random() * 18) + 1, 
                    'y': Math.floor(Math.random() * 18) + 1 
                }
            }));
        }
        return ;
    }else{
        console.log("entrei comidaaaaaaaaaa local");
        foods.push({ 
            x: Math.floor(Math.random() * 18) + 1, 
            y: Math.floor(Math.random() * 18) + 1 
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

        // o próprio corpo
        /*for (let i = 1; i < snake.body.length; i++) {
            if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                sessionStorage.setItem("losingSnake", name);
                endGame();
                return;
            }
        }*/
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
    if(modality2 ==  'remote') {
    
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

const inviter = sessionStorage.getItem('Inviter'); // Não sei se posso deixar isso aqui
const user = sessionStorage.getItem('user');
const modality2 = sessionStorage.getItem('modality');

async function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSnake(snakePlayer);
    drawSnake(snakeOpponent);
    drawFoods();
    drawScore();

    if (gameOver) {
        drawGameOver();
        const id = sessionStorage.getItem('id_match');
        const user = sessionStorage.getItem('user');
        let inviter = sessionStorage.getItem("Inviter");
        const player = sessionStorage.getItem('player');
        const game = 0;
        const modality2 = sessionStorage.getItem('modality');
        let opponent = 1;
        let friendId = sessionStorage.getItem('friendID');
        if (modality2 == 'remote' && inviter == "True" || modality2 == 'tourn-remote')
            opponent = friendId;
        const players = [player, opponent];
        sessionStorage.setItem('game', game);
        sessionStorage.setItem('players', players);
        let nickTorn = sessionStorage.getItem("nickTorn");
        let winner_id = opponent;

        if (user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True')) &&
    (modality2 != 'tourn-remote'||( modality2 == 'tourn-remote' && nickTorn == 'True')))  {
        if (player) {
            try {

                let nameWinner = sessionStorage.getItem('losingSnake');
                if (nameWinner == 'player')
                    winner_id = player;
                const score = `${snakePlayer.foodCount}-${snakeOpponent.foodCount}`;
                console.log("score", score);
                const duration = "10";
                if(modality2 == 'remote' || modality2 == 'tourn-remote')
                    ws =  null;
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
                alert('An error occurred while processing the match.');
            }
        }
        }
        drawGameOver();
        console.log(sessionStorage.getItem('modality'));
        if (sessionStorage.getItem('modality') == 'tournament') {
            console.log("Entrei aquui")
            showNextMatchButton();
        }
        if(sessionStorage.getItem('modality') == 'tourn-remote')
        {
                const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
                const winner = snakePlayer.foodCount > snakeOpponent.foodCount ? currentMatch.player1 : currentMatch.player2;
                endMatch(winner); 
        }
        sessionStorage.removeItem("Inviter");
        sessionStorage.removeItem("groupName");
        sessionStorage.setItem('WS', 'clean');
        sessionStorage.removeItem("losingSnake");
        ws =  null;
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
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    const modality = sessionStorage.getItem('modality');
    let player1 = "Player";
    let player2 = "Oponente";

   
    if (modality == 'tournament' || modality == "tourn-remote") {
        ({ player1, player2 } = currentMatch);
    }

    ctx.font = '16px Arial';
    ctx.fillStyle = 'blue';
    ctx.fillText(`${player1}: ${snakePlayer.foodCount}`, 10, 20);

    ctx.fillStyle = 'purple';
    ctx.fillText(`${player2}: ${snakeOpponent.foodCount}`, canvas.width - 200, 20);
}

function drawGameOver() {
    let nameWinner = sessionStorage.getItem('losingSnake');
    ctx.fillStyle = 'yellow';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 70, canvas.height / 2 - 20);
    const winner = nameWinner;
    ctx.fillText(`${winner} wins!`, canvas.width / 2 - 70, canvas.height / 2 + 20);
    stopGame();
}

export function stopGame() {
    clearInterval(gameInterval);
    setTimeout(() => {
        navigateTo('/live-chat');
    }, 2000);
}

export function changeGameSpeed(newSpeed) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, newSpeed);
}

export function addExtraFood() {
    placeFood();
}