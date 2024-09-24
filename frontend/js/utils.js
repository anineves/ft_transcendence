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
import { renderFriendsPage } from './components/friendsPage.js';
import { selectTournamentPlayers } from './components/tournament.js';
import { setupTournament } from './components/tournament.js';
import { waitRemote } from './components/waitRemote.js';
import { liveChat } from './components/live-chat.js';
import { renderPlayerProfile } from './components/friendsPanel.js';
import { render3DPong } from './components/3dPong.js';
import { render3Snake } from './components/3dsnake.js';
import { stats } from './components/stats.js';
import { putPlayer } from './components/login.js';

// Mapeia rotas para suas respectivas funções de renderização
export const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/register': renderRegister,
    '/user-panel': renderPanel, 
    '/create-player': createPlayer, 
    '/star-menu': startMenu,
    '/select-playerOrAI': selectPlayerorAI,
    '/friendPanel': renderRequestPanel,
    '/friendPage' : renderFriendsPage,
    '/tournament' : selectTournamentPlayers,
    '/tournament-setup' : setupTournament,
    '/wait-remote' : waitRemote,
    '/live-chat' : liveChat,
    '/player-profile': renderPlayerProfile,
    '/3d-pong': render3DPong,
    '/3d-snake': render3Snake,
    '/stats': stats,
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
        checkLoginStatus();
    } else {
        route(); // Renderiza a rota padrão
    }
};

export const checkLoginStatus = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const jwtToken = sessionStorage.getItem('jwtToken');
    const userAvatar = document.getElementById('userAvatar');
    const avatarImg = document.getElementById('avatarImg');
    const bar = document.getElementById('startBtn');

    if (jwtToken) {
        if (user) {
            
            userAvatar.style.display = 'block';
            bar.style.display = 'none';
            avatarImg.src = '../../assets/avatar.png';
            if (user.avatar) {
                avatarImg.src = user.avatar;
            } 
        } else {
            bar.style.display = 'block';
            userAvatar.style.display = 'none';
        }
    } else {

        bar.style.display = 'block';
        userAvatar.style.display = 'none';
    }
};


export const logout = () => {
    
    putPlayer('OF');
    sessionStorage.removeItem('user'); 
    sessionStorage.clear();
    localStorage.clear();
    checkLoginStatus(); 
    navigateTo('/'); 
};

//sada para ouvir e lidar com eventos de navegação no navegador, como o uso dos botões "voltar" e "avançar" no histórico do navegador.

window.addEventListener('popstate', render);
