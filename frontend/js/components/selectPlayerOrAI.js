import { navigateTo } from '../utils.js';


export const selectPlayerorAI = () =>
{
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="select-game">
            <div class="game-selection-item">
                <div id="player-select">
                    <button id="vsPlayerBtn" class="btn">
                        <img src="./assets/ppp.png" alt="Player" class="button-image-select">
                        <h3>vs Player</h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="AI-select">
                    <button id="vsAIBtn" class="btn">
                        <img src="./assets/vsAI.png" alt="AI" class="button-image-select">
                        <h3>vs AiI </h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="tourn-select">
                    <button id="tournBtn" class="btn">
                        <img src="./assets/tournament.png" alt="Tournament" class="button-image-select">
                        <h3>Tournament </h3>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('vsPlayerBtn').addEventListener('click', () =>
    {
        navigateTo('/pong');
        localStorage.setItem('game', 'player');
    });
    document.getElementById('vsAIBtn').addEventListener('click', () => 
    {
        navigateTo('/pong');
        localStorage.setItem('game', 'ai'); 
    });
    document.getElementById('tournBtn').addEventListener('click', () =>
    {
            navigateTo('/tournament');
    });
        
};