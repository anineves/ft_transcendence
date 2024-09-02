import { navigateTo, checkLoginStatus } from '../utils.js'; 

export const liveChat = () => {
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    if (!jwttoken) {
        console.error("JWT Token is missing");
        return;
    }

    const socket = new WebSocket('ws://localhost:8000/ws/global_chat/');

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="user-panel">
            <div class="chat-header">
                <h2>CHAT</h2>
                <button id="leave-button" title="Leave"><i class="fas fa-sign-out-alt"></i></button>
            </div>
            <div class="chat-panel">
                <div id="chat-box" class="chat-box"></div>
                <div class="message-input-container">
                    <input id="message-input" type="text" placeholder="Type your message here...">
                    <div class="button-panel">
                        <button id="send-button"><i class="fas fa-paper-plane"></i> Send</button>
                        <button id="block-button"><i class="fas fa-ban"></i> Block</button>
                        <button id="unblock-button"><i class="fas fa-unlock"></i> Unblock</button>
                    </div>
                </div>
                <div id="block-input-container" style="display: none;">
                    <input id="block-player-input" type="text" placeholder="Player to block...">
                    <button id="confirm-block-button">Confirm Block</button>
                </div>
                <div id="unblock-input-container" style="display: none;">
                    <input id="unblock-player-input" type="text" placeholder="Player to unblock...">
                    <button id="confirm-unblock-button">Confirm Unblock</button>
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
        messageElement.className = isOwnMessage ? 'message own-message' : 'message other-message';
        messageElement.textContent = `${isOwnMessage ? 'You: ' : 'Server: '}${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; 
    };

    socket.onopen = function (event) {
        console.log("Connected to WebSocket");
        socket.send(JSON.stringify({
            Authorization: jwttoken,
        }));
    };
  
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        addMessage(data.message, false); 
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
    
    sendButton.onclick = function () {
        let privacy;
        const message = messageInput.value.trim();
        if (message) {
            privacy = message[0] === '@' ? true : false;
            socket.send(JSON.stringify({ message: message, is_private: privacy }));
            addMessage(message, true); 
            messageInput.value = '';
        }
    };

    messageInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
};
