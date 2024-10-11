import { startSnakeGame, stopGame, changeGameSpeed, addExtraFood } from './snake/snake.js';
import { navigateTo } from '../utils.js';

export const renderSnake = () => {
    const app = document.getElementById('app');
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
                <button id="exitBtn" class="btn">
                    <h3>Give up</h3>
                </button>
                <button id="againBtn" class="btn">
                    <h3>Again</h3>
                </button>
            </div>
        </div>
    `;

    startSnakeGame();

    document.getElementById('exitBtn').addEventListener('click', () => {
        stopGame();
        navigateTo('/snake-selector');
    });

    document.getElementById('againBtn').addEventListener('click', () => {
        stopGame();
        navigateTo('/snake');
    });

    
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
