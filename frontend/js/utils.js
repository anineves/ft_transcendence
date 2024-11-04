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
import { render3DSnake } from './components/3dsnake.js';
import { stats } from './components/stats.js';
import { putPlayer } from './components/login.js';
import { renderSnake } from './components/snake.js';
import { snakeSelect } from './components/snakeSelect.js';
import { closeSocket } from './components/live-chat.js';
import { endGameWithScore } from './components/pong.js';
import { stop3DGame} from './components/pong/3dpong.js';
import { stop3DSnakeGame } from './components/pong/3dsnake.js';

//import { Pond3dtotal } from './components/pong/3dpong.js';



// Função para atualizar o texto do rodapé baseado no idioma
const updateFooterTranslation = () => {
    const footerText = document.getElementById('text-footer');

    if (footerText) {
        const savedLanguage = localStorage.getItem('language') || 'english';
        footerText.innerText = translations[savedLanguage];
    }
};

const translations = {
    english: "Created by: alexfern asousa-n jegger-s",
    portuguese: "Criado por: alexfern asousa-n jegger-s",
    french: "Créé par : alexfern asousa-n jegger-s",
};

// Mapeia rotas para suas respectivas funções de renderização
export const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/snake': renderSnake,
    '/register': renderRegister,
    '/user-panel': renderPanel, 
    '/create-player': createPlayer, 
    '/star-menu': startMenu,
    '/select-playerOrAI': selectPlayerorAI,
    '/snake-selector': snakeSelect,
    '/requestPanel': renderRequestPanel,
    '/friendPage' : renderFriendsPage,
    '/tournament' : selectTournamentPlayers,
    '/tournament-setup' : setupTournament,
    '/wait-remote' : waitRemote,
    '/live-chat' : liveChat,
    '/player-profile': renderPlayerProfile,
    '/3d-pong': render3DPong,
    '/3d-snake': render3DSnake,
    '/stats': stats,
    //'/3dPong': Pond3dtotal,
};

const protectedRoutes = [
    '/user-panel',
    '/create-player',
    '/friendPanel',
    '/friendPage',
    '/wait-remote',
    '/player-profile',
    '/stats',
    '/live-chat',
];

const isAuthenticated = () => {
    const jwtToken = sessionStorage.getItem('jwtToken');
    return jwtToken !== null;
};

const isGroupAvailable = () => {
    const groupName = sessionStorage.getItem('groupName');
    return groupName !== null;
};

const isRemote = () => {
    const modality = sessionStorage.getItem('modality');
    if(modality == 'remote' || modality == 'tourn-remote')
        return modality !== null;
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
    const state = window.history.state;
  // Obtém o estado atual do histórico
    updateFooterTranslation();
    const pong = sessionStorage.getItem("pongGame");
    const snake = sessionStorage.getItem("snakeGame");
    if(pong == "true" || snake == "true")
    {
        if((sessionStorage.getItem('modality') == '3D' || sessionStorage.getItem('modality') == 'player') && pong == "true")
        {
            sessionStorage.setItem("pongGame", "false");
            sessionStorage.setItem("snakeGame", "false");
            stop3DGame();
            return;
        }
        if((sessionStorage.getItem('modality') == '3D' || sessionStorage.getItem('modality') == 'player')  && snake == "true")
        {
            sessionStorage.setItem("pongGame", "false");
            sessionStorage.setItem("snakeGame", "false");
            stop3DSnakeGame();
            return;
        }

        if(sessionStorage.getItem('modality') == 'remote' && (pong == "true" || snake == "true"))
        {
            sessionStorage.setItem("pongGame", "false");
            sessionStorage.setItem("snakeGame", "false");
            navigateTo('/live-chat');
            return;
        }
            sessionStorage.setItem("pongGame", "false");
            sessionStorage.setItem("snakeGame", "false");
            endGameWithScore();
            navigateTo('/game-selection');
            return;
    
    }

    if (protectedRoutes.includes(path) && !isAuthenticated()) {
        navigateTo('/'); 
        return;
    }
    if (path === '/wait-remote' && !isGroupAvailable()) {
        navigateTo('/'); 
        return;
    }

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
    let firstChat = sessionStorage.getItem('firtChat');
    if(firstChat == 'false')
        closeSocket();
    putPlayer('OF');
    sessionStorage.removeItem('user'); 
    sessionStorage.clear();
    localStorage.clear();
    checkLoginStatus(); 
    navigateTo('/'); 
};

//sada para ouvir e lidar com eventos de navegação no navegador, como o uso dos botões "voltar" e "avançar" no histórico do navegador.

window.addEventListener('popstate', () => {
    // Verifica se a rota é /pong ou /snake com modalidade "remote" apenas quando o usuário usa "voltar" ou "avançar"
    const pong = sessionStorage.getItem("pongGame");
    const snake = sessionStorage.getItem("snakeGame");
    if(pong == "true" || snake == "true")
        {
            if((sessionStorage.getItem('modality') == '3D' || sessionStorage.getItem('modality') == 'player') && pong == "true")
            {
                sessionStorage.setItem("pongGame", "false");
                sessionStorage.setItem("snakeGame", "false");
                stop3DGame();
                return;
            }
            if((sessionStorage.getItem('modality') == '3D' || sessionStorage.getItem('modality') == 'player')  && snake == "true")
            {
                sessionStorage.setItem("pongGame", "false");
                sessionStorage.setItem("snakeGame", "false");
                stop3DSnakeGame();
                return;
            }
    
            if(sessionStorage.getItem('modality') == 'remote' && (pong == "true" || snake == "true"))
            {
                sessionStorage.setItem("pongGame", "false");
                sessionStorage.setItem("snakeGame", "false");
                        navigateTo('/live-chat');
                        return;
            }
                sessionStorage.setItem("pongGame", "false");
                sessionStorage.setItem("snakeGame", "false");
        
                endGameWithScore();
                navigateTo('/game-selection');
                return;
        
        }
    
    render();
});