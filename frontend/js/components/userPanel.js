import { navigateTo, checkLoginStatus, logout } from '../utils.js';
import { renderFriendsPage } from './friendsPage.js';
const apiUrl = window.config.API_URL;

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
        levelMsg: "Wins to reach next level",
        logoutBtn: "Logout",
        friendBtn: "Friends",
        creationBtn: "Create Player",
        playBtn: "Play",
        chatBtn: "Chat",
        update: "Update Profile",
        updateBtn: "Update",
        backBtn: "Back to Profile",
        statsBtn: "Stats",
        errorFirstName: "First name must contain only letters, numbers, and the '-' symbol.", 
        errorLastName: "Last name must contain only letters, numbers, and the '-' symbol.", 
        errorUsername: "Username must contain only letters, numbers, and the '-' symbol.", 
        errorEmail: "Email must be valid.",
        errorextension: "Please upload a PNG or JPG file.",
    },
    portuguese: {
        title: "Perfil do Usuário",
        info: "Informação",
        user: "Utilizador",
        email: "Email",
        nick: "Apelido",
        first: "Primeiro Nome",
        last: "Último Nome",
        level: "Nível",
        levelMsg: "Vitórias para alcançar o próximo nível",
        logoutBtn: "Sair",
        friendBtn: "Amigos",
        creationBtn: "Criar Jogador",
        playBtn: "Jogar",
        chatBtn: "Chat",
        update: "Atualizar Perfil",
        updateBtn: "Atualizar",
        backBtn: "Voltar ao Perfil",
        statsBtn: "Estatistica",
        errorFirstName: "O primeiro nome deve conter apenas letras, números e o símbolo '-'.", 
        errorLastName: "Sobrenome deve conter apenas letras, números e o símbolo '-'.", 
        errorUsername: "O username deve conter apenas letras, números e o símbolo '-'.", 
        errorEmail: "O e-mail deve ser válido.",
        errorextension: "Por favor, envie um arquivo PNG ou JPG.",
        
    },
    french: {
        title: "Profil de l'utilisateur",
        info: "Informations",
        user: "Utilisateur",
        email: "Email",
        nick: "Surnom",
        first: "Prénom",
        last: "Nom de famille",
        level: "Niveau",
        levelMsg: "Victoires pour atteindre le niveau suivant",
        logoutBtn: "Déconnexion",
        friendBtn: "Amis",
        creationBtn: "Créer un joueur",
        playBtn: "Jouer",
        chatBtn: "Chat",
        update: "Mettre à jour le profil",
        updateBtn: "Mettre à jour",
        backBtn: "Retour au profil",
        statsBtn: "Stats",
        errorFirstName: "Le prénom doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
        errorLastName: "Le nom de famille doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
        errorUsername: "Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
        errorEmail: "L'e-mail doit être valide.",
        errorextension: "Veuillez télécharger un fichier PNG ou JPG.",
    }
};



export const renderPanel = async (user) => {
    let savedLanguage = localStorage.getItem('language');
    
    
    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english';
    }
    ;
    const app = document.getElementById('app');
    const defaultAvatar = '../../assets/avatar.png';
    let avatarUrl = user.avatar || defaultAvatar;
    if (user.avatar && !user.ft_student) 
        avatarUrl = `${avatarUrl}?${new Date().getTime()}`
    const player = JSON.parse(sessionStorage.getItem('playerInfo'));
    const nickname = sessionStorage.getItem('nickname') || 'N/A';
   
    app.innerHTML = `
        <div class="user-panel">
            <div id="profileSection">
            <h2>${translations[savedLanguage].title}</h2>
            <div class="profile-content">
                <div class="info">
                <img id="avatarImg" src="${avatarUrl}" alt="user-avatar" class="avatar">
                        <h2 id="editBtn2">                        <i class="fas fa-pencil-alt"></i></h2>
                        <p><strong>${translations[savedLanguage].user}:</strong> ${user.username}</p>
                        <p><strong>${translations[savedLanguage].nick}:</strong> ${nickname}</p>
                        <p><strong>${translations[savedLanguage].email}:</strong> ${user.email}</p>
                        <p><strong>${translations[savedLanguage].first}:</strong> ${user.first_name}</p>
                        <p><strong>${translations[savedLanguage].last}:</strong> ${user.last_name}</p>
                        <p><strong>Enable 2FA:</strong><button id="btn-otp">${user.otp_agreement? 'true' : 'false'}</button></p>
                    </div>
                    <div class="progression" id="progression"></div>
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
                    <button type="button" id="removeAvatarBtn" class="btn"><i class="fas fa-trash"></i></button>
                    <input type="text" id="updateFirstName" placeholder="${translations[savedLanguage].first}" class="form-control mb-2">
                    <input type="text" id="updateLastName" placeholder="${translations[savedLanguage].last}" class="form-control mb-2">
                    <div id="updateError" class="error-message" style="color:red; font-size: 0.9em;"></div> 
                    <button type="submit" class="btn">${translations[savedLanguage].updateBtn}</button>
                </form>
                <button id="backProfileBtn" class="btn">${translations[savedLanguage].backBtn}</button>
            </div>
        </div>
    `;


    document.getElementById('btn-otp').addEventListener('click', () => {
        handleUpdateOtp(user);
    });


    if (player) {
        try {
            const apiUrl = window.config.API_URL;
            const urlMatches = `${apiUrl}/api/matches/`;
            const response = await fetch(urlMatches,{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const matches = await response.json();

            let pongWins = 0;
            let snakeWins = 0;

            
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

       
            const pongLevel = Math.floor(pongWins / 5) + 1;
            const pongWinsInCurrentLevel = pongWins % 5;
            const pongProgressBar = Array(5).fill('⬜').map((segment, index) => {
                return index < pongWinsInCurrentLevel ? '🟦' : '⬜';
            }).join('');

          
            const snakeLevel = Math.floor(snakeWins / 5) + 1;
            const snakeWinsInCurrentLevel = snakeWins % 5;
            const snakeProgressBar = Array(5).fill('⬜').map((segment, index) => {
                return index < snakeWinsInCurrentLevel ? '🟦' : '⬜';
            }).join('');

            const prog = document.getElementById('progression');

            prog.innerHTML = `
                <div class="progress-bar" id="progressBar" style="cursor: pointer;">
                    <div class="progress-bar" id="pongProgressBar">
                        <p><strong>${translations[savedLanguage].level} Pong:</strong> ${pongLevel}</p>
                        <span class="progress-label">${pongProgressBar}</span>
                        <p id="txtpong">${pongWinsInCurrentLevel}/5 ${translations[savedLanguage].levelMsg}</p>
                    </div>
                    <div class="progress-bar" id="snakeProgressBar">
                        <p><strong>${translations[savedLanguage].level} Snake:</strong> ${snakeLevel}</p>
                        <span class="progress-label">${snakeProgressBar}</span>
                        <p id="txtsnake">${snakeWinsInCurrentLevel}/5 ${translations[savedLanguage].levelMsg}</p>
                    </div>
                    </div>
                    <div class="btn-progress-bar">
                    <button id="statsBtn" class="btn">${translations[savedLanguage].statsBtn}</button>
                    </div>
            `;

            document.getElementById('progressBar').addEventListener('click', () => {
                navigateTo('/stats');
            });
            document.getElementById('statsBtn').addEventListener('click', () => {
                navigateTo('/stats');
            });
        } catch (error) {
            console.error('Falha ao buscar partidas:', error);
        }
    }

   
    document.getElementById('playBtn').addEventListener('click', () => {
        navigateTo('/game-selection');
    });
    sessionStorage.setItem('removeAvatar', 'false'); 
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('editBtn2').addEventListener('click', toggleEditProfile);
    document.getElementById('friendBtn').addEventListener('click', () => navigateTo('/friendPage', user));
    document.getElementById('createBtn').addEventListener('click', () => navigateTo('/create-player'));
    document.getElementById('sendMessageBtn').addEventListener('click', handleSendMessage);
    document.getElementById('updateProfileForm').addEventListener('submit', (e) => handleUpdateProfile(e, user));
    document.getElementById('backProfileBtn').addEventListener('click', () => navigateTo('/user-panel', user));
    document.getElementById('removeAvatarBtn').addEventListener('click', () => {
        document.getElementById('updateAvatar').value = ""; 
        sessionStorage.setItem('removeAvatar', 'true'); 
    });
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
    if (nickname !== 'N/A') 
    {
        navigateTo('/live-chat');
    }
    else 
        navigateTo('/create-player');
};


const handleUpdateOtp = async (user) => {
    let savedLanguage = localStorage.getItem('language');
    
    
    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english';
    }
    ;
    let otp_agreement = user.otp_agreement; // Verifica o estado atual de OTP
    otp_agreement = !otp_agreement // Alterna entre verdadeiro e falso

    try {
        const apiUrl = window.config.API_URL;
        const urluserID = `${apiUrl}/api/user/${user.id}`;
        const response = await fetch(urluserID, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp_agreement }) // Envia o novo valor como booleano
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('user', JSON.stringify(data));
            checkLoginStatus();
            navigateTo('/user-panel', data);
        } else {
            //console.log('Update failed: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


const handleUpdateProfile = async (e, user) => {
    e.preventDefault();
    let savedLanguage = localStorage.getItem('language');
    
    
    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english';
    }
    ;

    const formData = new FormData();
    const avatarFile = document.getElementById('updateAvatar').files[0];
    const firstName = document.getElementById('updateFirstName').value.trim();
    const lastName = document.getElementById('updateLastName').value.trim();
    const removeAvatar = sessionStorage.getItem('removeAvatar') === 'true';
    const nameRegex = /^[a-zA-Z0-9-]+$/;
    let valid = true;
    if (firstName && !nameRegex.test(firstName)) {
        updateError.textContent += `${translations[savedLanguage].errorFirstName}`;
        valid = false;
    }
    if (lastName && !nameRegex.test(lastName)) {
        updateError.textContent += `${translations[savedLanguage].errorLastName}`;
        valid = false;
    }
    if (avatarFile) {
        const fileName = avatarFile.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (fileExtension != 'png' && fileExtension != 'jpg' && fileExtension != 'jpeg') 
        {
            updateError.textContent += `${translations[savedLanguage].errorextension}`;
            valid = false;
        }
        else{
            formData.append('avatar', avatarFile)
        }
    }
    
    if (!valid)
        return;
    if (removeAvatar) {
        formData.append('avatar', '');
        sessionStorage.setItem('removeAvatar', 'false'); 
    }

    if (firstName) 
        formData.append('first_name', firstName);
    if (lastName) 
        formData.append('last_name', lastName);
    try {
        const apiUrl = window.config.API_URL;
        const urluserID = `${apiUrl}/api/user/${user.id}`;
        const response = await fetch(urluserID, { 
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
            },
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            sessionStorage.setItem('user', JSON.stringify(data));
            checkLoginStatus();
            navigateTo('/user-panel', data);
        } else {
            //console.log('Update failed: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
