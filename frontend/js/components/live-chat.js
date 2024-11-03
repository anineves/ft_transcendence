import { navigateTo, checkLoginStatus } from '../utils.js'; 
import {  initializeTournament} from './tournament.js';
const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;
let socket;


export const liveChat = () => {
    sessionStorage.setItem('giveUPtr', 'false')
    sessionStorage.setItem("pongGame", "false");
    sessionStorage.setItem("snakeGame", "false");
    const player = sessionStorage.getItem('player');
    if(!player){
        navigateTo('/create-player');
        return;
    }
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    const nickname2 = sessionStorage.getItem('nickname');
    const nickname = nickname2.replace(/^"|"$/g, '');
    if (!jwttoken) {
        console.log("JWT Token is missing");
        return;
    }

    const wssocket= `wss://${apiUri}/ws/global_chat/`
    let firstChat = sessionStorage.getItem('firtChat');
    if(firstChat == 'true')
    {
        socket = new WebSocket(wssocket);
        sessionStorage.setItem('firtChat', 'false');
    }
    else {
        if (!socket) {
         socket = new WebSocket(wssocket);
        }
    }
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
       
            <div id="app">
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
                </div>
            </div>
            <div class="duel-tournament-panel">
                <button id="duel-button"><i class="fas fa-crossed-swords"></i> ${translations[savedLanguage].duelBtn}</button>
                <button id="duel-button-snake"><i class="fas fa-crossed-swords"></i> ${translations[savedLanguage].duelBtn} Snake</button>
                <button id="create-tournament-button" class="create-button">Create a Tournament Pong</button>
                <button id="create-tournament-button-snake" class="create-button-snake">Create a Tournament Snake</button>
            </div>
            <div id="block-input-container" style="display: none;">
                <input id="block-player-input" type="text" placeholder="${translations[savedLanguage].phBlock}...">
                <button id="confirm-block-button" class="confirm-button">${translations[savedLanguage].confirmBtn}</button>
            </div>

            <div id="unblock-input-container" style="display: none;">
                <input id="unblock-player-input" type="text" placeholder="${translations[savedLanguage].phUnblock}...">
                <button id="confirm-unblock-button" class="confirm-button">${translations[savedLanguage].confirmBtn}</button>
            </div>

            <div id="duel-input-container" style="display: none;">
                <input id="duel-player-input" type="text" placeholder="${translations[savedLanguage].duelBtn}...">
                <button id="confirm-duel-button" class="confirm-button">${translations[savedLanguage].confirmBtn}</button>
            </div>

            <div id="duel-input-container-snake" style="display: none;">
                <input id="duel-player-input-snake" type="text" placeholder="${translations[savedLanguage].duelBtn}Snake...">
                <button id="confirm-duel-button-snake" class="confirm-button">${translations[savedLanguage].confirmBtn}</button>
            </div>
        </div>
        <div id="errorChat" class="error-message" style="color:red; font-size: 0.9em;"></div> 
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
    const errorliveChat = document.getElementById('errorChat');
    errorliveChat.textContent = ''; 



    const createTournamentButtonSnake = document.getElementById('create-tournament-button-snake');
    const wssocket3= `wss://${apiUri}/ws/tournament_snake/`
    const socket3 = new WebSocket(wssocket3);
    createTournamentButtonSnake.addEventListener('click', function () {
        socket3.send(JSON.stringify({ action: 'create_tournament_snake' }));       
    });

    socket3.onopen = function (event) {
        
    };

    socket3.onmessage = function (event) {
        const data = JSON.parse(event.data);
        let participateButtonSnake = document.getElementById('participate-tournament-button-snake');
        if (!participateButtonSnake) 
        { 
            participateButtonSnake = document.createElement('button');
            participateButtonSnake.innerText = 'Participate in Tournament Snake';
            participateButtonSnake.id = 'participate-tournament-button-snake';
            document.body.appendChild(participateButtonSnake);
            participateButtonSnake.addEventListener('click', function () {
                socket3.send(JSON.stringify({ action: 'join_tournament_snake', player: { nickname: nickname , id: player} }));
            });
        }
    
        if (data.action === 'tournament_full_snake') {
            document.body.removeChild(participateButtonSnake);
            const playerNames = data.participants.map(participant => participant.nickname);
            sessionStorage.setItem('playerNames', JSON.stringify(playerNames));
            sessionStorage.setItem('playersInfo', JSON.stringify(data.participants));
            sessionStorage.setItem('modality', 'tourn-remote');
            sessionStorage.setItem('lastPlayer', playerNames[3]);
            sessionStorage.setItem('game', "snake");
            initializeTournament();
        }
    };

    socket3.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    socket3.onclose = function () {
        //console.log("Tournament socket was closed");
    };


    const createTournamentButton = document.getElementById('create-tournament-button');
    const wssocket2= `wss://${apiUri}/ws/tournament/`
    const socket2 = new WebSocket(wssocket2);
    createTournamentButton.addEventListener('click', function () {
        socket2.send(JSON.stringify({ action: 'create_tournament' }));
    });

    socket2.onopen = function (event) {
        //console.log("Connected to tournament WebSocket");
    };

    socket2.onmessage = function (event) {
        const data = JSON.parse(event.data);
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
            document.body.removeChild(participateButton);
            const playerNames = data.participants.map(participant => participant.nickname);
            sessionStorage.setItem('playerNames', JSON.stringify(playerNames));
            sessionStorage.setItem('playersInfo', JSON.stringify(data.participants));
            sessionStorage.setItem('modality', 'tourn-remote');
            sessionStorage.setItem('lastPlayer', playerNames[3]);
            sessionStorage.setItem('game', "pong");
            initializeTournament();
        }
    };

    socket2.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    socket2.onclose = function () {
        //console.log("Tournament socket was closed");
    };
    


    const addMessage = (message, isOwnMessage) => {
        const messageElement = document.createElement('div');
        const words = message.split(' ');
        const firstWord2 = words[0];
        const restOfMessage = words.slice(1).join(' ');

        const firstWord = firstWord2.replace(':', '');
        const isFromSelf = firstWord == nickname;

        messageElement.className = isFromSelf ? 'message own-message' : 'message other-message';

        const firstWordButton = document.createElement('button');
        firstWordButton.className = 'highlighted-player-button';
        firstWordButton.textContent = firstWord;
        firstWordButton.onclick = async () => {
            const urlPlayers = `${apiUrl}/api/players/`;
            try {
                const playerResponse = await fetch(urlPlayers, {
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
                        sessionStorage.setItem('playerProfile', JSON.stringify(player));
                        navigateTo('/player-profile');
                    } else {
                        //console.log("Player not found");
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
        socket.send(JSON.stringify({
            Authorization: jwttoken,
        }));
    };
  
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const message = data.message
        const firstWord = message.content.split(' ')[0];
        const isOwnMessage = firstWord === nickname;
        
        addMessage(message.content, isOwnMessage);
        if (data.action == "duel" || data.action == "duel-snake")
        {
            let groupName = message.group_name;
            sessionStorage.setItem("groupName", groupName);
            const chatBox = document.getElementById('chat-box'); 
            const existingDuelMessage = document.getElementById('duel-message');
            if (existingDuelMessage) {
                chatBox.removeChild(existingDuelMessage);
            }
            
            const duelMessage = document.createElement('p');
            duelMessage.id = 'duel-message';
            const acceptButton = document.createElement('button');
            acceptButton.id = 'accept-link';
            acceptButton.innerText = translations[savedLanguage].acceptBtn;
            duelMessage.innerHTML = `${translations[savedLanguage].duelMsg} `;
            duelMessage.appendChild(acceptButton);
            chatBox.appendChild(duelMessage);
            chatBox.scrollTop = chatBox.scrollHeight; 
            if(data.action == "duel-snake")
                sessionStorage.setItem("duelGame", "duel-snake");
            if(data.action == "duel")
                sessionStorage.setItem("duelGame", "duel-pong");
            chatBox.appendChild(duelMessage);
            if (user_json.id == message.from_user) {
                sessionStorage.setItem("Inviter", "True");
                navigateTo(`/wait-remote`, sessionStorage.getItem("groupName"));
              
            }
            const timeout = setTimeout(() => {
                duelMessage.innerHTML = `${translations[savedLanguage].duelBtn}`;
            }, 50000); 
            
            if (user_json.id != message.from_user) {
                sessionStorage.setItem("Inviter", "False");
                sessionStorage.setItem('modality', 'remote');
                acceptButton.addEventListener('click', () => {
                    clearTimeout(timeout); // Cancela o timeout
                    navigateTo(`/wait-remote`, sessionStorage.getItem("groupName"));
                });
            }
        }
    };

    socket.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    socket.onclose = function () {
    
    };

    leaveButton.onclick = function () {
        navigateTo('/game-selection');
    };

    blockButton.onclick = function () {
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

    /*window.addEventListener('beforeunload', function (event) {
        socket.close();
        return;
    });*/

    document.getElementById('duel-button').addEventListener('click', function() {
        const duelContainer = document.getElementById('duel-input-container');
        if (duelContainer.style.display === 'none') 
            duelContainer.style.display = 'block';
        else 
            duelContainer.style.display = 'none';
    });

    document.getElementById('duel-button-snake').addEventListener('click', function() {
        const duelContainer = document.getElementById('duel-input-container-snake');
        
        
        if (duelContainer.style.display === 'none') 
            duelContainer.style.display = 'block';
         else 
            duelContainer.style.display = 'none';
    });
    
    document.getElementById('confirm-duel-button').addEventListener('click', function() {
        const playerNickname = document.getElementById('duel-player-input').value;
        sessionStorage.setItem("duelGame", "duel-pong");
    
        if (playerNickname) {
            if (playerNickname === nickname) {
                errorliveChat.textContent = `${translations[savedLanguage].yourselfMsg}`;
            }
            else{
                document.getElementById('duel-input-container').style.display = 'none'; 
                document.getElementById('duel-player-input').value = ''; 
                
                let duel_message = '@' + playerNickname + `${translations[savedLanguage].fightMsg}`;
                
                socket.send(JSON.stringify({ action: 'duel', message: duel_message, is_private: true }));
            }
        } else {
            errorliveChat.textContent= `${translations[savedLanguage].fillNickname}`
        }
    });    

    
    document.getElementById('confirm-duel-button-snake').addEventListener('click', function() {
        const playerNickname = document.getElementById('duel-player-input-snake').value;
        sessionStorage.setItem("duelGame", "duel-snake");
    
        if (playerNickname) {
            if (playerNickname === nickname) {
                errorliveChat.textContent = `${translations[savedLanguage].yourselfMsg}`;
            }
            else{
                document.getElementById('duel-input-container-snake').style.display = 'none'; 
                document.getElementById('duel-player-input-snake').value = ''; 
                
                let duel_message = '@' + playerNickname + `${translations[savedLanguage].fightMsg}`;
                
                socket.send(JSON.stringify({ action: 'duel-snake', message: duel_message, is_private: true }));
            }
    
        } else {
            errorliveChat.textContent= `${translations[savedLanguage].fillNickname}`
        }
    });    
    
    
};

export const closeSocket = () => {
    socket.close();
}