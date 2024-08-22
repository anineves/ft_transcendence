import { startPongGame } from './pong/pong.js';


export const renderPong = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="arcade-container">
            <div class="arcade-screen">
                <h2 class="arcade-title">PONG</h2>
                <canvas id="pongCanvas" width="600" height="400"></canvas>
            </div>
            <div class="arcade-controls">
                <div class="arcade-joystick"></div>
                <div class="arcade-button" style="background:red;"></div>
                <div class="arcade-button" style="background:green;"></div>
                <div class="arcade-button" style="background:blue;"></div>
            </div>
        </div>
    `;
    startPongGame();
    let socket = new WebSocket('ws://' + window.location.host + '/ws/game/' + roomName + '/');

// Quando uma mensagem é recebida
socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    // Atualize o estado do jogo com a mensagem recebida
    console.log(data.message);
};

// Quando a conexão WebSocket está aberta
socket.onopen = function(e) {
    console.log('WebSocket connection established');
};

// Quando a conexão WebSocket está fechada
socket.onclose = function(e) {
    console.log('WebSocket connection closed');
};

// Enviar mensagem para o servidor WebSocket
function sendGameData(data) {
    socket.send(JSON.stringify({
        'message': data
    }));
}
};
