import { checkLoginStatus, navigateTo } from '../utils.js';
import { putPlayer } from './login.js';
const apiUrl = window.config.API_URL;
export const renderGameSelection = async () => {
    // opcional
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="loading">
            <p>Loading...</p>
        </div>
    `;

    const register = sessionStorage.getItem('register');

    if (register === "42") {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            try {
                const apiUrl = window.config.API_URL;
                const urlOauth = `${apiUrl}/oauth/callback/`;
                const response = await fetch(urlOauth, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code })
                });

                const data = await response.json();

                if (data.access_token) {
                    sessionStorage.setItem('jwtToken', data.access_token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    const user = sessionStorage.getItem('user');
                    const userId = data.user.id;
                    const token = data.access_token;
                    const urlPlayers = `${apiUrl}/api/players/`;
                    try {
                        const playerResponse = await fetch(urlPlayers, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (playerResponse.ok) {
                            const playerData = await playerResponse.json();
                            const player = playerData.find(p => p.user === userId);

                            if (player) {
                                sessionStorage.setItem('player', JSON.stringify(player.id));
                                sessionStorage.setItem('playerInfo', JSON.stringify(player));
                                sessionStorage.setItem('nickname', JSON.stringify(player.nickname));
                                putPlayer("ON");
                            } else {
                                checkLoginStatus();
                                sessionStorage.setItem('firtChat', 'true');
                                navigateTo('/create-player');
                                return;
                            }
                        } 
                    } catch (error) {
                        console.error('Error', error);
                    }
                    checkLoginStatus();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }


    app.innerHTML = `
    <div class="select-game">
    
    <div class="game-selection" id="pong-select">
        <button id="pongBtn" class="btn-game">
            <img src="./assets/pongneon2.png" alt="Pong" class="button-image-select">
            <h3>Pong</h3>
        </button>
    </div>
    <div class="game-selection" id="snake-select">
        <button id="snakeBtn" class="btn-game">
            <img src="./assets/snake3d.png" alt="Snake" class="button-image-select">
            <h3>Snake</h3>
        </button>
    </div>
</div>

`;


    document.getElementById('pongBtn').addEventListener('click', () => {
        sessionStorage.setItem('game', 'pong');
        navigateTo('/select-playerOrAI')
    });
    document.getElementById('snakeBtn').addEventListener('click', () => {
        sessionStorage.setItem('game', 'snake');
        navigateTo('/snake-selector')
    });
};