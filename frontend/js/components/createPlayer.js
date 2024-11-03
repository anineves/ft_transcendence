import { navigateTo, checkLoginStatus } from '../utils.js';
const apiUrl = window.config.API_URL;
import { putPlayer } from './login.js';
export const createPlayer = () => {
    const app = document.getElementById('app');
    const Player = sessionStorage.getItem("playerInfo");
    const user = JSON.parse(sessionStorage.getItem('user'));

    const translations = {
        english: {
            title: 'Create Your Player',
            nick: 'Please insert a nickname',
            playerMessage: 'To register your games, and access other features, please create your player',
            submitBtn: 'Submit', 
            created: 'Player already created',
            exitBtn: 'Exit',
            errorNick: 'This nickname already exists',
            errorNick2: "Nickname must contain only letters, numbers, and the '-' symbol.",
        },
        portuguese: {
            title: 'Crie Seu Jogador',
            nick: 'Por favor, insira um apelido',
            playerMessage: 'Para registar os seus jogos, e ter acessos a outras funcionalidades, por favor crie o seu player',
            submitBtn: 'Enviar',
            created: 'Jogador já criado',
            exitBtn: 'Sair',
            errorNick: 'Este nickname já existe',
            errorNick2: "O nickname deve conter apenas letras, números e o símbolo '-'."

        },
        french: {
            title: 'Créez Votre Joueur',
            nick: 'Veuillez insérer un pseudonyme',
            playerMessage: "Pour enregistrer vos jeux et accéder à d'autres fonctionnalités, veuillez créer votre lecteur",
            submitBtn: 'Soumettre',
            created: 'Joueur déjà créé',
            exitBtn: 'Quitter',
            errorNick: 'Ce joueur existe déjà',
            errorNick2: "Le nickname doit contenir uniquement des lettres, des chiffres et le symbole '-'",
        }
    };
    
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;
    if(Player != null)
    {
        app.innerHTML = `
        <div class="background-form">
            <h2>${translations[savedLanguage].created}</h2>
            <button id="exitBtn"type="submit" class="btn">${translations[savedLanguage].exitBtn}</button>
        </div>
    `;
    document.getElementById('exitBtn').addEventListener('click', () => navigateTo('/user-panel', user));
    }
    else
    {
    app.innerHTML = `
        <div class="background-form">
            <h2>${translations[savedLanguage].title}</h2>
            <p>${translations[savedLanguage].playerMessage}</p>
            <form id="playerForm">
               <input type="text" id="nickname" placeholder="${translations[savedLanguage].nick}" required class="form-control mb-2">
                <div id="createPlayerError" class="error-message" style="color:red; font-size: 0.9em;"></div>
               <button type="submit" class="btn">${translations[savedLanguage].submitBtn}</button>
            </form>
        </div>
    `;

    document.getElementById('playerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nickname = document.getElementById('nickname').value;
        const playerError = document.getElementById('createPlayerError');
        const nameRegex = /^[a-zA-Z0-9-]+$/;
        let valid = true;


        playerError.textContent = '';
        if(!nameRegex.test(nickname)) {
            playerError.textContent += `${translations[savedLanguage].errorNick2}`;
            valid = false;
        }
        if (!valid) return;
        sessionStorage.setItem('nickname', nickname);
        const token = sessionStorage.getItem('jwtToken');
        
        try {
            const urlPlayeres = `${apiUrl}/api/players/`;
                const response = await fetch(urlPlayeres, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ nickname })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('player', JSON.stringify(data.id));
                sessionStorage.setItem('playerInfo', JSON.stringify(data));
                sessionStorage.setItem('playerID', JSON.stringify(data.id));
                sessionStorage.setItem('nickname', JSON.stringify(data.nickname));
                putPlayer("ON");
                navigateTo('/game-selection'); 
            } else {
                playerError.textContent += `${translations[savedLanguage].errorNick}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    }
};