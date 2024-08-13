import { navigateTo } from '../utils.js';

export const startMenu = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="background-form" id="form-startmenu">
          <img src="./assets/games1.png" alt="Pong4">
          <button id="loginBtn2" class="btn">Login</button>
          <button id="registerBtn2" class="btn">Sign in</button>
          <button id="guestBtn2" class="btn">Play as Guest</button>
        </div>
    `;

    // Adiciona manipuladores de eventos para os botões
    document.getElementById('loginBtn2').addEventListener('click', () => navigateTo('/login'));
    document.getElementById('registerBtn2').addEventListener('click', () => navigateTo('/register'));
    document.getElementById('guestBtn2').addEventListener('click', () => navigateTo('/game-selection'));
};


