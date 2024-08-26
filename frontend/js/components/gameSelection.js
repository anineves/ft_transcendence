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
    console.log(register);

    if (register === "42") {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("code");
        console.log(code);

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
                    console.log(data);
                    sessionStorage.setItem('jwtToken', data.access_token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    const user = sessionStorage.getItem('user');
                    console.log(user);
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

    // Após a autenticação, renderizar a interface de seleção de jogos
    app.innerHTML = `
        <div class="select-game">
            <div class="game-selection-item">
                <div id="pong-select">
                    <button id="pongBtn" class="btn">
                        <img src="./assets/pongneon2.png" alt="Pong" class="button-image-select">
                        <h3>Pong</h3>
                    </button>
                </div>
            </div>
            <div class="game-selection-item">
                <div id="4line-select">
                    <button id="4LineBtn" class="btn">
                        <img src="./assets/4lineneon.png" alt="4 in a Line" class="button-image-select">
                        <h3>4 in a Line</h3>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Adicionar eventos de clique aos botões
    document.getElementById('pongBtn').addEventListener('click', () => navigateTo('/select-playerOrAI'));
    document.getElementById('4LineBtn').addEventListener('click', () => navigateTo('/4line'));
};