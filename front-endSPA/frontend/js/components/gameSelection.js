// gameSelection.js
import { navigateTo } from '../utils.js';

export const renderGameSelection = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="game-selection">
            <h2>Select Game</h2>
            <div class="btn-container">
                <button id="pongBtn" class="btn">Pong</button>
                <button id="4LineBtn" class="btn">4 in a Line</button>
            </div>
        </div>
    `;
    document.getElementById('pongBtn').addEventListener('click', () => navigateTo('/pong'));
    document.getElementById('4LineBtn').addEventListener('click', () => navigateTo('/4line'));
};
