const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f1f2f);

// NOME DOS PLAYERS
const modality2 = sessionStorage.getItem('modality');
const user = sessionStorage.getItem('user');
const user_json = JSON.parse(user);

const player_id = sessionStorage.getItem("player");
let nickname = sessionStorage.getItem('nickname');
console.log(nickname);

let redNickname = "Player";
let blueNickname = "Opponent"
let match_type = "3D"
const game = 2;
let opponent = 1;
const players = [player_id, opponent];
const apiUrl = window.config.API_URL;


async function createMatch() {
    const modality2 = sessionStorage.getItem('modality');
    const user = sessionStorage.getItem('user');
    const player_id = sessionStorage.getItem("player");
    let nickname = sessionStorage.getItem('nickname');
    if (player_id)
        redNickname = nickname;
    

    if (user && (modality2 != 'remote' || (modality2 == 'remote' && inviter == 'True')) && (modality2 != 'tournament' || (modality2 == 'tournament' && nickTorn == 'True')) &&
        (modality2 != 'tourn-remote' || (modality2 == 'tourn-remote' && nickTorn == 'True'))) {
        if (player_id) {

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

if (user)
    createMatch();

async function updateMatch() {
    const id = sessionStorage.getItem('id_match');
    const modality2 = sessionStorage.getItem('modality');
    const user = sessionStorage.getItem('user');
    const player_id = sessionStorage.getItem("player");

    if (user && (modality2 != 'remote' || (modality2 == 'remote' && inviter == 'True')) && (modality2 != 'tournament' || (modality2 == 'tournament' && nickTorn == 'True')) &&
        (modality2 != 'tourn-remote' || (modality2 == 'tourn-remote' && nickTorn == 'True'))) {
        if (player_id) {
            try {
                let winner_id = 1;
                if (redScore > blueScore)
                    winner_id = player_id;
                const score = `${redScore}-${blueScore}`;
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
                alert('An error occurred while processing the match.');
            }
        }
    }
}


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
camera.position.z = 7;
camera.position.x = 0;
camera.position.y = 8;
camera.rotation.x = -1;
camera.rotation.y = 0;
camera.rotation.z = 0;

const cameraTopView = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
cameraTopView.position.set(0, 9, 0);
cameraTopView.lookAt(0, 0, 0);
cameraTopView.rotation.set(-Math.PI / 2, 0, 0);

let activatedCam = cameraTopView;

function switchCamera() {
    if (activatedCam === camera) {
        activatedCam = cameraTopView;
    } else {
        activatedCam = camera;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'v') {
        switchCamera();
    }
});

const keyState = {};


// Luzes
const light = new THREE.DirectionalLight(0xff5555, 0.5);
light.position.set(10, 10, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Focu de Luz central
const pointLight = new THREE.PointLight(0xffffff, 0.8, 20);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

const pointLight1 = new THREE.PointLight(0xffffff, 0.4, 20);
pointLight1.position.set(-5, 5, -5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.4, 20);
pointLight2.position.set(5, 5, -5);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 0.2, 0);
pointLight3.position.set(5, 5, 5);
scene.add(pointLight3);

const pointLight4 = new THREE.PointLight(0xffffff, 0.2, 0);
pointLight4.position.set(-5, 5, 5);
scene.add(pointLight4);

// Criacao Mesa
const tableGeometry = new THREE.BoxGeometry(10, 2, 20); // largura, altura, profundidade
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1f2f });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
//
scene.add(table);
table.position.set(0, -0.9, 0);
table.rotation.y = -Math.PI / 2;

// Barras
const tableTopBotBarsGeometry = new THREE.BoxGeometry(1, 1, 20);
const tableBarTopBotLeftRightMaterial = new THREE.BoxGeometry(1, 1, 10);
const tableBarMaterial = new THREE.MeshStandardMaterial({ color: 0x9ffff0 });

const topBar = new THREE.Mesh(tableTopBotBarsGeometry, tableBarMaterial);
topBar.rotation.set(0, -Math.PI / 2, 0);
topBar.position.set(0, 0, -4.5);
scene.add(topBar);

const leftBar = new THREE.Mesh(tableBarTopBotLeftRightMaterial, tableBarMaterial);
leftBar.position.set(-9.5, 0, 0);
scene.add(leftBar);

const bottomBar = new THREE.Mesh(tableTopBotBarsGeometry, tableBarMaterial);
bottomBar.position.set(0, 0, 4.5);
bottomBar.rotation.set(0, -Math.PI / 2, 0)
scene.add(bottomBar);

const rightBar = new THREE.Mesh(tableBarTopBotLeftRightMaterial, tableBarMaterial);
rightBar.position.set(9.5, 0, 0);
scene.add(rightBar);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Criar a Snake
const redSnake = [];
let redSnakeDir = new THREE.Vector3(-1, 0, 0);
let redSnakeLen = 6;
const blueSnake = [];
let blueSnakeDir = new THREE.Vector3(-1, 0, 0);
let blueSnakeLen = 6;

function createSphere(x, y, z, color) {
    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: color });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);
    scene.add(sphere);
    return sphere;
}

// Snake Vermelha
for (let i = 3; i < redSnakeLen; i++) {
    redSnake.push(createSphere(i * 0.3, 0.2, -3, 0xff0000));
}

// Snake Azul
for (let i = 3; i < blueSnakeLen; i++) {
    blueSnake.push(createSphere(i * 0.3, 0.2, 3, 0x0000ff));
}

//variaveis para a colisao da mesa
const tableLimits = {
    minX: -9,
    maxX: 9,
    minZ: -4,
    maxZ: 4
}

// funcao que verifica a colisao com as paredes
function checkCollisionWall(snake) {
    const head = snake[0];

    if (head.position.x < tableLimits.minX || head.position.x > tableLimits.maxX ||
        head.position.z < tableLimits.minZ || head.position.z > tableLimits.maxZ) {
        return true;
    }
    return null;
}

function checkHeadCollision(snakeA, snakeB) {
    const headA = snakeA[0];
    const headB = snakeB[0];

    if (headA.position.distanceTo(headB.position) < 0.35) {
        // Colisao de cabecas das cobras
        if (snakeA.length > snakeB.length) {
            return 1;
        }
        else if (snakeA.length < snakeB.length) {
            return 2;
        }
        else if (snakeA.length === snakeB.length) {
            return 3;
        }
    }
    return 0;
}

// Colisao entre as cobras
function checkCollisionSnakes(snakeA, snakeB) {
    const headA = snakeA[0];

    for (let i = 1; i < snakeB.length; i++) {
        if (headA.position.distanceTo(snakeB[i].position) < 0.35) {
            return true;
        }
    }
    return false;
}

function scoreBoard() {
    const scoreboard = document.createElement('div');
    scoreboard.id = 'scoreboard';
    scoreboard.style.position = 'absolute';
    scoreboard.style.top = '0px';
    scoreboard.style.left = '50%';
    scoreboard.style.transform = 'translateX(-50%)';
    scoreboard.style.fontSize = '48px';
    scoreboard.style.color = 'white';
    scoreboard.style.fontFamily = 'Arial, sans-serif';
    scoreboard.style.fontWeight = 'bold';
    scoreboard.style.display = 'flex';
    scoreboard.style.gap = '20px';

    const redScoreText = document.createElement('span');
    redScoreText.id = 'red-score';
    redScoreText.style.color = 'red';
    redScoreText.style.textShadow = '1px 1px 2px white, -1px -1px 2px white'; // Adiciona contorno
    redScoreText.textContent = redNickname + ' ' + redScore;

    const whiteDash = document.createElement('span');
    whiteDash.style.color = 'white';
    whiteDash.textContent = '-';

    const blueScoreText = document.createElement('span');
    blueScoreText.id = 'blue-score';
    blueScoreText.style.color = 'blue';
    blueScoreText.style.textShadow = '1px 1px 2px white, -1px -1px 2px white'; // Adiciona contorno
    blueScoreText.textContent = blueScore + ' ' + blueNickname;

    scoreboard.appendChild(redScoreText);
    scoreboard.appendChild(whiteDash);
    scoreboard.appendChild(blueScoreText);

    document.body.appendChild(scoreboard);
}

//scoreBoard();

function updateSnake(snake, direction, snakeColor) {
    snake[0].position.add(direction.clone().multiplyScalar(0.1));

    for (let i = snake.length - 1; i > 0; i--) {
        const nextPosition = snake[i - 1].position.clone();
        snake[i].position.lerp(nextPosition, 0.5);
    }
    // VERIFY THE FOOD COLLISION OF THE SNAKE
    if (checkCollisionFood(snake)) {
        growSnake(snake)
        scene.remove(food);
        food = createFood();
        if (snakeColor === 'red') {
            redScore++;
            document.getElementById('red-score').textContent = redNickname + ' ' + redScore;
        } else if (snakeColor === 'blue') {
            blueScore++;
            document.getElementById('blue-score').textContent = blueScore + ' ' + blueNickname;
        }
    }
}

// FUNCAO PARA PROIBIR A INVERSAO DE MARCHA DIRETAMENTE
function isOppositeDir(currentDir, newDir) {
    return currentDir.equals(newDir.clone().negate());
}

// Teclas
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            if (!isOppositeDir(redSnakeDir, new THREE.Vector3(0, 0, -1))) {
                redSnakeDir.set(0, 0, -1);
            }
            break;
        case 's':
            if (!isOppositeDir(redSnakeDir, new THREE.Vector3(0, 0, 1))) {
                redSnakeDir.set(0, 0, 1);
            }
            break;
        case 'a':
            if (!isOppositeDir(redSnakeDir, new THREE.Vector3(-1, 0, 0))) {
                redSnakeDir.set(-1, 0, 0);
            }
            break;
        case 'd':
            if (!isOppositeDir(redSnakeDir, new THREE.Vector3(1, 0, 0))) {
                redSnakeDir.set(1, 0, 0);
            }
            break;
        case 'ArrowUp':
            if (!isOppositeDir(blueSnakeDir, new THREE.Vector3(0, 0, -1))) {
                blueSnakeDir.set(0, 0, -1);
            }
            break;
        case 'ArrowDown':
            if (!isOppositeDir(blueSnakeDir, new THREE.Vector3(0, 0, 1))) {
                blueSnakeDir.set(0, 0, 1);
            }
            break;
        case 'ArrowLeft':
            if (!isOppositeDir(blueSnakeDir, new THREE.Vector3(-1, 0, 0))) {
                blueSnakeDir.set(-1, 0, 0);
            }
            break;
        case 'ArrowRight':
            if (!isOppositeDir(blueSnakeDir, new THREE.Vector3(1, 0, 0))) {
                blueSnakeDir.set(1, 0, 0);
            }
            break;
    }
});

// FUNCAO DE CRIAR A COMIDA E COLOCAR NUMA POSICAO ALEATORIA
function createFood() {
    const foodGeo = new THREE.SphereGeometry(0.2, 32, 32);
    const foodMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const food = new THREE.Mesh(foodGeo, foodMaterial);

    let validPosition = false
    while (!validPosition) {

        food.position.set(
            THREE.MathUtils.randFloat(tableLimits.minX + 0.5, tableLimits.maxX - 0.5),
            0.2,
            THREE.MathUtils.randFloat(tableLimits.minZ + 0.5, tableLimits.maxZ - 0.5)
        );

        validPosition = true;
        for (let snake of [redSnake, blueSnake]) {
            for (let segment of snake) {
                if (food.position.distanceTo(segment.position) < 0.4) {
                    validPosition = false;
                    break;
                }
            }
            if (!validPosition) {
                break;
            }
        }
    }
    scene.add(food);
    return food;
}

function checkCollisionFood(snake) {
    const head = snake[0];
    if (head.position.distanceTo(food.position) < 0.35) {
        return true;
    }
    return false;
}

// UPDATE AO TAMANHO APOS COMER
function growSnake(snake) {
    const tail = snake[snake.length - 1];
    const newSphere = createSphere(
        tail.position.x,
        tail.position.y,
        tail.position.z,
        tail.material.color.getHex()
    );
    snake.push(newSphere);
}

// VICTORY FUNCTION

let redPoints = 0;
let bluePoints = 0;
let loadedFont;

const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    loadedFont = font;
});



function showGameOver(result) {
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // gameover text
    updateMatch();
    const gameOverGeometry = new THREE.TextGeometry("GAME OVER!", {
        font: loadedFont,
        size: 0.8,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const gameOverMesh = new THREE.Mesh(gameOverGeometry, whiteMaterial);
    gameOverGeometry.computeBoundingBox();
    const gameOverBB = gameOverGeometry.boundingBox;
    gameOverMesh.position.set(-(gameOverBB.max.x - gameOverBB.min.x) / 2, 0, -1.7);
    gameOverMesh.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(gameOverMesh);

    // WINS! TEXT
    if (result === 'win') {
        const winTextGeometry = new THREE.TextGeometry("WINS!", {
            font: loadedFont,
            size: 0.8,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const winTextMesh = new THREE.Mesh(winTextGeometry, whiteMaterial);
        winTextGeometry.computeBoundingBox();
        const winTextBB = winTextGeometry.boundingBox;
        winTextMesh.position.set(-(winTextBB.max.x - winTextBB.min.x) / 2, 0, 2.3);
        winTextMesh.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(winTextMesh);
    } else if (result === 'tie') {
        const tieText_g = new THREE.TextGeometry("TIE!", {
            font: loadedFont,
            size: 0.8,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });
        const tieTextM = new THREE.Mesh(tieText_g, whiteMaterial);
        tieText_g.computeBoundingBox();
        const tieTextBB = tieText_g.boundingBox;
        tieTextM.rotation.set(-Math.PI / 2, 0, 0);
        tieTextM.position.set(-(tieTextBB.max.x) / 2, 0, 2.3);
        scene.add(tieTextM);
    }
}

// TIE FUNCTION
function tieResult() {
    scene.remove(food);
    redSnake.forEach(segment => scene.remove(segment));
    blueSnake.forEach(segment => scene.remove(segment));
    showGameOver('tie');
}

// NAME OF THE RED PLAYER + REDVICTORY FUNCTION
function redVictory() {
    scene.remove(food);
    redSnake.forEach(segment => scene.remove(segment));
    blueSnake.forEach(segment => scene.remove(segment));
    showGameOver('win');
    const redVictory_g = new THREE.TextGeometry(`${redNickname}`, {
        font: loadedFont,
        size: 0.8,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const redVictory_m = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const redVictoryM = new THREE.Mesh(redVictory_g, redVictory_m);
    redVictory_g.computeBoundingBox();
    const redBB = redVictory_g.boundingBox;
    redVictoryM.rotation.set(-Math.PI / 2, 0, 0);
    redVictoryM.position.set(-(redBB.max.x - redBB.min.x) / 2, 0, 0);
    scene.add(redVictoryM);
}

// NAME OF THE BLUE PLAYER + BLUE VICTORY FUNCTION

function blueVictory() {
    scene.remove(food);
    redSnake.forEach(segment => scene.remove(segment));
    blueSnake.forEach(segment => scene.remove(segment));
    showGameOver('win');
    const blueVictory_g = new THREE.TextGeometry(`${blueNickname}`, {
        font: loadedFont,
        size: 0.8,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const blueVictory_m = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const blueVictoryM = new THREE.Mesh(blueVictory_g, blueVictory_m);
    blueVictory_g.computeBoundingBox();
    const blueBB = blueVictory_g.boundingBox;
    blueVictoryM.rotation.set(-Math.PI / 2, 0, 0);
    blueVictoryM.position.set(-(blueBB.max.x - blueBB.min.x) / 2, 0, 0);
    scene.add(blueVictoryM);
}

// SCORE FUNCTIONS FOR THE TWO DIFFERENT VIEWS (TOPVIEW AND REGULAR VIEW[45º])
let redScore = 0;
let blueScore = 0;


// VARIABLE TO CONTROLE THE MOVEMENT OF THE SNAKE BY TIME
const interval = 0.02;
let elapsedTime = 0;
let lastTime = 0;
let food = createFood();
let gameOver = false;



scoreBoard();
function animate(time) {
    window.focus();
    renderer.render(scene, activatedCam);
    if (gameOver) {
        requestAnimationFrame(animate);
        return;
    }

    //controlar o tempo de movimentacao
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    elapsedTime += deltaTime

    if (elapsedTime > interval) {
        //PlayerNicknames();
        //animacao de movimentacao das cobras
        updateSnake(redSnake, redSnakeDir, 'red');
        updateSnake(blueSnake, blueSnakeDir, 'blue');


        elapsedTime = 0;

        const redTouchBlue = checkCollisionSnakes(redSnake, blueSnake);
        const blueTouchRed = checkCollisionSnakes(blueSnake, redSnake);
        if (redTouchBlue) {

            blueVictory();
            gameOver = true;
        }
        if (blueTouchRed) {

            redVictory();
            gameOver = true;
        }

        // Check collision wall
        const collisionWallRed = checkCollisionWall(redSnake);
        const collisionWallBlue = checkCollisionWall(blueSnake);
        if (collisionWallRed && collisionWallBlue) {
            if (redScore === blueScore) {
                tieResult();
            }
            else if (redScore > blueScore) {
                redVictory();
            }
            else if (redScore < blueScore) {
                blueVictory();
            }
            gameOver = true;
        }
        else if (collisionWallRed && !collisionWallBlue) {
            blueVictory();
            gameOver = true;
        }
        else if (collisionWallBlue && !collisionWallRed) {
            redVictory();
            gameOver = true;
        }

        const redHeadTouch = checkHeadCollision(redSnake, blueSnake);
        const blueHeadTouch = checkHeadCollision(blueSnake, redSnake);
        if ((redHeadTouch === 3 || blueHeadTouch === 3) && !gameOver) {
            tieResult();
            gameOver = true;
        }
        else if ((redHeadTouch === 1 || blueHeadTouch === 2 || redScore === 8) && !gameOver) {

            redVictory();
            gameOver = true;
        }
        else if ((redHeadTouch === 2 || blueHeadTouch === 1 || blueScore === 8) && !gameOver) {

            blueVictory();
            gameOver = true;
        }
    }

    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);