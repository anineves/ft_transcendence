import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { render4line } from './components/fourLine.js';
import { renderPanel } from './components/userPanel.js';

// Mapeia rotas para suas respectivas funções de renderização
export const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
    '/user-panel': renderPanel, 
};

// Altera a URL do navegador e atualizar a exibição da página
export const navigateTo = (path, user = null) => {
    window.history.pushState({ user }, path, window.location.origin + path);
    render();
};

// Renderiza o conteúdo da página com base na URL 
export const render = () => {
    const path = window.location.pathname;
    const route = routes[path] || renderMenu;
    
    const state = window.history.state;
    if (path === '/user-panel' && state?.user) {
        route(state.user); 
    } else {
        route();
    }
};

export const checkLoginStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userAvatar = document.getElementById('userAvatar');

    if (user) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userAvatar.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        userAvatar.style.display = 'none';
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    checkLoginStatus();
    navigateTo('/');
};


window.addEventListener('popstate', render);
