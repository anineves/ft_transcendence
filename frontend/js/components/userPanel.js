import { navigateTo, checkLoginStatus, logout } from '../utils.js';
import { renderFriendsPage } from './friendsPage.js';

export const renderPanel = async (user) => {
    const app = document.getElementById('app');
    const defaultAvatar = '../../assets/avatar.png';
    const avatarUrl = user.avatar || defaultAvatar;
    const player = JSON.parse(sessionStorage.getItem('playerInfo'));
    const nickname = sessionStorage.getItem('nickname') || 'N/A';

    try {
        const response = await fetch('http://localhost:8000/api/matches/');
        const matches = await response.json();

        let pongWins = 0;
        let snakeWins = 0;

        // Contabilizando vitórias no Pong e Snake
        matches.forEach(match => {
            if (match.players.includes(player.id)) {
                if (match.game == 1 && match.winner_id === player.id) {
                    pongWins++;
                }
                if (match.game === 'Snake' && match.winner_id === player.id) {
                    snakeWins++;
                }
            }
        });

        // Cálculo do nível e progresso para Pong
        const pongLevel = Math.floor(pongWins / 5) + 1;
        const pongWinsInCurrentLevel = pongWins % 5;
        const pongProgressBar = Array(5).fill('⬜').map((segment, index) => {
            return index < pongWinsInCurrentLevel ? '🟦' : '⬜';
        }).join('');

        // Cálculo do nível e progresso para Snake
        const snakeLevel = Math.floor(snakeWins / 5) + 1;
        const snakeWinsInCurrentLevel = snakeWins % 5;
        const snakeProgressBar = Array(5).fill('⬜').map((segment, index) => {
            return index < snakeWinsInCurrentLevel ? '🟦' : '⬜';
        }).join('');

        const translations = {
            english: {
                title: "User Profile",
                info: "Information",
                user: "Username",
                email: "Email",
                nick: "Nickname",
                first: "First Name",
                last: "Last Name",
                level: "Level",
                levelMsg: "wins to reach next levekkl",
                logoutBtn: "Logout",
                friendBtn: "Friends",
                creationBtn: "Create Player",
                playBtn: "Play",
                chatBtn: "Chat",
                update: "Update Profile", 
                updateBtn: "Update", 
                backBtn: "Back to Profile"
            },
            portuguese: {
                title: "Perfil do Usuário",
                info: "Informação",
                user: "Nome de Usuário",
                email: "Email",
                nick: "Apelido",
                first: "Primeiro Nome",
                last: "Último Nome",
                level: "Nível",
                levelMsg: "vitórias para alcançar o próximo nível",
                logoutBtn: "Sair",
                friendBtn: "Amigos",
                creationBtn: "Criar Jogador",
                playBtn: "Jogar",
                chatBtn: "Chat",
                update: "Atualizar Perfil",
                updateBtn: "Atualizar",
                backBtn: "Voltar ao Perfil"
            },
            french: {
                title: "Profil de l'utilisateur",
                info: "Informations",
                user: "Nom d'utilisateur",
                email: "Email",
                nick: "Surnom",
                first: "Prénom",
                last: "Nom de famille",
                level: "Niveau",
                levelMsg: "victoires pour atteindre le niveau suivant",
                logoutBtn: "Déconnexion",
                friendBtn: "Amis",
                creationBtn: "Créer un joueur",
                playBtn: "Jouer",
                chatBtn: "Chat",
                update: "Mettre à jour le profil",
                updateBtn: "Mettre à jour",
                backBtn: "Retour au profil"
            }
        };
        
        
        let savedLanguage = localStorage.getItem('language');
    
    
        if (!savedLanguage || !translations[savedLanguage]) {
            savedLanguage = 'english'; 
        } 
      ;

        app.innerHTML = `
        <div class="user-panel">
            <div id="profileSection">
                <button id="closeBtn" class="close-btn"><i class="fa-solid fa-times"></i></button>
                <h2>${translations[savedLanguage].title}</h2>
                <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="user-avatar" class="avatar">
                <div class="profile-content">
                    <div class="info">
                        <h2 id="editBtn2">${translations[savedLanguage].info}<i class="fas fa-pencil-alt"></i></h2>
                        <p><strong>${translations[savedLanguage].user}:</strong> ${user.username}</p>
                        <p><strong>${translations[savedLanguage].nick}:</strong> ${nickname}</p>
                        <p><strong>${translations[savedLanguage].email}:</strong> ${user.email}</p>
                        <p><strong>${translations[savedLanguage].first}:</strong> ${user.first_name}</p>
                        <p><strong>${translations[savedLanguage].last}:</strong> ${user.last_name}</p>
                        <p><strong>Id:</strong> ${user.id}</p>
                    </div>
                    <div class="progression">
                        <div class="progress-bar" id="progressBar" style="cursor: pointer;">
                          <div class="progress-bar" id="pongProgressBar">
                            <p><strong>${translations[savedLanguage].level} Pong:</strong> ${pongLevel}</p>
                            <span class="progress-label">${pongProgressBar}</span>
                            <p>${pongWinsInCurrentLevel}/5 ${translations[savedLanguage].levelMsg}</p>
                        </div>
                        <div class="progress-bar" id="snakeProgressBar">
                            <p><strong>${translations[savedLanguage].level}Snake :</strong> ${snakeLevel}</p>
                            <span class="progress-label">${snakeProgressBar}</span>
                            <p>${snakeWinsInCurrentLevel}/5 ${translations[savedLanguage].levelMsg}</p>
                        </div>
                        </div>
                    </div>
                </div>
                <div class="all-btn">
                    <button id="logoutBtn" class="btn">${translations[savedLanguage].logoutBtn} <i class="fa-solid fa-right-from-bracket"></i></button>
                    <button id="friendBtn" class="btn">${translations[savedLanguage].friendBtn}<i class="fas fa-user-group"></i></button>
                    <button id="createBtn" class="btn">${translations[savedLanguage].creationBtn}</button>
                    <button id="playBtn" class="btn">${translations[savedLanguage].playBtn}</button>
                    <button id="sendMessageBtn" class="btn">${translations[savedLanguage].chatBtn} <i class="fa-solid fa-message"></i></button>
                </div>
            </div>
            <div id="updateProfileSection" style="display: none;">
                <h2>${translations[savedLanguage].update}</h2>
                <form id="updateProfileForm">
                    <input type="file" id="updateAvatar" class="form-control mb-2">
                    <input type="text" id="updateFirstName" placeholder="${translations[savedLanguage].first}" class="form-control mb-2" }">
                    <input type="text" id="updateLastName" placeholder="${translations[savedLanguage].last}" class="form-control mb-2" ">
                    <input type="text" id="updateUsername" placeholder="${translations[savedLanguage].user}" class="form-control mb-2" ">
                    <input type="email" id="updateEmail" placeholder="${translations[savedLanguage].email}" class="form-control mb-2" ">
                    <button type="submit" class="btn">${translations[savedLanguage].updateBtn}</button>
                </form>
                <button id="backProfileBtn" class="btn">${translations[savedLanguage].backBtn}</button>
            </div>
        </div>
    `;

        document.getElementById('progressBar').addEventListener('click', () => {
            navigateTo('/stats');
        });
        document.getElementById('playBtn').addEventListener('click', () => {
            navigateTo('/game-selection');
        });

        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('editBtn2').addEventListener('click', toggleEditProfile);
        document.getElementById('friendBtn').addEventListener('click', () =>navigateTo('/friendPage',user));
        document.getElementById('createBtn').addEventListener('click', () => navigateTo('/create-player'));
        document.getElementById('sendMessageBtn').addEventListener('click', handleSendMessage);
        document.getElementById('updateProfileForm').addEventListener('submit', (e) => handleUpdateProfile(e, user));
        document.getElementById('backProfileBtn').addEventListener('click', () => navigateTo('/user-panel', user));
        document.getElementById('closeBtn').addEventListener('click', () => navigateTo('/'));
    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/live-chat');
    }
};

const toggleEditProfile = () => {
    const profileSection = document.getElementById('profileSection');
    const updateProfileSection = document.getElementById('updateProfileSection');
    const isHidden = updateProfileSection.style.display === 'none';

    updateProfileSection.style.display = isHidden ? 'flex' : 'none';
    profileSection.style.display = isHidden ? 'none' : 'flex';
};

const handleSendMessage = () => {
    const nickname = sessionStorage.getItem('nickname');
    if (nickname !== 'N/A') {
        navigateTo('/live-chat');
    } else {
        alert("You need to create a player!");
        navigateTo('/create-player');
    }
};

const handleUpdateProfile = async (e, user) => {
    e.preventDefault();

    const formData = new FormData();
    const avatarFile = document.getElementById('updateAvatar').files[0];
    const firstName = document.getElementById('updateFirstName').value;
    const lastName = document.getElementById('updateLastName').value;
    const username = document.getElementById('updateUsername').value;
    const email = document.getElementById('updateEmail').value;

    if (avatarFile) formData.append('avatar', avatarFile);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('username', username);
    formData.append('email', email);

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/user/${user.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Profile updated successfully!');
            sessionStorage.setItem('user', JSON.stringify(data));
            checkLoginStatus();
            navigateTo('/user-panel', data);
        } else {
            alert('Update failed: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the profile.');
    }
};
