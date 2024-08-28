import { navigateTo } from '../utils.js';
import { startPongGame, resetGameState } from './pong/pong.js';

export const selectPlayerorAI = () =>
{
    sessionStorage.removeItem('modality');
    sessionStorage.removeItem('playerNames');
    sessionStorage.removeItem('playersCount');
    sessionStorage.removeItem('winners');
    sessionStorage.removeItem('currentMatch');  
    sessionStorage.removeItem('players'); 
    sessionStorage.removeItem('currentRound');
    sessionStorage.removeItem('rounds');
    sessionStorage.removeItem('game');
    resetGameState();

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
            <div class="game-selection-item">
                <div id="remote-select">
                    <button id="remoteBtn" class="btn">
                        <img src="./assets/remote.png" alt="Tournament" class="button-image-select">
                        <h3>Remote </h3>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('remoteBtn').addEventListener('click', () =>
    {
        navigateTo('/pong');
        sessionStorage.setItem('modality', 'remote');
    });
    document.getElementById('vsPlayerBtn').addEventListener('click', () =>
        {
            navigateTo('/pong');
            sessionStorage.setItem('modality', 'player');
        });
    document.getElementById('vsAIBtn').addEventListener('click', () => 
    {
        navigateTo('/pong');
        sessionStorage.setItem('modality', 'ai'); 
    });
    document.getElementById('tournBtn').addEventListener('click', () =>
    {
            navigateTo('/tournament');
            sessionStorage.setItem('modality', 'tournament'); 
    });
        
};