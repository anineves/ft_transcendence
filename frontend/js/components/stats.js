import { navigateTo, checkLoginStatus, logout } from '../utils.js';

export const stats = async () => {
    const app = document.getElementById('app');
    const player = JSON.parse(sessionStorage.getItem('playerInfo')); 
    try {
    
        const response = await fetch('http://localhost:8000/api/matches/');
        const matches = await response.json();

        let pongWins = 0, pongLosses = 0, pongMatches = 0;
        let snakeWins = 0, snakeLosses = 0, snakeMatches = 0;

        matches.forEach(match => {
            if (match.players.includes(player.id)) {
                if (match.game == '1') {
                    pongMatches++;
                    if (match.winner_id === player.id) {
                        pongWins++;
                    } else {
                        pongLosses++;
                    }
                } else if (match.game === 'snake') {
                    snakeMatches++;
                    if (match.winner_id === player.id) {
                        snakeWins++;
                    } else {
                        snakeLosses++;
                    }
                }
            }
        });

        app.innerHTML = `
            <div class="stats">
                <h2>Stats</h2>
                <h3>Pong</h3>
                <p><strong>Pong Wins:</strong> <span id="pongWins">${pongWins}</span></p>
                <p><strong>Pong Losses:</strong> <span id="pongLosses">${pongLosses}</span></p>
                <p><strong>Pong Matches:</strong> <span id="pongMatches">${pongMatches}</span></p>
                
                <h3>Snake</h3>
                <p><strong>Snake Wins:</strong> <span id="snakeWins">${snakeWins}</span></p>
                <p><strong>Snake Losses:</strong> <span id="snakeLosses">${snakeLosses}</span></p>
                <p><strong>Snake Matches:</strong> <span id="snakeMatches">${snakeMatches}</span></p>
            </div>
        `;
    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/live-chat');
    }
};
