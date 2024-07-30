import { navigateTo, render, checkLoginStatus, logout } from './utils.js';
import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { render4line } from './components/fourLine.js';
import { renderPanel } from './components/userPanel.js';

// Define as rotas da aplicação e suas funções de renderização correspondentes
const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
    '/user-panel':  renderPanel,
};

// Adiciona um listener que chama a função de renderização quando o DOM é carregado
document.addEventListener('DOMContentLoaded', () => {
    render();

    // Adiciona listeners para os botões de login e registro
    document.getElementById('loginBtn').addEventListener('click', () => {
        navigateTo('/login');
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
        navigateTo('/register');
    });

    document.getElementById('userAvatar').addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            navigateTo('/user-panel', user);
        }
    });
    document.getElementById('editBtn').addEventListener('click', () => {
        const userReg = JSON.parse(localStorage.getItem('userReg'));
        if (userReg) {
            navigateTo('/updateProfile', userReg);
        }
    });
});

// Define uma função para lidar com eventos de navegação do histórico (ex.: botões de voltar e avançar do navegador)
window.onpopstate = render;