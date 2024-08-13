import { navigateTo } from '../utils.js';

export const renderGameSelection = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="select-game">
            <div class="game-selection-item">
                <div id="pong-select">
                    <button id="pongBtn" class="btn">
                        <img src="./assets/pongneon2.png" alt="Pong" class="button-image-select">
                        <h3>Pong</h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="4line-select">
                    <button id="4LineBtn" class="btn">
                        <img src="./assets/4lineneon.png" alt="4 in a Line" class="button-image-select">
                        <h3>4 in a Line</h3>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('pongBtn').addEventListener('click', () => navigateTo('/select-playerOrAI'));
    document.getElementById('4LineBtn').addEventListener('click', () => navigateTo('/4line'));
};
