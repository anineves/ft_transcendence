import { navigateTo } from '../utils.js';
//import { translations } from '../app.js';


export const startMenu = () => {
  const translations = {
    english: {
        title: "Welcome to Django!",
        login: "Login",
        register: "Sign in",
        guest: "Play as Guest",
    },
    portuguese: {
        title: "Bem-vindo ao Django!",
        login: "Entrar",
        register: "Registrar",
        guest: "Jogar como Convidado",
    },
    french: {
      title: "Bienvenue à Django!",
      login: "Se connecter",
      register: "S'inscrire",
      guest: "Jouer en tant qu'invité",
  },
  };
  const app = document.getElementById('app');
  let savedLanguage = localStorage.getItem('language');


  if (!savedLanguage || !translations[savedLanguage]) {
      savedLanguage = 'english'; 
  } 
; 
  
  app.innerHTML = `
      <div class="background-form" id="form-startmenu">
          <img src="./assets/games1.png" alt="Pong4">
          <button id="loginBtn2" class="btn">${translations[savedLanguage].login}</button>
          <button id="registerBtn2" class="btn">${translations[savedLanguage].register}</button>
          <button id="guestBtn2" class="btn">${translations[savedLanguage].guest}</button>
          <footer id="text-footer">${translations[savedLanguage].footer}</footer>
      </div>
  `;


  document.getElementById('loginBtn2').addEventListener('click', () => navigateTo('/login'));
  document.getElementById('registerBtn2').addEventListener('click', () => navigateTo('/register'));
  document.getElementById('guestBtn2').addEventListener('click', () => navigateTo('/game-selection'));
};


