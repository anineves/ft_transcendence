import { startSnakeGame, stopGame, changeGameSpeed, addExtraFood } from './snake/snake.js';
import { navigateTo } from '../utils.js';
import { resetGameSnake } from './snake/snake.js';
export const renderSnake = () => {
    sessionStorage.setItem("snakeGame", "true");
    sessionStorage.removeItem("participate");
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
        document.getElementById('exitBtn').addEventListener('click', endGameWithScoreSnake);

};

export const recordMatchResultSnake = async () => {
    const apiUrl = window.config.API_URL;
    const user = sessionStorage.getItem('user');
    const id = sessionStorage.getItem('id_match');
    const modality2 = sessionStorage.getItem('modality');
    let inviter = sessionStorage.getItem("Inviter");
    let nickTorn = sessionStorage.getItem("nickTorn")

    let duration = "10"
    let opponent =1;
    let winner_id = 1;
    if (id && user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True'))) {
        try {
            winner_id = opponent;
            const urlmatchID = `${apiUrl}/api/match/${id}`;
            const score = `${0}-${99}`;
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
                //console.log('Match updated successfully:', data);
            } else {
                //console.log('Error updating match:', data);
            }
        } catch (error) {
            console.error('Error processing match:', error);
        }
    }
};


export const endGameWithScoreSnake = async () => {
    await recordMatchResultSnake();
    sessionStorage.removeItem("Inviter");
    sessionStorage.removeItem("groupName");
    sessionStorage.removeItem("id_match");
    sessionStorage.removeItem("duelGame");
    sessionStorage.setItem("pongGame", "false");
    sessionStorage.setItem("snakeGame", "false");
    sessionStorage.removeItem('findOpponent');
    sessionStorage.removeItem("duelwait");
    window.addEventListener("beforeunload", (event) => {
    
      });
    stopGame();
};

   
    

   
    



