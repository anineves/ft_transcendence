import { startSnakeGame, stopGame, changeGameSpeed, addExtraFood } from './snake/snake.js';
import { navigateTo } from '../utils.js';
let inviter = sessionStorage.getItem("Inviter");

export const renderSnake = () => {
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
                    <button id="againBtn" class="btn">
                        <h3>Again</h3>
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    startSnakeGame();

    const recordMatchResult = async () => {
        const id = sessionStorage.getItem('id_match');
        const remote = sessionStorage.getItem('remote');
        const player = sessionStorage.getItem('player');
        let opponent =1;
        let winner_id = 1;
        if (user && (modality2 != 'remote'||( modality2 == 'remote' && inviter=='True')) && (modality2 != 'tournament'||( modality2 == 'tournament' && nickTorn=='True')) &&
    (modality2 != 'tourn-remote'||( modality2 == 'tourn-remote' && nickTorn == 'True')))  {
        if (player) {
            try {
                
              
                winner_id = opponent;
                const score = `${0}-${5}}`;
                console.log("score", score);
                const duration = "10";

                const response = await fetch(`http://localhost:8000/api/match/${id}`, {
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
                    console.error('Error updating match:', data);
                }
            } catch (error) {
                console.error('Error processing match:', error);
                alert('An error occurred while processing the match.');
            }
        }
    }
    };

    const endGameWithScore = async () => {
        await recordMatchResult();
        stopGame();
        setTimeout(() => {
            navigateTo('/snake-selector');
        }, 200);
    };

    //TODO: It doesn't work on remote games

    /* document.getElementById('exitBtn').addEventListener('click', endGameWithScore);


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
    });*/
};