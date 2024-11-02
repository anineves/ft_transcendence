import { navigateTo, render, checkLoginStatus, logout } from './utils.js';
import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { renderPanel } from './components/userPanel.js';
import { createPlayer } from './components/createPlayer.js';
import { startMenu } from './components/startMenu.js';
import { selectPlayerorAI } from './components/selectPlayerOrAI.js';
import { renderRequestPanel } from './components/requestPanel.js';
import { waitRemote } from './components/waitRemote.js';
import { renderPlayerProfile } from './components/friendsPanel.js';
import { render3DPong } from './components/3dPong.js';
import { render3DSnake } from './components/3dsnake.js';
import { stats } from './components/stats.js';



// Traduções para o rodapé


// Definir as rotas da aplicação e suas funções de renderização correspondentes
const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/register': renderRegister,
    '/user-panel':  renderPanel,
    '/create-player': createPlayer,
    '/star-menu': startMenu,
    '/select-playerOrAI': selectPlayerorAI,
    '/friendPanel': renderRequestPanel,
    '/wait-remote': waitRemote,
    '/player-profile': renderPlayerProfile,
    '/3d-pong': render3DPong,
    '/3d-snake': render3DSnake,
    '/stats': stats,
};



document.addEventListener('DOMContentLoaded', () => {
    render(); 
    checkLoginStatus();



    document.getElementById('startBtn').addEventListener('click', () => {
        navigateTo('/star-menu');
    });

    document.getElementById('userAvatar').addEventListener('click', () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            navigateTo('/user-panel', user);
        }
    });

    const languageDropdown = document.getElementById('languageDropdown');
    const languageList = document.getElementById('languageList');
    const selectedLanguageBtn = document.getElementById('selectedLanguage');
    const flagIcon = document.getElementById('flagIcon');

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        const selectedFlag = document.querySelector(`[data-language="${savedLanguage}"]`).getAttribute('data-flag');
        flagIcon.src = selectedFlag;
    } else {
        flagIcon.src = './assets/usa.png';
        localStorage.setItem('language', 'english');
    }

    selectedLanguageBtn.addEventListener('click', (event) => {
        event.preventDefault();
        languageList.classList.toggle('hidden');
    });

    document.querySelectorAll('.languageOption').forEach(option => {
        option.addEventListener('click', (event) => {
            const language = event.currentTarget.getAttribute('data-language');
            const flag = event.currentTarget.getAttribute('data-flag');

            // Atualiza o ícone da bandeira e salva a linguagem no localStorage
            flagIcon.src = flag;
            localStorage.setItem('language', language);

            // Renderiza a aplicação e atualiza o rodapé
            render(); 
             // Atualiza o rodapé após a mudança de idioma
        });
    });

    document.addEventListener('click', (event) => {
        if (!languageDropdown.contains(event.target)) {
            languageList.classList.add('hidden');
        }
    });
});

window.onpopstate = render;
