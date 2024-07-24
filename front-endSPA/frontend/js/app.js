import { navigateTo, render } from './utils.js';
import { renderMenu } from './components/menu.js';
import { renderLogin } from './components/login.js';
import { renderRegister } from './components/register.js';
import { renderGameSelection } from './components/gameSelection.js';
import { renderPong } from './components/pong.js';
import { render4line } from './components/fourLine.js';


// Define as rotas da aplicação e suas funções de renderização correspondentes

const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
};

///Adiciona um listen que chama a função de renderização quando o DOM é carregado
document.addEventListener('DOMContentLoaded', () => {
    render();
});

// Define uma função para lidar com eventos de navegação do histórico (ex.: botões de voltar e avançar do navegador)
//Quando um evento de navegação ocorre, a função render é chamada para atualizar o conteúdo da página
window.onpopstate = render;
