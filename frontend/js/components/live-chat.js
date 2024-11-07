import { navigateTo, checkLoginStatus } from '../utils.js'; 
import {  initializeTournament} from './tournament.js';
const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;
let socketChat;
let socketPong;
let socketSnake;

const translations = {
    english: {
        title: "Chat",
        phMsg: "Type your message here...", 
        lostInvMsg: "Lost invitation to duel",
        duelBtn: "Duel",
        phBlock: "Nickname to block...",
        confirmBtn: "Confirm",
        phUnblock: "Player to unblock...",
        phDuel: "Player to duel...",
        duelMsg: "has challenged you to a duel",
        acceptBtn: "Accept",
        fightMsg: " wants to fight!",
        yourselfMsg: "You cannot challenge yourself to a duel.",
        fillNickname: "Please enter a player nickname to duel.",
        findOpponent: "Find an opponent to Pong",
        findOpponentSnake: "Find an opponent to Snake",
        participatePong: "Participate in Pong game",
        participateSnake: "Participate in Snake game",

    },
    portuguese: {
        title: "Chat",
        phMsg: "Digite sua mensagem aqui...", 
        duelBtn: "Duelo",
        lostInvMsg: "Perdeu convite para Duelo",
        phBlock: "Apelido para bloquear...",
        confirmBtn: "Confirmar",
        phUnblock: "Jogador para desbloquear...",
        phDuel: "Jogador para duelar...",
        duelMsg: "desafiou você para um duelo",
        acceptBtn: "Aceitar",
        fightMsg: " quer lutar!",
        yourselfMsg: "Você não pode desafiar a si mesmo para um duelo.",
        fillNickname: "Por favor, insira um apelido de jogador para duelar.",
        findOpponent: "Encontre um Adversario Pong",
        findOpponentSnake: "Encontre um Adversario Snake",
        participatePong: "Participar em jogo Pong",
        participateSnake: "Participar em jogo Snake",
    },
    french: {
        title: "Chat",
        phMsg: "Tapez votre message ici...", 
        duelBtn: "Duel",
        lostInvMsg: "Invitation perdue au duel",
        phBlock: "Surnom à bloquer...",
        confirmBtn: "Confirmer",
        phUnblock: "Joueur à débloquer...",
        phDuel: "Joueur à défier...",
        duelMsg: "vous a défié à un duel",
        acceptBtn: "Accepter",
        fightMsg: " veut se battre!",
        yourselfMsg: "Vous ne pouvez pas vous défier vous-même à un duel.",
        fillNickname: "Veuillez entrer un surnom de joueur à défier.",
        findOpponent: "Trouvez un adversaire pour",
        findOpponentSnake: "Trouvez un adversaire pour",
        participatePong: "Participer au jeu Pong",
        participateSnake: "Participer au jeu Snake",
    }
};

export const liveChat = () => {
    sessionStorage.removeItem('participate');
    sessionStorage.removeItem('findOpponent');
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
    console.log('Chama no socket', socketChat);
    if(firstChat == 'true')
    {
        socketChat = new WebSocket(wssocket);
        sessionStorage.setItem('firtChat', 'false');
    }
    else {
        console.log("Mesma socket");
        if (!socketChat) {
            console.log("New socket");
            socketChat = new WebSocket(wssocket);
        }
    }
    
    
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
                <button id="create-tournament-button" class="create-button">${translations[savedLanguage].findOpponent}</button>
                <button id="participate-tournament-button" style="display:none;" class="create-button">${translations[savedLanguage].participatePong}</button>
                <button id="create-tournament-button-snake" class="create-button-snake">${translations[savedLanguage].findOpponentSnake}</button>
                <button id="participate-tournament-button-snake" style="display:none;" class="create-button-snake">${translations[savedLanguage].participateSnake}</button>
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
    let duelPong = document.getElementById('duel-button');
    let duelSnake = document.getElementById('duel-button-snake');
    let confirmPong = document.getElementById('confirm-duel-button');
    let confirmSnake = document.getElementById('confirm-duel-button-snake');
    errorliveChat.textContent = ''; 
    let participateButtonSnake = document.getElementById('participate-tournament-button-snake');
    let participateButton = document.getElementById('participate-tournament-button');
   
    const createTournamentButtonSnake = document.getElementById('create-tournament-button-snake');
    const wssocketSnake= `wss://${apiUri}/ws/tournament_snake/`
    if(!socketSnake)
    {
        socketSnake = new WebSocket(wssocketSnake);
        console.log("Entrei em !Socket Snake", socketSnake);
    }

    
    socketSnake.onopen = function (event) {
        socketSnake.send(JSON.stringify({
            Authorization: jwttoken,
        }));
    };
    
    createTournamentButtonSnake.addEventListener('click', function () {
        socketSnake.send(JSON.stringify({ action: 'create_tournament_snake' }));     
    });
    socketSnake.onmessage = function (event) {
        confirmPong = document.getElementById('confirm-duel-button');
        confirmSnake = document.getElementById('confirm-duel-button-snake');
        duelPong = document.getElementById('duel-button');
        duelSnake = document.getElementById('duel-button-snake');
        let groupName1 = sessionStorage.getItem("groupName");
        participateButtonSnake = document.getElementById('participate-tournament-button-snake');
        participateButton = document.getElementById('participate-tournament-button');
        const data = JSON.parse(event.data);
        if (data.action == 'created_tournament_snake') {
            if (sessionStorage.getItem("duelwait") != "true" && participateButtonSnake && participateButtonSnake.style.display == 'none' &&  participateButton && participateButton.style.display == 'none') 
            { 
                createTournamentButtonSnake.style.display = 'none';
                participateButtonSnake.style.display = 'block';
                participateButtonSnake.addEventListener('click', function () {
                    sessionStorage.setItem("participate", "true");
                    if(duelPong)
                        duelPong.style.display = 'none';
                    if(duelSnake)
                        duelSnake.style.display = 'none';
                    if(participateButton)
                        participateButton.style.display = 'none';
                    if(participateButtonSnake)
                        participateButtonSnake.style.display = 'none';
                    if(confirmPong)
                        confirmPong.style.display == 'none';
                    if(confirmSnake)
                        confirmSnake.style.display == 'none'
                    if(createTournamentButton)
                        createTournamentButton.style.display = "none"
                    socketSnake.send(JSON.stringify({ action: 'join_tournament_snake', player: { nickname: nickname , id: player} }));
                });
            }
        }
        if (data.action === 'tournament_full_snake' && !groupName1) {
            sessionStorage.setItem("participate", "false");
            sessionStorage.removeItem("participate");
            if(participateButton)
                participateButton.style.display = 'none';
            if(participateButtonSnake)
                participateButtonSnake.style.display = 'none';
            if(createTournamentButton)
                createTournamentButton.style.display = 'block';
            if(createTournamentButtonSnake)
                createTournamentButtonSnake.style.display= 'block';
            if(confirmPong)
                confirmPong.style.display = 'block';
            if(confirmSnake)
                confirmSnake.style.display = 'block'
            const playerIdArray = data.participants.map(participant => participant.id);
            sessionStorage.setItem('playersInfo', JSON.stringify(data.participants));
            sessionStorage.setItem('modality', 'remote');
            sessionStorage.setItem('friendID', playerIdArray[1]);
            sessionStorage.setItem('playerID', playerIdArray[0]);
            if(player == sessionStorage.getItem('playerID'))
                sessionStorage.setItem("Inviter", "True");
            else if((player == sessionStorage.getItem('friendID')))
                sessionStorage.setItem("Inviter", "False");
            sessionStorage.setItem('game', "snake");
            if(player == sessionStorage.getItem('playerID') || player == sessionStorage.getItem('friendID'))
            {
                sessionStorage.setItem('findOpponent', 'true');
                navigateTo('/snake');
            }
        }
    };

    socketSnake.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };
    
    socketSnake.onclose = function () {
        console.error("SocketSnake was closed!");
        socketSnake = null;     
    };


    const createTournamentButton = document.getElementById('create-tournament-button');
    const wssocketPong= `wss://${apiUri}/ws/tournament/`
    if(!socketPong)
        socketPong = new WebSocket(wssocketPong);
    
    socketPong.onopen = function (event) {
        socketPong.send(JSON.stringify({
            Authorization: jwttoken,
        }));
    };
    
    createTournamentButton.addEventListener('click', function () {
        socketPong.send(JSON.stringify({ action: 'create_tournament' }));
    });

    socketPong.onmessage = function (event) {
        confirmPong = document.getElementById('confirm-duel-button');
        confirmSnake = document.getElementById('confirm-duel-button-snake');
        duelPong = document.getElementById('duel-button');
        duelSnake = document.getElementById('duel-button-snake');
        let groupName1 = sessionStorage.getItem("groupName");
        participateButtonSnake = document.getElementById('participate-tournament-button-snake');
        participateButton = document.getElementById('participate-tournament-button');

        const data = JSON.parse(event.data);
        if (data.action == 'created_tournament') {
            if (sessionStorage.getItem("duelwait") != "true" && participateButtonSnake && participateButtonSnake.style.display == 'none' &&  participateButton && participateButton.style.display == 'none') 
            { 
                createTournamentButton.style.display = 'none';
                participateButton.style.display = 'block';
                participateButton.addEventListener('click', function () {
                    sessionStorage.setItem("participate", "true");
                    if(duelPong)
                        duelPong.style.display = 'none';
                    if(duelSnake)
                        duelSnake.style.display = 'none';
                    if(participateButton)
                        participateButton.style.display = 'none';
                    if(participateButtonSnake)
                        participateButtonSnake.style.display = 'none';
                    if(createTournamentButtonSnake)
                        createTournamentButtonSnake.style.display = "none";
                    if(confirmPong)
                        confirmPong.style.display = 'none';
                    if(confirmSnake)
                        confirmSnake.style.display = 'none'
                    socketPong.send(JSON.stringify({ action: 'join_tournament', player: { nickname: nickname , id: player} }));
                });
            }
        }
    
    
        console.log("Group pong:", groupName1);
        if (data.action === 'tournament_full' && !groupName1) {
            sessionStorage.setItem("participate", "false");
            sessionStorage.removeItem("participate");
            if(participateButton)
                participateButton.style.display = 'none';
            if(participateButtonSnake)
                participateButtonSnake.style.display = 'none';
            if(createTournamentButton)
                createTournamentButton.style.display = 'block';
            if(createTournamentButtonSnake)
                createTournamentButtonSnake.style.display= 'block';
            if(confirmPong)
                confirmPong.style.display == 'block';
            if(confirmSnake)
                confirmSnake.style.display == 'block';
            const playerIdArray = data.participants.map(participant => participant.id);
            sessionStorage.setItem('playersInfo', JSON.stringify(data.participants));
            sessionStorage.setItem('modality', 'remote');
            sessionStorage.setItem('findOpponent', 'true');
            sessionStorage.setItem('friendID', playerIdArray[1]);
            sessionStorage.setItem('playerID', playerIdArray[0]);
            if(player == sessionStorage.getItem('playerID'))
                sessionStorage.setItem("Inviter", "True");
            else if((player == sessionStorage.getItem('friendID')))
                sessionStorage.setItem("Inviter", "False");
            sessionStorage.setItem('game', "pong");
            if(player == sessionStorage.getItem('playerID') || player == sessionStorage.getItem('friendID'))
            {
                navigateTo('/pong');
            }
        }
       
    };

    socketPong.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    socketPong.onclose = function () {
        console.error("SocketPong was closed!");
        socketPong = null;
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
                    }
                } else {
                    //console.log("Error loading players");
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

    socketChat.onopen = function (event) {
        socketChat.send(JSON.stringify({
            Authorization: jwttoken,
        }));
        console.log("Authorizing -> ", socketChat)
    };
  
    socketChat.onmessage = function (event) {
        console.log("Event:", event);
        let confPong = document.getElementById('duel-input-container');
        let confSnake = document.getElementById('duel-input-container-snake');
        const data = JSON.parse(event.data);
        const message = data.message
        const firstWord = message.content.split(' ')[0];
        const isOwnMessage = firstWord === nickname;
        sessionStorage.removeItem("groupName");
        addMessage(message.content, isOwnMessage);
        if ((data.action == "duel" || data.action == "duel-snake"))
            {
            sessionStorage.setItem("duelwait", "true");
            let groupName = message.group_name;
            const chatBox = document.getElementById('chat-box'); 
            const existingDuelMessage = document.getElementById('duel-message');
            if (existingDuelMessage) {
                chatBox.removeChild(existingDuelMessage);
            }
            
            const duelMessage = document.createElement('p');
            duelMessage.id = 'duel-message';
            const acceptButton = document.createElement('button');
            acceptButton.id = 'accept-link';
            if(sessionStorage.getItem("participate") != "true")
            {
                console.log("mandar convit2")
                acceptButton.innerText = translations[savedLanguage].acceptBtn;
                duelMessage.innerHTML = `${translations[savedLanguage].duelMsg} `;
                duelMessage.appendChild(acceptButton);
            }
            chatBox.appendChild(duelMessage);
            chatBox.scrollTop = chatBox.scrollHeight; 
            createTournamentButton.style.display = 'none';
            createTournamentButtonSnake.style.display = 'none';
            participateButton.style.display = 'none';
            participateButtonSnake.style.display = 'none';
            duelPong.style.display = 'none';
            duelSnake.style.display = 'none';
            if(confPong.style.display != 'none')
                confPong.style.display = 'none';
            if(confSnake.style.display != 'none')
                confSnake.style.display = 'none'
            if(data.action == "duel-snake")
                sessionStorage.setItem("duelGame", "duel-snake");
            if(data.action == "duel")
                sessionStorage.setItem("duelGame", "duel-pong");
            chatBox.appendChild(duelMessage);
            if (user_json.id == message.from_user) {
                console.log("aqiii")
                sessionStorage.setItem("groupName", groupName);
                sessionStorage.setItem("Inviter", "True");
                navigateTo(`/wait-remote`, sessionStorage.getItem("groupName"));
                //socketChat.close();
            }
            const timeout = setTimeout(() => {
                duelMessage.innerHTML = `${translations[savedLanguage].lostInvMsg}`;
                if(duelPong)
                    duelPong.style.display = 'block';
                if(duelSnake)
                    duelSnake.style.display = 'block';
                if(createTournamentButton)
                    createTournamentButton.style.display = 'block';
                if(createTournamentButtonSnake)
                    createTournamentButtonSnake.style.display = 'block';
                sessionStorage.removeItem("duelwait");
            }, 10000); 
            
            if (user_json.id != message.from_user) {
                acceptButton.addEventListener('click', () => {
                    sessionStorage.setItem("Inviter", "False");
                    sessionStorage.setItem('modality', 'remote');
                    sessionStorage.setItem("groupName", groupName);
                    clearTimeout(timeout);
                    navigateTo(`/wait-remote`, sessionStorage.getItem("groupName"));
                    //socketChat.close();
                });
            }
        }
    };

    socketChat.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    socketChat.onclose = function () {
        console.error("socketChat was closed");
        socketChat = null;
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
            socketChat.send(JSON.stringify({ action: 'block', player: playerToBlock }));
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
            socketChat.send(JSON.stringify({ action: 'unblock', player: playerToUnblock }));
            unblockInputContainer.style.display = 'none';
            unblockPlayerInput.value = ''; 
        }
    };
    
    sendButton.onclick = function privateMessage() {
        let privacy;
        const message = messageInput.value.trim();
        if (message) {
            privacy = message[0] === '@' ? true : false;
            socketChat.send(JSON.stringify({ message: message, is_private: privacy }));
            messageInput.value = '';
        }
    };

    messageInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    /*window.addEventListener('beforeunload', function (event) {
        socketChat.close();
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
                
                socketChat.send(JSON.stringify({ action: 'duel', message: duel_message, is_private: true }));
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
                console.log("aquiiiiiiiiiii");
                socketChat.send(JSON.stringify({ action: 'duel-snake', message: duel_message, is_private: true }));
            }
    
        } else {
            errorliveChat.textContent= `${translations[savedLanguage].fillNickname}`
        }
    });    
    
    
};

export const closeSocket = () => {
    if(socketChat)
        socketChat.close();
    if(socketPong)
        socketPong.close();
    if(socketSnake)
        socketSnake.close();
}