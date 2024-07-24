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
};
