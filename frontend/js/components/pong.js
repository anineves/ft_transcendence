import { startPongGame, resetGameState, stopGame } from './pong/pong.js';
import { navigateTo } from '../utils.js';
const apiUrl = window.config.API_URL;

const translations = {
    english: {
        giveUp: "Give up"
    }, 
    portuguese: {
        giveUp: "Desistir"
    },
    french: {
        giveUp: "Abandonner"
    }
};

export const renderPong = () => {
    const user = sessionStorage.getItem('user');
    const modality2 = sessionStorage.getItem('modality');
    const app = document.getElementById('app');
    const showButtons = modality2 != 'remote' && modality2 != 'tournament';
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage || !translations[savedLanguage]) 
        savedLanguage = 'english'; 
     
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
                ${showButtons ? `
                    <button id="exitBtn" class="btn">
                        <h3>${translations[savedLanguage].giveUp}</h3>
                    </button>
                ` : ''}
            </div>
            </div>
        </div>
    `;
    resetGameState(); 
    startPongGame();
    if(showButtons)
        document.getElementById('exitBtn').addEventListener('click', endGameWithScore);

 
};

export const recordMatchResult = async () => {
    const user = sessionStorage.getItem('user');
    const id = sessionStorage.getItem('id_match');
    const modality2 = sessionStorage.getItem('modality');
    let inviter = sessionStorage.getItem("Inviter");

    let duration = "10"
    let opponent =1;
    let winner_id = 1;
    if (id && user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True'))) {
        try {
            winner_id = opponent;
            const urlmatchID = `${apiUrl}/api/match/${id}`;
            const score = `${0}-${5}}`;
            const response = await fetch(urlmatchID, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ winner_id, score, duration })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Match updated successfully:', data);
            } else {
                console.log('Error updating match:', data);
            }
        } catch (error) {
            console.error('Error processing match:', error);
        }
    }
};

export const endGameWithScore = async () => {
    await recordMatchResult();
    sessionStorage.removeItem("Inviter");
    sessionStorage.removeItem("groupName");
    sessionStorage.removeItem("id_match");
    sessionStorage.removeItem("duelGame");
    sessionStorage.setItem("pongGame", "false");
    sessionStorage.removeItem('findOpponent');
    window.addEventListener("beforeunload", (event) => {
    
      });
    stopGame();
    setTimeout(() => {
        navigateTo('/game-selection');
    }, 200);
};