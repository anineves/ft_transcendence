import { startPongGame, resetGameState, stopGame } from './pong/pong.js';
import { navigateTo } from '../utils.js';


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
                 <button id="exitBtn" class="btn">
                        <h3>Give up </h3>
                </button>
                <button id="againBtn" class="btn">
                        <h3>Again</h3>
                </button>
            </div>
        </div>
    `;
    resetGameState(); 
    startPongGame();
    document.getElementById('exitBtn').addEventListener('click', () => {
        stopGame();   
        navigateTo('/select-playerOrAI');
    });
    document.getElementById('againBtn').addEventListener('click', () => {
        stopGame();   
        navigateTo('/pong');
    });
};