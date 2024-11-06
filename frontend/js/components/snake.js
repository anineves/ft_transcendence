import { startSnakeGame, stopGame, changeGameSpeed, addExtraFood } from './snake/snake.js';
import { navigateTo } from '../utils.js';
import { endGameWithScore } from './pong.js';
import { resetGameSnake } from './snake/snake.js';

export const renderSnake = () => {
    let inviter = sessionStorage.getItem("Inviter");
    const apiUrl = window.config.API_URL;
    const user = sessionStorage.getItem('user');
    const modality2 = sessionStorage.getItem('modality');
    const app = document.getElementById('app');
    const showButtons = modality2 != 'remote' && modality2 != 'tournament';

    app.innerHTML = `
        <div class="arcade-container">
            <div class="arcade-screen">
                <h2 class="arcade-title">Snake</h2>
                <canvas id="snakeCanvas" width="600" height="400"></canvas>
            </div>
            <div class="arcade-controls">
                <div class="arcade-joystick"></div>
                <div class="arcade-button" style="background:red;" data-speed="100"></div>
                <div id="extraFoodButton" class="arcade-button" style="background:green;"></div>
                <div class="arcade-button" style="background:blue;" data-speed="200"></div>
                ${showButtons ? `
                    <button id="exitBtn" class="btn">
                        <h3>Give up</h3>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    resetGameSnake();
    startSnakeGame();
    if(showButtons)
        document.getElementById('exitBtn').addEventListener('click', endGameWithScore);

    const speedButtons = document.querySelectorAll('.arcade-button[data-speed]');
    speedButtons.forEach(button => {
        button.addEventListener('click', () => {
            const speed = parseInt(button.getAttribute('data-speed'));
            changeGameSpeed(speed);
        });
    });
    
    
    document.getElementById('extraFoodButton').addEventListener('click', () => {
        addExtraFood();
    });
};

   
    

   
    



