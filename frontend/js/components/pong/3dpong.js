// Criar a cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x555555); // Adicionar uma cor de fundo

// Criar a câmara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
camera.position.z = 5;  // Afasta a câmara para podermos ver os objetos
camera.position.x = 0;
camera.position.y = 6;

camera.rotation.x = -1;
camera.rotation.y = 0;
camera.rotation.z = 0;

// Segunda camera para a vista de cima / 2D
const cameraTopView = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
cameraTopView.position.set(0, 8, 0);
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
const pointLight_middle = new THREE.PointLight(0xffffff, 0.8, 20); 
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
const paddleGeometry = new THREE.BoxGeometry(0.2, 0.6, 1.4)

//paddle player red
const paddleMaterial_red = new THREE.MeshStandardMaterial({ color: 0xff0000});
const paddle_player_red = new THREE.Mesh(paddleGeometry, paddleMaterial_red);
scene.add(paddle_player_red);
paddle_player_red.position.x = -5;
paddle_player_red.position.y = 0;
paddle_player_red.position.z = 0;


const paddleMaterial_blue = new THREE.MeshStandardMaterial({ color: 0x0000ff});
const paddle_player_blue = new THREE.Mesh(paddleGeometry, paddleMaterial_blue);
scene.add(paddle_player_blue);
paddle_player_blue.position.x = 5;
paddle_player_blue.position.y = 0;
paddle_player_blue.position.z = 0;


//Bola de jogo ou disco?
const ball_geometry = new THREE.SphereGeometry(0.13, 32, 32);
const ball_Material = new THREE.MeshStandardMaterial({ color: 0xffffff});
const ball = new THREE.Mesh(ball_geometry, ball_Material);
scene.add(ball);
ball.position.set(0, 0.15, 0);


// Armazena o estado das teclas (pressionadas ou não)
const keyState = {}; 

// Detecta quando uma tecla é pressionada
function onDocumentKeyDown(event) {
    const keycode = event.key.toLowerCase();
    keyState[keycode] = true; // Marca a tecla como pressionada
}

// Detecta quando uma tecla é liberada
function onDocumentKeyUp(event) {
    const keycode = event.key.toLowerCase();
    keyState[keycode] = false; // Marca a tecla como liberada
}

// Switch camera function
let activatedCam = camera;

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
    const gameOverGeometry = new THREE.TextGeometry("GAME OVER!" , {
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
    const gameOverMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
    const gameOverMesh = new THREE.Mesh(gameOverGeometry, gameOverMaterial);
    gameOverMesh.position.set(-3.4, 0, -1.5);
    gameOverMesh.rotation.set(-Math.PI / 2, 0, 0);

    // win text
    const winTextGeometry = new THREE.TextGeometry("WINS!" , {
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
    winTextMesh.position.set(-1.5, 0, 2.3);
    winTextMesh.rotation.set(-Math.PI / 2, 0, 0);
    
    // player text for blue and red
    if (winblue) {
        PlayerVictoryGeometry = new THREE.TextGeometry("Blue Player", {
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
        PlayerVictoryMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});
    } else if (winred) {
        PlayerVictoryGeometry = new THREE.TextGeometry("Red Player", {
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
        PlayerVictoryMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});      
    }
    PlayerVictoryMesh = new THREE.Mesh(PlayerVictoryGeometry, PlayerVictoryMaterial);
    PlayerVictoryMesh.rotation.set(-Math.PI / 2, 0, 0);
    if (winred) {
        PlayerVictoryMesh.position.set(-2.7, 0, 0.5);
    } else if (winblue) {
        PlayerVictoryMesh.position.set(-2.7, 0, 0.5);
    }

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

// Score em 3D

let redScoreMesh, blueScoreMesh;
let loadedFont;

const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
    loadedFont = font;
    updateScore(); // Criar os textos iniciais
    topviewupdateScore(); // Cria o 0 - 0 incial
});


function updateScore() {

    // Remover os scores antigos
    if (redScoreMesh) {scene.remove(redScoreMesh);}
    if (blueScoreMesh) {scene.remove(blueScoreMesh);}
    
    // Verificar se a fonte já foi carregada
    if (!loadedFont) {return;}

    // Score red player
    const redScoreGeometry = new THREE.TextGeometry("Red  " + `${redPlayerScore}`, {
        font: loadedFont,
        size: 0.7,
        height: 0.15,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const redScoreMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    redScoreMesh = new THREE.Mesh(redScoreGeometry, redScoreMaterial);
    redScoreMesh.position.set(-3.5, -2, -8);
    redScoreMesh.rotation.set(0, 0, 0);
    scene.add(redScoreMesh);
    
    // Score blue player
    const blueScoreGeometry = new THREE.TextGeometry(`${bluePlayerScore}` + "  Blue" , {
        font: loadedFont,
        size: 0.7,
        height: 0.15,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const blueScoreMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff});
    blueScoreMesh = new THREE.Mesh(blueScoreGeometry, blueScoreMaterial);
    blueScoreMesh.position.set(0.6, -2, -8);
    blueScoreMesh.rotation.set(0, 0, 0);
    scene.add(blueScoreMesh);
}


// TOP view Score 
let topviewredScoreMesh, topviewblueScoreMesh;

function topviewupdateScore() {
    if (topviewredScoreMesh) {scene.remove(topviewredScoreMesh);}
    if (topviewblueScoreMesh) {scene.remove(topviewblueScoreMesh);}

    if (!loadedFont) {return;}

    const topviewredScoreGeometry = new THREE.TextGeometry("Red  " + `${topview_redPlayerScore}`, {
        font: loadedFont,
        size: 0.6,
        height: 0.08,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const topviewRedScoreMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    topviewredScoreMesh = new THREE.Mesh(topviewredScoreGeometry, topviewRedScoreMaterial);
    topviewredScoreMesh.position.set(-3.5, -1.5, -4);
    topviewredScoreMesh.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(topviewredScoreMesh);

    const topviewblueScoreGeometry = new THREE.TextGeometry("Blue  " + `${topview_bluePlayerScore}`, {
        font: loadedFont,
        size: 0.6,
        height: 0.08,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const topviewblueScoreMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    topviewblueScoreMesh = new THREE.Mesh(topviewblueScoreGeometry, topviewblueScoreMaterial);
    topviewblueScoreMesh.position.set(0.6, -1.5, -4);
    topviewblueScoreMesh.rotation.set((-Math.PI / 2) , 0, 0);
    scene.add(topviewblueScoreMesh);
}
    
let ballMoving = true;
let redPlayerScore = 0;
let bluePlayerScore = 0;
let topview_redPlayerScore = 0;
let topview_bluePlayerScore = 0;
let ballSpeedX = 0.06;
let ballSpeedZ = 0.06;
const paddleSpeed = 0.08;

// funcao de animacao do jogo
function animate() {

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
    if (keyState['i']) {
        paddle_player_blue.position.z -= paddleSpeed;
        if (paddle_player_blue.position.z <= -2.15) {
            paddle_player_blue.position.z = -2.15;
        }
    }
    if (keyState['k']) {
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
    if (ball.position.z >= (3 - 0.15) || ball.position.z <= (-3 + 0.15))
        ballSpeedZ = -ballSpeedZ;
    
    //com os paddles
    if (ball.position.x <= paddle_player_red.position.x + 0.15 && 
        ball.position.z >= paddle_player_red.position.z - 0.75 && 
        ball.position.z <= paddle_player_red.position.z + 0.75) {
        ballSpeedX = -ballSpeedX;
    }

    if (ball.position.x >= paddle_player_blue.position.x - 0.15 && 
        ball.position.z >= paddle_player_blue.position.z - 0.75 && 
        ball.position.z <= paddle_player_blue.position.z + 0.75) {
        ballSpeedX = -ballSpeedX;
    }
    
    if (ball.position.x <= line_p1.position.x) {
        if (bluePlayerScore < 5) {
            bluePlayerScore++;
            topview_bluePlayerScore++;
            updateScore();
            topviewupdateScore();
        }
        //console.log("Blue Player score -> " + `${bluePlayerScore}`);
        if (bluePlayerScore === 5) {
            bluePlayerWin();
        } else {
            ball.position.set(0, 0.15, 0);
        }
    }
    if (ball.position.x >= line_p2.position.x) {
        if (redPlayerScore < 5) {
            redPlayerScore++;
            topview_redPlayerScore++;
            updateScore();
            topviewupdateScore();
        }   
            //console.log("Red Player score -> " + `${redPlayerScore}`);
        if (redPlayerScore === 5) {
            redPlayerWin();
        } else {   
            ball.position.set(0, 0.15, 0);
        }
    }

    renderer.render(scene, activatedCam);
    requestAnimationFrame(animate);
}

// Adicionando eventos de teclado ao documento
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// Iniciar a animação
animate();