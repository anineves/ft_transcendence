import { navigateTo } from '../utils.js';

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
            <h2>CHAT</h2>
            <div class="chat-panel">
                <div id="chat-box" class="chat-box"></div>
                <div class="message-input-panel">
                    <input id="message-input" type="text" placeholder="Type your message here...">
                    <button id="send-button">Sende</button>
                    </div>
                <div>
                    <button id="leave-button">Leave</button>
                </div>
            </div>
        </div>
    `;

    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const leaveButton = document.getElementById('leave-button');

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
