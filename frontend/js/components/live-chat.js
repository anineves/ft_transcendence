import { navigateTo, checkLoginStatus } from '../utils.js'; 
import {  initializeTournament} from './tournament.js';

export const liveChat = () => {
    const player = sessionStorage.getItem('player');
    if(!player){
        alert("You need create a player");
        navigateTo('/create-player');
        return;
    }
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    const nickname2 = sessionStorage.getItem('nickname');
    const nickname = nickname2.replace(/^"|"$/g, '');
    if (!jwttoken) {
        console.error("JWT Token is missing");
        return;
    }

    const socket = new WebSocket('ws://localhost:8000/ws/global_chat/');
    const translations = {
        english: {
            title: "Chat",
            phMsg: "Type your message here...", 
            duelBtn: "Duel",
            phBlock: "Nickname to block...",
            confirmBtn: "Confirm",
            phUnblock: "Player to unblock...",
            phDuel: "Player to duel...",
            duelMsg: "has challenged you to a duel",
            acceptBtn: "Accept",
            lostInvMsg: "has challenged you to a duel",
            fightMsg: " wants to fight!",
            yourselfMsg: "You cannot challenge yourself to a duel.",
            fillNickname: "Please enter a player nickname to duel.",
        },
        portuguese: {
            title: "Chat",
            phMsg: "Digite sua mensagem aqui...", 
            duelBtn: "Duelo",
            phBlock: "Apelido para bloquear...",
            confirmBtn: "Confirmar",
            phUnblock: "Jogador para desbloquear...",
            phDuel: "Jogador para duelar...",
            duelMsg: "desafiou você para um duelo",
            acceptBtn: "Aceitar",
            lostInvMsg: "desafiou você para um duelo",
            fightMsg: " quer lutar!",
            yourselfMsg: "Você não pode desafiar a si mesmo para um duelo.",
            fillNickname: "Por favor, insira um apelido de jogador para duelar.",
        },
        french: {
            title: "Chat",
            phMsg: "Tapez votre message ici...", 
            duelBtn: "Duel",
            phBlock: "Surnom à bloquer...",
            confirmBtn: "Confirmer",
            phUnblock: "Joueur à débloquer...",
            phDuel: "Joueur à défier...",
            duelMsg: "vous a défié à un duel",
            acceptBtn: "Accepter",
            lostInvMsg: "vous a défié à un duel",
            fightMsg: " veut se battre!",
            yourselfMsg: "Vous ne pouvez pas vous défier vous-même à un duel.",
            fillNickname: "Veuillez entrer un surnom de joueur à défier.",
        }
    };
    
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;
    const app = document.getElementById('app');
    app.innerHTML = `
       
            <div class="chat">
            <div class="chat-header">
                <h2>${translations[savedLanguage].title}</h2>
                <button id="leave-button" title="Leave"><i class="fas fa-sign-out-alt"></i></button>
            </div>
            <div class="chat-panel">
                <div id="chat-box" class="chat-box"></div>
                <div class="message-input-container">
                    <input id="message-input" type="text" placeholder="${translations[savedLanguage].phMsg}">
                    <div class="button-panel">
                        <button id="send-button"><i class="fas fa-paper-plane"></i></button>
                        <button id="block-button"><i class="fas fa-ban"></i></button>
                        <button id="unblock-button"><i class="fas fa-unlock"></i></button>
                        <button id="duel-button"><i class="fas fa-crossed-swords"></i> ${translations[savedLanguage].duelBtn}</button>
                    </div>
                </div>
                <div id="block-input-container" style="display: none;">
                    <input id="block-player-input" type="text" placeholder="${translations[savedLanguage].phBlock}...">
                    <button id="confirm-block-button" class="confirm-button">${translations[savedLanguage].confirmBtn}</button>
                </div>
                <div id="unblock-input-container" style="display: none;">
                    <input id="unblock-player-input" type="text" placeholder="${translations[savedLanguage].phUnblock}...">
                    <button id="confirm-unblock-button" class="confirm-button" >${translations[savedLanguage].confirmBtn}</button>
                </div>
                <div id="duel-input-container" style="display: none;">
                    <input id="duel-player-input" type="text" placeholder="${translations[savedLanguage].duelBtn}...">
                    <button id="confirm-duel-button" class="confirm-button">${translations[savedLanguage].confirmBtn}</button>
                </div>
                <div id="create-tournament-container">
                    <button id="create-tournament-button" class="create-button">Create a Tournament</button>
                </div>

            </div>
            </div>
  
    `;
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const leaveButton = document.getElementById('leave-button');
    const blockButton = document.getElementById('block-button');
    const blockInputContainer = document.getElementById('block-input-container');
    const blockPlayerInput = document.getElementById('block-player-input');
    const confirmBlockButton = document.getElementById('confirm-block-button');
    const unblockButton = document.getElementById('unblock-button');
    const unblockInputContainer = document.getElementById('unblock-input-container');
    const unblockPlayerInput = document.getElementById('unblock-player-input');
    const confirmUnblockButton = document.getElementById('confirm-unblock-button');

    const generateRandomTournamentId = () => {
        return Math.floor(Math.random() * 10000) + 1;
    };

    const createTournamentButton = document.getElementById('create-tournament-button');


    const socket2 = new WebSocket(`ws://localhost:8000/ws/tournament/`);
    createTournamentButton.addEventListener('click', function () {
     
        socket2.send(JSON.stringify({ action: 'create_tournament' }));

       
    });
    socket2.onopen = function (event) {
        console.log("Connected to tournament WebSocket");
  
    
    };

    socket2.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);
        console.log("action:", data.action)

        let participateButton = document.getElementById('participate-tournament-button');
        if (!participateButton) 
        { 
            participateButton = document.createElement('button');
            participateButton.innerText = 'Participate in Tournament';
            participateButton.id = 'participate-tournament-button';
            document.body.appendChild(participateButton);
            participateButton.addEventListener('click', function () {
                socket2.send(JSON.stringify({ action: 'join_tournament', player: { nickname: nickname , id: player} }));
            });
        }
    
        if (data.action === 'tournament_full') {
            //console.log('Tournament is full! Participants:', data.participants);
            //alert('Tournament is full! Redirecting to matchmaking...');
            const playerNames = data.participants.map(participant => participant.nickname);
            console.log('Player names:', playerNames);
            sessionStorage.setItem('playerNames', JSON.stringify(playerNames));
            console.log('Tournament is full! Participants:', data.participants);
            //CRIAR NOVA MODALIDADDEEEEEEEE
            sessionStorage.setItem('modality', 'tournament');
            initializeTournament();
        }
    };

    socket2.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    socket2.onclose = function () {
        console.error("Tournament socket was closed");
    };


    const addMessage = (message, isOwnMessage) => {
        const messageElement = document.createElement('div');
        const words = message.split(' ');
        const firstWord2 = words[0];
        const restOfMessage = words.slice(1).join(' ');

        const firstWord = firstWord2.replace(':', '');
        const isFromSelf = firstWord == nickname;
        console.log("first", firstWord);
        console.log("Nick ", nickname);

        messageElement.className = isFromSelf ? 'message own-message' : 'message other-message';

        const firstWordButton = document.createElement('button');
        firstWordButton.className = 'highlighted-player-button';
        firstWordButton.textContent = firstWord;
        firstWordButton.onclick = async () => {
            try {
                const playerResponse = await fetch('http://127.0.0.1:8000/api/players/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwttoken}` 
                    }
                });
        
                if (playerResponse.ok) {
                    const playerData = await playerResponse.json();
                    const player = playerData.find(p => p.nickname === firstWord);
                    if (player) {
                        console.log("Player found:", player);
                        sessionStorage.setItem('playerProfile', JSON.stringify(player));
                        navigateTo('/player-profile');
                    } else {
                        console.log("Player not found");
                    }
                } else {
                    console.log("Error loading players");
                }
            } catch (error) {
                console.error('Error fetching player data:', error);
            }
        };
        
        
        
        messageElement.appendChild(firstWordButton);
        messageElement.appendChild(document.createTextNode(' ' + restOfMessage));

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const user = sessionStorage.getItem('user');
    const user_json = JSON.parse(user);

    socket.onopen = function (event) {
        console.log("Connected to WebSocket");
        socket.send(JSON.stringify({
            Authorization: jwttoken,
        }));
    };
  
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const message = data.message
        
        console.log('Dataaa: ', data)
        console.log('Message: ', message)
        const firstWord = message.content.split(' ')[0];
        const isOwnMessage = firstWord === nickname;
        
        addMessage(message.content, isOwnMessage);
        console.log()
        if (data.action == "duel")
        {
            const groupName = message.group_name;
            sessionStorage.setItem("groupName", groupName);
            console.log("groupname ", groupName);
            const chatBox = document.getElementById('chat-box'); 
            const duelMessage = document.createElement('p');
            duelMessage.innerHTML = 
            `
            ${translations[savedLanguage].duelMsg}
            <a href="https://localhost:8080/wait-remote" id="accept-link">${translations[savedLanguage].acceptBtn}</a>
            `;

            chatBox.appendChild(duelMessage);
            if (user_json.id == message.from_user) {
                sessionStorage.setItem("Inviter", "True");
                console.log("live Inviter:", sessionStorage.getItem("Inviter"))
                navigateTo(`/wait-remote`, groupName);
                socket.close();
            }
            
            const timeout = setTimeout(() => {
                duelMessage.innerHTML = `${translations[savedLanguage].duelBtn}`;
            }, 50000); 
            
            if (user_json.id != message.from_user) {
                sessionStorage.setItem("Inviter", "False");
                sessionStorage.setItem('modality', 'remote');
                const acceptLink = document.getElementById('accept-link');
                acceptLink.addEventListener('click', () => {
                    socket.close();
                    clearTimeout(timeout); 
                });
            }
        }
    };

    socket.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    leaveButton.onclick = function () {
        socket.close();
        navigateTo('/game-selection');
    };

    blockButton.onclick = function () {
        console.log("Block button clicked");
        blockInputContainer.style.display = 'block';
        unblockInputContainer.style.display = 'none'; 
    };

    confirmBlockButton.onclick = function () {
        const playerToBlock = blockPlayerInput.value.trim();
        if (playerToBlock) {
            socket.send(JSON.stringify({ action: 'block', player: playerToBlock }));
            blockInputContainer.style.display = 'none';
            blockPlayerInput.value = ''; 
        }
    };

    unblockButton.onclick = function () {
        console.log("Unblock button clicked");
        unblockInputContainer.style.display = 'block';
        blockInputContainer.style.display = 'none';
    };

    confirmUnblockButton.onclick = function () {
        const playerToUnblock = unblockPlayerInput.value.trim();
        if (playerToUnblock) {
            socket.send(JSON.stringify({ action: 'unblock', player: playerToUnblock }));
            unblockInputContainer.style.display = 'none';
            unblockPlayerInput.value = ''; 
        }
    };
    
    sendButton.onclick = function privateMessage() {
        let privacy;
        const message = messageInput.value.trim();
        if (message) {
            privacy = message[0] === '@' ? true : false;
            socket.send(JSON.stringify({ message: message, is_private: privacy }));
            messageInput.value = '';
        }
    };

    messageInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
    // Fechar a socket quando fechar a aba ou navegador.
    window.addEventListener('beforeunload', function (event) {
        socket.close();
        return;
    });

    document.getElementById('duel-button').addEventListener('click', function() {
        const duelContainer = document.getElementById('duel-input-container');
        
        // Toggle the visibility of the duel input container
        if (duelContainer.style.display === 'none') {
            duelContainer.style.display = 'block';
        } else {
            duelContainer.style.display = 'none';
        }
    });
    
    document.getElementById('confirm-duel-button').addEventListener('click', function() {
        const playerNickname = document.getElementById('duel-player-input').value;
    
        if (playerNickname) {
            console.log("players", playerNickname, nickname);
            if (playerNickname === nickname) {
                alert(`${translations[savedLanguage].yourselfMsg}`);
            }
            else{
                document.getElementById('duel-input-container').style.display = 'none'; // Hide after confirmation
                document.getElementById('duel-player-input').value = ''; // Clear input field
                
                let duel_message = '@' + playerNickname + `${translations[savedLanguage].fightMsg}`;
                
                socket.send(JSON.stringify({ action: 'duel', message: duel_message, is_private: true }));
            }

        } else {
            alert('Please enter a player nickname to duel.');
        }
    });    
    
    socket.onclose = function () {
        console.error("Chat socket was close"); //Debug
    };
};