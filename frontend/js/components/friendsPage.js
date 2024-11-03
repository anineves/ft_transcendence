import { renderRequestPanel } from './requestPanel.js';
import { navigateTo } from '../utils.js';
const apiUrl = window.config.API_URL;

export const renderFriendsPage = async (user) => {
    const app = document.getElementById('app');
    
    const translations = {
        english: {
            title: "Friends",
            noFriends: "No Friends found",
            invitBtn: "Invite friends",
            requestsBtn: "Friends Requests",
            nickFriend: "Friend nickname",
            sendReq: "Send Request",
            neededPlayer: "You need to create a Player",
            sucessRequest: "Friend request sent successfully!",
            failedRequest: "Failed to send friend request: '",
            errorFriend: "There is no player created with this data, please enter a valid name",
            repeatRequest: "You're already friends, check your friends list or friend requests.",
        },
        portuguese: {
            title: "Amigos",
            noFriends: "Nenhum amigo encontrado",
            invitBtn: "Convidar amigos",
            requestsBtn: "Solicitações de Amizade",
            nickFriend: "Apelido do amigo",
            sendReq: "Enviar Solicitação",
            neededPlayer: "Tu precisas criar um jogador",
            sucessRequest: "Solicitação de amizade enviada com sucesso!",
            failedRequest: "Falha ao enviar solicitação de amizade: '",
            errorFriend: "Nao ha jogador criado com esses dados, por favor insira um nome valido",
            repeatRequest: "Já são amigos, vejam a vossa lista de amigos ou os vossos pedidos de amizade.",
        },
        french: {
            title: "Amis",
            noFriends: "Aucun ami trouvé",
            invitBtn: "Inviter des amis",
            requestsBtn: "Demandes d'amis",
            nickFriend: "Surnom de l'ami",
            sendReq: "Envoyer la demande",
            neededPlayer: "Vous devez créer un joueur",
            sucessRequest: "Demande d'ami envoyée avec succès !",
            failedRequest: "Échec de l'envoi de la demande d'ami : '",
            errorFriend: "Aucun joueur n'a été créé avec ces données, veuillez entrer un nom valide",
            repeatRequest: "Vous êtes déjà amis, vérifiez votre liste d'amis ou vos demandes d'amis.",
        }
    };
    
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;

    app.innerHTML = `
        <div class="friendship-management-panel background-form">
            <h2>${translations[savedLanguage].title}</h2>
            <ul id="friendsList"></ul> 
            <button id="inviteBtn2" class="btn">${translations[savedLanguage].invitBtn}</button>
            <button id="friendsBtn2" class="btn">${translations[savedLanguage].requestsBtn}</button>
            <div id="inviteSection" style="display: none;">
                <form id="inviteForm">
                    <input type="text" id="friendId" placeholder="${translations[savedLanguage].nickFriend}" class="form-control mb-2" required>
                    <div id="invitefriendError" class="error-message" style="color:red; font-size: 0.9em;"></div> 
                    <button type="submit" class="btn">${translations[savedLanguage].sendReq}</button>
                </form>
            </div>
        </div>
    `;

    const friendsList = document.getElementById('friendsList');
    const player = sessionStorage.getItem('player');

    if (player) {
        const urlPlayer = `${apiUrl}/api/player/${player}`;
        try {
            const response = await fetch(urlPlayer, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.friendship && data.friendship.length > 0) {
                    for (let friendId of data.friendship) {
                        const urlfriendID = `${apiUrl}/api/player/${friendId}`;
                        try {
                            const friendResponse = await fetch(urlfriendID, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (friendResponse.ok) {
                                const friendData = await friendResponse.json();
                                const listItem = document.createElement('li');
                                const friendButton = document.createElement('button');
                                friendButton.textContent = "•" + friendData.nickname;
                                friendButton.className = 'friend-nickname-btn';

                                friendButton.onclick = () => {
                                    sessionStorage.setItem('playerProfile', JSON.stringify(friendData));
                                    navigateTo('/player-profile');
                                };
                                listItem.appendChild(friendButton);
                                friendsList.appendChild(listItem);
                            } else {
                                console.log(`Failed to load friend with ID: ${friendId}`);
                            }
                        } catch (friendError) {
                            console.error('Error fetching friend data:', friendError);
                        }
                    }
                } else {
                    friendsList.innerHTML = `<li>${translations[savedLanguage].noFriends}</li>`;
                }
            } else {
                console.log('Failed to load friends.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.log(`${translations[savedLanguage].neededPlayer}`);
        navigateTo('/create-player');
    }


    document.getElementById('inviteBtn2').addEventListener('click', () => {
        const inviteSection = document.getElementById('inviteSection');
        inviteSection.style.display = inviteSection.style.display === 'none' ? 'flex' : 'none';
    });

    document.getElementById('friendsBtn2').addEventListener('click', () => {
        navigateTo('/requestPanel');
    });

    document.getElementById('inviteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const friendId = document.getElementById('friendId').value;
        const nameRegex = /^[a-zA-Z0-9-]+$/; 
        let valid = true;
        const invitefriendError = document.getElementById('invitefriendError');
        invitefriendError.textContent = '';
        if (!nameRegex.test(friendId)) {
            invitefriendError.textContent += `${translations[savedLanguage].errorFriend}`;
            valid = false;
        }
        if(!valid) return;
        
        const urlPlayers = `${apiUrl}/api/players`;
        let playerFriend;
        try {
            const response = await fetch(urlPlayers, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            playerFriend = data.find(p => p.nickname == friendId);
        } catch (error) {
            console.error('Error:', error);
        }
        if(playerFriend)
        {

        try {
            const apiUrl = window.config.API_URL;
            const urlSendFriend = `${apiUrl}/api/player/send_friend_request/${friendId}/`;

            const response = await fetch(urlSendFriend, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log(`${translations[savedLanguage].sucessRequest}`);
                navigateTo('/friendPage')
            } else {
                const errorData = await response.json();
                invitefriendError.textContent += `${translations[savedLanguage].repeatRequest}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }else
    {
        invitefriendError.textContent += `${translations[savedLanguage].errorFriend}`;
            valid = false;
    }
    });

};
