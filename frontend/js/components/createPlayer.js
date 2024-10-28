import { navigateTo, checkLoginStatus } from '../utils.js';
const apiUrl = window.config.API_URL;
export const createPlayer = () => {
    const app = document.getElementById('app');
    const Player = sessionStorage.getItem("playerInfo");
    const user = JSON.parse(sessionStorage.getItem('user'));
    const translations = {
        english: {
            title: 'Create Your Player',
            nick: 'Please insert a nickname',
            submitBtn: 'Submit', 
            created: 'Player already created',
            exitBtn: 'Exit',
        },
        portuguese: {
            title: 'Crie Seu Jogador',
            nick: 'Por favor, insira um apelido',
            submitBtn: 'Enviar',
            created: 'Jogador já criado',
            exitBtn: 'Sair',
        },
        french: {
            title: 'Créez Votre Joueur',
            nick: 'Veuillez insérer un pseudonyme',
            submitBtn: 'Soumettre',
            created: 'Joueur déjà créé',
            exitBtn: 'Quitter',
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
            <form id="playerForm">
               <input type="text" id="nickname" placeholder="${translations[savedLanguage].nick}" required class="form-control mb-2">
               <button type="submit" class="btn">${translations[savedLanguage].submitBtn}</button>
            </form>
        </div>
    `;

    document.getElementById('playerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nickname = document.getElementById('nickname').value;
        
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
                alert('Player created successfully!');
                sessionStorage.setItem('player', JSON.stringify(data.id));
                sessionStorage.setItem('playerInfo', JSON.stringify(data));
                sessionStorage.setItem('playerID', JSON.stringify(data.id));
                sessionStorage.setItem('nickname', JSON.stringify(data.nickname));
                navigateTo('/game-selection'); 
            } else {
                alert('Player creation failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the player.');
        }
    });
    }
};
