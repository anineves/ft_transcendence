import { navigateTo, render, checkLoginStatus, logout } from './utils.js';
import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { render4line } from './components/fourLine.js';
import { renderPanel } from './components/userPanel.js';
import { createPlayer } from './components/createPlayer.js';
import { teste} from './components/teste.js';
import {startMenu} from './components/startMenu.js';
import { selectPlayerorAI } from './components/selectPlayerOrAI.js';
import { renderRequestPanel } from './components/requestPanel.js';
import { waitRemote } from './components/waitRemote.js';
// Define as rotas da aplicação e suas funções de renderização correspondentes
const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
    '/user-panel':  renderPanel,
    '/create-player': createPlayer, 
    '/star-menu': startMenu,
    '/select-playerOrAI': selectPlayerorAI,
    '/friendPanel': renderRequestPanel,
    'wait-remote': waitRemote,
};

// Adiciona um listener que chama a função de renderização quando o DOM é carregado
document.addEventListener('DOMContentLoaded', () => {
    render(); // Renderiza a página atual com base na URL
    checkLoginStatus();

    document.getElementById('startBtn').addEventListener('click', () => {
        navigateTo('/star-menu');
    });

    document.getElementById('userAvatar').addEventListener('click', () => {
        const user = JSON.parse(sessionStorage.getItem('user')); // Obtém o usuário do sessionStorage
        if (user) {
            navigateTo('/user-panel', user);
        }
    });
});

// Define uma função para lidar com eventos de navegação do histórico (ex.: botões de voltar e avançar do navegador)
window.onpopstate = render;