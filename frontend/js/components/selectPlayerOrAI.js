import { navigateTo } from '../utils.js';
import { startPongGame, resetGameState } from './pong/pong.js';
const apiUrl = window.config.API_URL;
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
    //resetGameState();
    
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
                
                    <button id="vsPlayerBtn" class="btn-type">
                        <img src="./assets/ppp.png" alt="Player" class="button-image-type">
                        <h3>${translations[savedLanguage].vsPlayer}</h3>
                    </button>
            
            </div>
            <div class="game-selection-item">
              
                    <button id="vsAIBtn" class="btn-type">
                        <img src="./assets/vsAI.png" alt="AI" class="button-image-type">
                        <h3>${translations[savedLanguage].vsAi}</h3>
                    </button>
            </div>
            <div class="game-selection-item">
                    <button id="tournBtn" class="btn-type">
                        <img src="./assets/tournament.png" alt="Tournament" class="button-image-type">
                        <h3>${translations[savedLanguage].tournament}</h3>
                    </button>
            </div>
            <div class="game-selection-item">
                    <button id="3DBtn" class="btn-type">
                        <img src="./assets/3dpong.png" alt="3D" class="button-image-type">
                        <h3>3D</h3>
                    </button>
            </div>
        </div>
    `;
  
    document.getElementById('vsPlayerBtn').addEventListener('click', () => {
        sessionStorage.setItem('modality', 'player');
        sessionStorage.setItem('game', 'pong');
        navigateTo('/pong');
    });
    document.getElementById('vsAIBtn').addEventListener('click', () => {
        sessionStorage.setItem('modality', 'ai');
        sessionStorage.setItem('game', 'pong');
        navigateTo('/pong');
    });
    document.getElementById('3DBtn').addEventListener('click', () => {
        sessionStorage.setItem('modality', '3D');
        sessionStorage.setItem('game', 'pong');
        navigateTo('/3d-pong');
    });
    document.getElementById('tournBtn').addEventListener('click', () => {
        sessionStorage.setItem('modality', 'tournament');
        sessionStorage.setItem('game', 'pong');
        navigateTo('/tournament');
    });
};