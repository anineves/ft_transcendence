import { checkLoginStatus, navigateTo } from '../utils.js';

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
                const response = await fetch('http://localhost:8000/oauth/callback/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code })
                });
                
                const data = await response.json();

                if (data.access_token) {
                    //console.log(data);
                    sessionStorage.setItem('jwtToken', data.access_token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    const user = sessionStorage.getItem('user');
                    //console.log(user);
                    checkLoginStatus();
                } else {
                    console.error('OAuth login failed', data);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error occurred while processing OAuth login.');
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


    document.getElementById('pongBtn').addEventListener('click', () => navigateTo('/select-playerOrAI'));
    document.getElementById('snakeBtn').addEventListener('click', () => navigateTo('/3d-snake'));
};