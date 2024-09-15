import { navigateTo, checkLoginStatus } from '../utils.js'; 

export const liveChat = () => {
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    const nickname2 = sessionStorage.getItem('nickname');
    const nickname = nickname2.replace(/^"|"$/g, '');
    if (!jwttoken) {
        console.error("JWT Token is missing");
        return;
    }

    const socket = new WebSocket('ws://localhost:8000/ws/global_chat/');

    const app = document.getElementById('app');
    app.innerHTML = `
       
            <div class="chat">
            <div class="chat-header">
                <h2>CHAT</h2>
                <button id="leave-button" title="Leave"><i class="fas fa-sign-out-alt"></i></button>
            </div>
            <div class="chat-panel">
                <div id="chat-box" class="chat-box"></div>
                <div class="message-input-container">
                    <input id="message-input" type="text" placeholder="Type your message here...">
                    <div class="button-panel">
                        <button id="send-button"><i class="fas fa-paper-plane"></i></button>
                        <button id="block-button"><i class="fas fa-ban"></i></button>
                        <button id="unblock-button"><i class="fas fa-unlock"></i></button>
                        <button id="duel-button"><i class="fas fa-crossed-swords"></i> Duel</button> <!-- New Duel button -->
                    </div>
                </div>
                <div id="block-input-container" style="display: none;">
                    <input id="block-player-input" type="text" placeholder="Player to block...">
                    <button id="confirm-block-button" class="confirm-button">Confirm</button>
                </div>
                <div id="unblock-input-container" style="display: none;">
                    <input id="unblock-player-input" type="text" placeholder="Player to unblock...">
                    <button id="confirm-unblock-button" class="confirm-button" >Confirm</button>
                </div>
                <div id="duel-input-container" style="display: none;">
                    <input id="duel-player-input" type="text" placeholder="Player to duel...">
                    <button id="confirm-duel-button" class="confirm-button">Confirm</button>
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
        
        console.log('Data: ', data)
        
        const firstWord = data.message.split(' ')[0];
        const isOwnMessage = firstWord === nickname;
        
        addMessage(data.message, isOwnMessage);
        if (data.action == "duel")
        {
            const groupName = data.group_name;
            sessionStorage.setItem("groupName", groupName);

            const chatBox = document.getElementById('chat-box'); 
            const duelMessage = document.createElement('p');
            duelMessage.innerHTML = 
            `
            has challenged you to a duel! 
            <a href="http://localhost:8080/wait-remote" id="accept-link">Accept</a>
            `;

            chatBox.appendChild(duelMessage);
            if (user_json.id == data.from_user) {
                navigateTo(`/wait-remote`, groupName);
                socket.close();
            }
            
            const timeout = setTimeout(() => {
                duelMessage.innerHTML = 'You lost the invitation!';
            }, 10000); 
            
            if (user_json.id != data.from_user) {
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
                alert('You cannot challenge yourself to a duel.');
            }
            else{
                document.getElementById('duel-input-container').style.display = 'none'; // Hide after confirmation
                document.getElementById('duel-player-input').value = ''; // Clear input field
                
                let duel_message = '@' + playerNickname + ' wants to fight!';
                
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