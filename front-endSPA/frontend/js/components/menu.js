// menu.js
import { navigateTo } from '../utils.js';

export const renderMenu = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="menu">
            <h1>FT TRANSCENDENCE</h1>
            <h2>Welcome to the Django</h2>
            <div class="btn-container">
                <button id="startGameBtn" class="btn">
                    <img src="./assets/play.png" alt="Pong" class="button-image">
                </button>
                <button id="loginBtn" class="btn">Login</button>
                <button id="registerBtn" class="btn">Register</button>
            </div>
        </div>
    `;
    document.getElementById('startGameBtn').addEventListener('click', () => navigateTo('/game-selection'));
    document.getElementById('loginBtn').addEventListener('click', () => navigateTo('/login'));
    document.getElementById('registerBtn').addEventListener('click', () => navigateTo('/register'));
};
