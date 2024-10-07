import { navigateTo } from '../utils.js';
import { startPongGame, resetGameState } from './pong/pong.js';

export const selectPlayerorAI = () => {
    sessionStorage.removeItem('modality');
    sessionStorage.removeItem('playerNames');
    sessionStorage.removeItem('playersCount');
    sessionStorage.removeItem('winners');
    sessionStorage.removeItem('currentMatch');
    sessionStorage.removeItem('players');
    sessionStorage.removeItem('currentRound');
    sessionStorage.removeItem('rounds');
    sessionStorage.removeItem('game');
    sessionStorage.removeItem('remote');
    resetGameState();
    const player = sessionStorage.getItem('player');
    const translations = {
        english: {
            vsPlayer: "vs Player",
            vsAi: "vs AI",
            tournament: "Tournament",
        },
        portuguese: {
            vsPlayer: "vs Jogador",
            vsAi: "vs IA",
            tournament: "Torneio",
        },
        french: {
            vsPlayer: "vs Joueur",
            vsAi: "vs IA",
            tournament: "Tournoi",
        }
    };
    
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="select-game">
            <div class="game-selection-item">
                <div id="player-select">
                    <button id="vsPlayerBtn" class="btn">
                        <img src="./assets/ppp.png" alt="Player" class="button-image-select">
                        <h3>${translations[savedLanguage].vsPlayer}</h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="AI-select">
                    <button id="vsAIBtn" class="btn">
                        <img src="./assets/vsAI.png" alt="AI" class="button-image-select">
                        <h3>${translations[savedLanguage].vsAi}</h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="tourn-select">
                    <button id="tournBtn" class="btn">
                        <img src="./assets/tournament.png" alt="Tournament" class="button-image-select">
                        <h3>${translations[savedLanguage].tournament}</h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="3D-select">
                    <button id="3DBtn" class="btn">
                        <img src="./assets/3dpong.png" alt="3D" class="button-image-select">
                        <h3>3D</h3>
                    </button>
                </div>
            </div>
        </div>
    `;
   /* if (player) {
        app.innerHTML += `
            <div class="select-game">
                <div class="game-selection-item">
                    <div id="remote-select">
                        <button id="remoteBtn" class="btn">
                            <img src="./assets/remote.png" alt="Remote" class="button-image-select">
                            <h3>Remote</h3>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }*/
    document.getElementById('remoteBtn')?.addEventListener('click', () => {
        navigateTo('/wait-remote');
        sessionStorage.setItem('modality', 'remote');
    });
    document.getElementById('vsPlayerBtn').addEventListener('click', () => {
        navigateTo('/pong');
        sessionStorage.setItem('modality', 'player');
    });
    document.getElementById('vsAIBtn').addEventListener('click', () => {
        navigateTo('/pong');
        sessionStorage.setItem('modality', 'ai');
    });
    document.getElementById('3DBtn').addEventListener('click', () => {
        navigateTo('/3d-pong');
        sessionStorage.setItem('modality', '3D');
    });
    document.getElementById('tournBtn').addEventListener('click', () => {
        navigateTo('/tournament');
        sessionStorage.setItem('modality', 'tournament');
    });
};