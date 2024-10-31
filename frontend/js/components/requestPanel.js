import { navigateTo } from '../utils.js';
const apiUrl = window.config.API_URL;
export const renderRequestPanel = () => {
    const app = document.getElementById('app');
    const user = JSON.parse(sessionStorage.getItem('user'));
    const translations = {
        english: {
            title: "Friend Requests",
            recvRequests: "Received Requests",
            sendRequests: "Sent Requests",
            acceptBtn: "Accept",
            rejectBtn: "Reject",
            sendReq: "Send Request",
            sendMsg: "You sent a friend request to",
            recvMsg: "sent you a friend request",
            backBtn: "Back to Friends Panel",
        },
        portuguese: {
            title: "Solicitações de Amizade",
            recvRequests: "Solicitações Recebidas",
            sendRequests: "Solicitações Enviadas",
            acceptBtn: "Aceitar",
            rejectBtn: "Rejeitar",
            sendReq: "Enviar Solicitação",
            sendMsg: "Você enviou uma solicitação de amizade para",
            recvMsg: "enviou-lhe uma solicitação de amizade",
            backBtn: "Voltar ao Painel de Amigos",
        },
        french: {
            title: "Demandes d'Amis",
            recvRequests: "Demandes Reçues",
            sendRequests: "Demandes Envoyées",
            acceptBtn: "Accepter",
            rejectBtn: "Rejeter",
            sendReq: "Envoyer la Demande",
            sendMsg: "Vous avez envoyé une demande d'ami à",
            recvMsg: "vous a envoyé une demande d'ami",
            backBtn: "Retour au Panneau d'Amis",
        }
    };
    
    
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;
    app.innerHTML = `
        <div class="friend-requests-panel background-form">
            <h2>${translations[savedLanguage].title}</h2>
            <div id="receivedRequestsSection">
                <h3>${translations[savedLanguage].recvRequests}</h3>
                <ul id="receivedRequestsList"></ul>
            </div>
            <div id="sentRequestsSection">
                <h3>${translations[savedLanguage].sendRequests}</h3>
                <ul id="sentRequestsList"></ul>
            </div>
             <button id="backFriendsBtn" class="btn">${translations[savedLanguage].backBtn}</button>
        </div>
    `;
    
    document.getElementById('backFriendsBtn').addEventListener('click', () => navigateTo('/friendPage', user));
    const displayRequests = async () => {
        const apiUrl = window.config.API_URL;
        const urlRequest = `${apiUrl}/api/player/requests/`;
        try {
            const response = await fetch(urlRequest, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const receivedRequestsList = document.getElementById('receivedRequestsList');
                const sentRequestsList = document.getElementById('sentRequestsList');

                receivedRequestsList.innerHTML = '';
                sentRequestsList.innerHTML = '';

                data.forEach(request => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${request.sender} ${translations[savedLanguage].recvMsg}`;
                    if (request.invited === user.username) {
                        const acceptButton = document.createElement('button');
                        acceptButton.textContent = `${translations[savedLanguage].acceptBtn}`;
                        acceptButton.addEventListener('click', () => handleFriendRequest(request.id, true));

                        const rejectButton = document.createElement('button');
                        rejectButton.textContent = `${translations[savedLanguage].rejectBtn}`;
                        rejectButton.addEventListener('click', () => handleFriendRequest(request.id, false));

                        listItem.appendChild(acceptButton);
                        listItem.appendChild(rejectButton);
                        receivedRequestsList.appendChild(listItem);
                    } else if (request.sender === user.username) {
                        listItem.textContent = `${translations[savedLanguage].sendMsg} ${request.invited}`;
                        sentRequestsList.appendChild(listItem);
                    }
                });
            } else {
                alert('Failed to load friend requests.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while loading friend requests.');
        }
    };

    const handleFriendRequest = async (requestId, accepted) => {
        try {
            const apiUrl = window.config.API_URL;
            const urlRespondRequest = `${apiUrl}/api/player/respond_friend_request/${requestId}/`;
            const response = await fetch(urlRespondRequest, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accepted })
            });

            if (response.ok) {
                displayRequests();  
            } else {
                alert('Failed to update friend request.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the friend request.');
        }
    };

    displayRequests();
};
