// Criar a cena
const modality2 = sessionStorage.getItem('modality');
const user = sessionStorage.getItem('user');
const user_json = JSON.parse(user);

const player_id = sessionStorage.getItem("player");
let nickname = sessionStorage.getItem('nickname'); 
console.log(nickname);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f1f2f); 

let redNickname = nickname;
let blueNickname = "Opponent"
let match_type = "3D"
const game = 1;
let opponent = 1;
const players = [player_id, opponent];

async function createMatch() {
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

if(user)
    createMatch();

async function updateMatch()
{
    const id = sessionStorage.getItem('id_match');
    try {
        let winner_id = 6;
        if (redScore > blueScore)
            winner_id = player_id;
        const score = `${redScore}-${blueScore}`;
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

// Criar a câmara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
camera.position.z = 4;  // Afasta a câmara para podermos ver os objetos
camera.position.x = 0;
camera.position.y = 4.5;

camera.rotation.x = -1;
camera.rotation.y = 0;
camera.rotation.z = 0;

// Segunda camera para a vista de cima / 2D
const cameraTopView = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
cameraTopView.position.set(0, 6, 0);
cameraTopView.lookAt(0, 0, 0);
cameraTopView.rotation.set(-Math.PI/2, 0, 0);

// Luz
const light = new THREE.DirectionalLight(0xff5555, 0.5);
light.position.set(0, 0, 0);
scene.add(light);

// luz ambiente de cor neutra
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); 
scene.add(ambientLight);

// Luz branca para o blue player
const pointLight_blue = new THREE.PointLight(0xffffff, 0.8, 50); 
pointLight_blue.position.set(3, 2, 0);
scene.add(pointLight_blue);

// Luz branca para o red player
const pointLight_red = new THREE.PointLight(0xffffff, 0.8, 50); 
pointLight_red.position.set(-3, 2, 0);
scene.add(pointLight_red);

// Luz branca para o meio
const pointLight_middle = new THREE.PointLight(0xff00ff, 0.8, 20); 
pointLight_middle.position.set(0, 2, 10);
scene.add(pointLight_middle);

// Criar o renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Criacao Mesa
const tableGeometry = new THREE.BoxGeometry(6.4, 2, 10.5); // largura, altura, profundidade
const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1f2f });
const table = new THREE.Mesh(tableGeometry, tableMaterial);
//
scene.add(table);
table.position.set(0, -0.9, 0);
table.rotation.y = -Math.PI/2;
//table.rotation.x = 0.1;
//table.rotation.z = 1;

const lineGeometry = new THREE.BoxGeometry(0.05, 0.21, 6); // largura, altura (levemente maior que a mesa para visibilidade), profundidade
const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Cor da linha, aqui usei branco
const line = new THREE.Mesh(lineGeometry, lineMaterial);
scene.add(line); //linha de meio campo 

const line_p1 = new THREE.Mesh(lineGeometry, lineMaterial);
const line_p2 = new THREE.Mesh(lineGeometry, lineMaterial);

scene.add(line_p1); //linha final player da esquerda
line_p1.position.x = -5;
line_p1.position.y = 0;
line_p1.position.z = 0;

scene.add(line_p2); //linha final player da direita
line_p2.position.x = 5;
line_p2.position.y = 0;
line_p2.position.z = 0; 

//barras
const tablebarGeo = new THREE.BoxGeometry(0.2, 0.2, 10);
const tablebarMaterial = new THREE.MeshStandardMaterial({ color:0x9ffff0 });

//barra de cima
const tableTopbar = new THREE.Mesh(tablebarGeo, tablebarMaterial);
scene.add(tableTopbar);
tableTopbar.position.x = 0;
tableTopbar.position.y = 0.2;
tableTopbar.position.z = -3;
tableTopbar.rotation.x = 0;
tableTopbar.rotation.y = -Math.PI/2;
tableTopbar.rotation.z = 0;
//barra de baixo
const tableBotbar = new THREE.Mesh(tablebarGeo, tablebarMaterial);
scene.add(tableBotbar);

tableBotbar.position.x = 0;
tableBotbar.position.y = 0.2;
tableBotbar.position.z = 3;
tableBotbar.rotation.x = 0;
tableBotbar.rotation.y = -Math.PI/2;
tableBotbar.rotation.z = 0;


//paddles
const paddleGeometry = new THREE.BoxGeometry(0.2, 0.6, 1.2)

//paddle player red
const paddleMaterial_red = new THREE.MeshStandardMaterial({ color: 0xFF00FF});
const paddle_player_red = new THREE.Mesh(paddleGeometry, paddleMaterial_red);
scene.add(paddle_player_red);
paddle_player_red.position.x = -5;
paddle_player_red.position.y = 0;
paddle_player_red.position.z = 0;


const paddleMaterial_blue = new THREE.MeshStandardMaterial({ color: 0x198a8b});
const paddle_player_blue = new THREE.Mesh(paddleGeometry, paddleMaterial_blue);
scene.add(paddle_player_blue);
paddle_player_blue.position.x = 5;
paddle_player_blue.position.y = 0;
paddle_player_blue.position.z = 0;


//Bola de jogo ou disco?
const ball_geometry = new THREE.SphereGeometry(0.12, 32, 32);
const ball_Material = new THREE.MeshStandardMaterial({ color: 0xffffff});
const ball = new THREE.Mesh(ball_geometry, ball_Material);
scene.add(ball);
ball.position.set(0, 0.15, 0);


// Armazena o estado das teclas (pressionadas ou não)
const keyState = {}; 

// Detecta quando uma tecla é pressionada
function onDocumentKeyDown(event) {
    const keycode = event.key;
    keyState[keycode] = true; // Marca a tecla como pressionada
}

// Detecta quando uma tecla é liberada
function onDocumentKeyUp(event) {
    const keycode = event.key;
    keyState[keycode] = false; // Marca a tecla como liberada
}

// Switch camera function
let activatedCam = cameraTopView;

function switchCamera() {
    if (activatedCam === camera) {
        activatedCam = cameraTopView;
    } else {
        activatedCam = camera;
    }
}

// Evento para a tecla v, trocar a camera
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'v') {
        switchCamera();
    }
});

// Funcao para aparecer o "GameOver!" + Palyer red/blue + "WINS!"
let PlayerVictoryMaterial = 0;
let PlayerVictoryGeometry = 0;
let PlayerVictoryMesh = 0;

function showGameOver(PlayerVictoryMaterial) {
    if(user)
        updateMatch();
    const gameOverGeometry = new THREE.TextGeometry("GAME OVER!" , {
        font: loadedFont,
        size: 0.8,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
        color: 0x123422
    });
    const gameOverMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
    const gameOverMesh = new THREE.Mesh(gameOverGeometry, gameOverMaterial);
    gameOverGeometry.computeBoundingBox();
    const gameOverBB = gameOverGeometry.boundingBox;
    gameOverMesh.position.set(-(gameOverBB.max.x - gameOverBB.min.x) / 2, 0, -1.5);
    gameOverMesh.rotation.set(-Math.PI / 2, 0, 0);

    // win text
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
    const winTextMesh = new THREE.Mesh(winTextGeometry, gameOverMaterial);
    winTextGeometry.computeBoundingBox();
    const winTextBB = winTextGeometry.boundingBox;
    winTextMesh.position.set(-(winTextBB.max.x - winTextBB.min.x) / 2, 0, 2.3);
    winTextMesh.rotation.set(-Math.PI / 2, 0, 0);
    
    // player text for blue and red
    if (winblue) {
        PlayerVictoryGeometry = new THREE.TextGeometry(`${blueNickname}`, {
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
        PlayerVictoryMaterial = new THREE.MeshStandardMaterial({color: 0xff00ff});
    } else if (winred) {
        PlayerVictoryGeometry = new THREE.TextGeometry(`${redNickname}`, {
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
        PlayerVictoryMaterial = new THREE.MeshStandardMaterial({ color: 0x800080 });      
    }
    PlayerVictoryGeometry.computeBoundingBox();
    const PlayerVictoryBB = PlayerVictoryGeometry.boundingBox;
    PlayerVictoryMesh = new THREE.Mesh(PlayerVictoryGeometry, PlayerVictoryMaterial);
    PlayerVictoryMesh.rotation.set(-Math.PI / 2, 0, 0);
    PlayerVictoryMesh.position.set(-(PlayerVictoryBB.max.x - PlayerVictoryBB.min.x) / 2, 0, 0.5);

    scene.add(PlayerVictoryMesh);
    scene.add(winTextMesh);
    scene.add(gameOverMesh);
}

let winblue = false;
let winred = false;

// Ciacao de scores
function bluePlayerWin() {
    ballMoving = false;
    line_p1.visible = false;
    line_p2.visible = false;
    line.visible = false;
    ball.visible = false;
    paddle_player_red.visible = false;
    paddle_player_blue.visible = false;
    winblue = true;
    showGameOver();
}


function redPlayerWin() {
    ballMoving = false;
    line_p1.visible = false;
    line_p2.visible = false;
    line.visible = false;
    ball.visible = false;
    paddle_player_red.visible = false;
    paddle_player_blue.visible = false;
    winred = true;
    showGameOver();
}


let loadedFont;

const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    loadedFont = font;
});


function scoreBoard() {
    const scoreboard = document.createElement('div');
    scoreboard.id = 'scoreboard';
    scoreboard.style.position = 'absolute';
    scoreboard.style.top = '40px';
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
    redScoreText.style.color = 'purple';
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

function updateScoreBoard() {
    const redScoreText = document.getElementById('red-score');
    const blueScoreText = document.getElementById('blue-score');

    redScoreText.textContent = redNickname + ' ' + redScore;
    blueScoreText.textContent = blueScore + ' ' + blueNickname;
}

let ballMoving = true;
let redScore = 0;
let blueScore = 0;
let ballSpeedX = 0.06;
let ballSpeedZ = 0.06;
const paddleSpeed = 0.08;
let gameOver = false;

scoreBoard();

// funcao de animacao do jogo
document.addEventListener('keydown', onDocumentKeyDown);
document.addEventListener('keyup', onDocumentKeyUp);

function animate() {
    window.focus();
    console.log("Animate");
    renderer.render(scene, activatedCam);
    requestAnimationFrame(animate);
    if (gameOver) {
        return;
    }

    

    // paddle vermelho
    if (keyState['w']) {
        paddle_player_red.position.z -= paddleSpeed;
        if (paddle_player_red.position.z <= -2.15) {
            paddle_player_red.position.z = -2.15;
        }
    }
    if (keyState['s']) {
        paddle_player_red.position.z += paddleSpeed;
        if (paddle_player_red.position.z >= 2.15) {
            paddle_player_red.position.z = 2.15;
        }
    }

    // paddle azul
    if (keyState['ArrowUp']) {
        paddle_player_blue.position.z -= paddleSpeed;
        if (paddle_player_blue.position.z <= -2.15) {
            paddle_player_blue.position.z = -2.15;
        }
    }
    if (keyState['ArrowDown']) {
        paddle_player_blue.position.z += paddleSpeed;
        if (paddle_player_blue.position.z >= 2.15) {
            paddle_player_blue.position.z = 2.15;
        }
    }

    //animaçao da Bola
    if (ballMoving) {
        ball.position.x += ballSpeedX;
        ball.position.z += ballSpeedZ;
    }
    
    // com barras laterais
    if (ball.position.z >= (3 - 0.16) || ball.position.z <= (-3 + 0.16))
        ballSpeedZ = -ballSpeedZ;
    
    //com os paddles
    if (ball.position.x <= paddle_player_red.position.x + 0.16 && 
        (ball.position.z >= paddle_player_red.position.z - 0.6 && 
        ball.position.z <= paddle_player_red.position.z + 0.6)) {
        ballSpeedX = -ballSpeedX;
    }

    if (ball.position.x >= paddle_player_blue.position.x - 0.16 && 
        (ball.position.z >= paddle_player_blue.position.z - 0.6 && 
        ball.position.z <= paddle_player_blue.position.z + 0.6)) {
        ballSpeedX = -ballSpeedX;
    }
    
    if (ball.position.x <= line_p1.position.x) {
        if (blueScore < 5) {
            blueScore++;
            updateScoreBoard();
        }
        //console.log("Blue Player score -> " + `${bluePlayerScore}`);
        if (blueScore === 5) {
            bluePlayerWin();
            gameOver = true;
        } else {
            ball.position.set(0, 0.15, 0);
        }
    }
    if (ball.position.x >= line_p2.position.x) {
        if (redScore < 5) {
            redScore++;
            updateScoreBoard();
            //topviewupdateScore();
        }   
          
        if (redScore === 5) {
            redPlayerWin();
            gameOver = true;
        } else {   
            ball.position.set(0, 0.15, 0);
        }
    }

}

// Adicionando eventos de teclado ao documento
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);
document.body.focus();
// Iniciar a animação
animate();