import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { render4line } from './components/fourLine.js';
import { renderPanel } from './components/userPanel.js';
import { createPlayer } from './components/createPlayer.js';


// Mapeia rotas para suas respectivas funções de renderização
export const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
    '/user-panel': renderPanel, 
    '/create-player': createPlayer, 
};

// Altera a URL do navegador e atualizar a exibição da página
export const navigateTo = (path, user = null) => {
    window.history.pushState({ user }, path, window.location.origin + path); // Atualiza o histórico com o novo estado
    render();
};

// Renderiza o conteúdo da página com base na URL
export const render = () => {
    const path = window.location.pathname; // Obtém o caminho atual da URL
    const route = routes[path] || renderMenu;
    const state = window.history.state; // Obtém o estado atual do histórico
    if (path === '/user-panel' && state?.user) { // Se tiver na rota do user.pna e o estado contem um user
        route(state.user); // Renderiza o painel do usuário com os dados do usuário
    } else {
        route(); // Renderiza a rota padrão
    }
};

export const checkLoginStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userAvatar = document.getElementById('userAvatar');
    const avatarImg = document.getElementById('avatarImg');

    if (user) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userAvatar.style.display = 'block';
        avatarImg.src = '../../assets/avatar.png';
        if (user.avatar) {
            avatarImg.src = user.avatar;
        } 
        console.log(avatarImg.src);
    } else {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        userAvatar.style.display = 'none';
    }
};


export const logout = () => {
    localStorage.removeItem('user'); 
    sessionStorage.clear(); 
    checkLoginStatus(); 
    navigateTo('/'); 
};


//sada para ouvir e lidar com eventos de navegação no navegador, como o uso dos botões "voltar" e "avançar" no histórico do navegador.

window.addEventListener('popstate', render);
