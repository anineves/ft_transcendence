import { initPongSocket } from '../pong/pongSocket.js'


let canvas, ctx;
let numCells;
const gridSize = 16;
let gameOver = false;
let gameInterval;
let speed = 200;
let ws;

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

let foods;
export const startSnakeGame = async () => {
    canvas = document.getElementById('snakeCanvas');
    if (!canvas) {
        console.error("Canvas element with id 'snakeCanvas' not found.");
        return;
    }

    ctx = canvas.getContext('2d');
    numCells = canvas.width / gridSize;

    resetGame();
    gameInterval = setInterval(gameLoop, speed);

    const user = sessionStorage.getItem('user');
    let inviter = sessionStorage.getItem("Inviter");
    const player = sessionStorage.getItem('player');
    const game = 1;
    let modality2 = sessionStorage.getItem('modality');
    let opponent = 1;
    let friendID = sessionStorage.getItem('friendID');
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


    if (modality2 == 'remote') {
        const groupName = sessionStorage.getItem("groupName");
        console.log("groupName", groupName);
        ws = initPongSocket(`ws://localhost:8000/ws/snake_match/${groupName}/`);

        ws.onmessage = (event) => {

            // console.log("Event On Message: ", event);
            const data = JSON.parse(event.data);
            // console.log("SnakeSocket Data: ", data);    

            if (data.action == 'move_snake') {

                switch (data.message.key) {
                    case 'ArrowUp': if (snakePlayer.direction.y === 0 && playerID == data.message.player) snakePlayer.direction = { x: 0, y: -1 };
                    else if (snakeOpponent.direction.y === 0 && friendID == data.message.player) snakeOpponent.direction = { x: 0, y: -1 }; break;
                    case 'ArrowDown': if (snakePlayer.direction.y === 0 && playerID == data.message.player) snakePlayer.direction = { x: 0, y: 1 };
                    else if (snakeOpponent.direction.y === 0 && friendID == data.message.player) snakeOpponent.direction = { x: 0, y: 1 }; break;
                    case 'ArrowLeft': if (snakePlayer.direction.x === 0 && playerID == data.message.player) snakePlayer.direction = { x: -1, y: 0 };
                    else if (snakeOpponent.direction.x === 0 && friendID == data.message.player) snakeOpponent.direction = { x: -1, y: 0 }; break;
                    case 'ArrowRight': if (snakePlayer.direction.x === 0 && playerID == data.message.player) snakePlayer.direction = { x: 1, y: 0 };
                    else if (snakeOpponent.direction.x === 0 && friendID == data.message.player) snakeOpponent.direction = { x: 1, y: 0 }; break;
                }
            }
            if (data.action == 'place_food') {
                foods.push({
                    x: data.message.x,
                    y: data.message.y
                });
            }
            if (data.action == 'update_snake') {
                // console.log("update_snake:", data)
                if (data.message.snake.color === 'blue')
                    snakeOpponent = data.message.snake;
                else
                    snakePlayer = data.message.snake;
            }
            if (data.action == 'game_over') {
                gameOver = true;
            }
        };

        document.addEventListener('keydown', (event) => {

            // console.log("KeySnakeEvents: ", event)
            // console.log("PlayerInSnake: ", player)

            ws.send(JSON.stringify({
                'action': 'move_snake',
                'message': {
                    'player': player,
                    'key': event.key
                }
            }));
        });

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


    if (user && (modality2 != 'remote' || (modality2 == 'remote' && inviter == 'True'))) {
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

function resetGame() {
    snakePlayer.body = [{ x: 3, y: 3 }];
    snakePlayer.direction = { x: 1, y: 0 };
    snakePlayer.foodCount = 0;
    snakePlayer.hitWall = false;

    snakeOpponent.body = [{ x: 4, y: 4 }];
    snakeOpponent.direction = { x: 1, y: 0 };
    snakeOpponent.foodCount = 0;
    snakeOpponent.hitWall = false;
    //TODO: Precisa colocar primeira comida no mesmo lugar para ambos.
    foods = [{
        x: 15,
        y: 7
    }];
}

function gameLoop() {
    if (!gameOver) {
        updateSnake(snakePlayer);
        updateSnake(snakeOpponent);
        checkCollisions();
        drawGame();
    }
}

//TODO: Não sei se pode ficar aqui
const player = sessionStorage.getItem('player');
const playerID = sessionStorage.getItem('playerID');

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

    if (modality2 == 'remote') {
        if (player === playerID) {
            ws.send(JSON.stringify({
                'action': 'update_snake',
                'message': {
                    'player': player,
                    'snake': snake,
                }
            }));
        }
    }
}

function placeFood() {
    // foods.push({ 
    let x = Math.floor(Math.random() * 18) + 1;
    let y = Math.floor(Math.random() * 18) + 1;
    // });

    if (modality2 == 'remote') {
        if (player === playerID) {
            ws.send(JSON.stringify({
                'action': 'place_food',
                'message': {
                    'player': player,
                    'x': x,
                    'y': y,
                }
            }));
        }
    }
}

function checkCollisions() {
    const snakes = [snakePlayer, snakeOpponent];

    for (const snake of snakes) {
        const head = snake.body[0];
        if (head.x < 0 || head.x >= (numCells - 1) || head.y < 0 || head.y >= (canvas.height / gridSize - 1)) {
            snake.hitWall = true;
            endGame();
        }

        for (let i = 1; i < snake.body.length; i++) {
            if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                endGame();
            }
        }
    }

    if (snakePlayer.body[0].x === snakeOpponent.body[0].x && snakePlayer.body[0].y === snakeOpponent.body[0].y) {
        endGame();
    }
}

function endGame() {
    gameOver = true;
    ws.send(JSON.stringify({
        'action': 'end_game',
        'message': {
            'player': player,
            'end_game': true
        }
    }));
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
        const game = 1;
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

        if (user && (modality2 != 'remote' || (modality2 == 'remote' && inviter == 'True'))) {
            try {

                if (snakePlayer.foodCount > snakeOpponent.foodCount)
                    winner_id = player;
                const score = `${snakePlayer.foodCount}-${snakeOpponent.foodCount}`;
                console.log("score", score);
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
        drawGameOver();
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
    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText(`Player: ${snakePlayer.foodCount}`, 10, 20);
    ctx.fillText(`Opponent: ${snakeOpponent.foodCount}`, canvas.width - 200, 20);
}

function drawGameOver() {
    ctx.fillStyle = 'yellow';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 70, canvas.height / 2 - 20);
    const winner = snakePlayer.foodCount >= snakeOpponent.foodCount ? 'Player' : 'Opponent';
    ctx.fillText(`${winner} wins!`, canvas.width / 2 - 70, canvas.height / 2 + 20);
}

export function stopGame() {
    clearInterval(gameInterval);
}

export function changeGameSpeed(newSpeed) {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, newSpeed);
}

export function addExtraFood() {
    placeFood();
}
