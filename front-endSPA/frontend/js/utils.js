import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { render4line } from './components/fourLine.js';


//Função para alterar a URL do navegador e atualizar a exibição da página
export const navigateTo = (path) => {
    /// Atualiza o histórico do navegador com a nova URL e adiciona um novo estado
    window.history.pushState({}, path, window.location.origin + path);
    render();
};


// Renderiza o conteúdo da página com base na URL atual
export const render = () => {
    //Obtém o caminho da URL atual
    const path = window.location.pathname;
    const route = routes[path] || renderMenu;
    route();
};

// Mapeia rotas para suas respectivas funções de renderização
export const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
};