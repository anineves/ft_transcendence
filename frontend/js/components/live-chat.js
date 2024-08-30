export const liveChat = () => {
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    if (!jwttoken) {
        console.error("JWT Token is missing");
        return;
    }

    const token = `Bearer ${jwttoken}`;
    console.log("Token:", token);
    const socket = new WebSocket(`ws://localhost:8000/ws/global_chat/?token=${encodeURIComponent(jwttoken)}`);

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="user-panel">
            <h2>CHAT</h2>
            <div class="chat-panel">
                <div id="chat-box" class="chat-box"></div>
                <div class="message-input-panel">
                    <input id="message-input" type="text" placeholder="Type your message here...">
                    <button id="send-button">Send</button>
                </div>
            </div>
        </div>
    `;

    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');


    const addMessage = (message, isOwnMessage) => {
        const messageElement = document.createElement('div');
        messageElement.className = isOwnMessage ? 'message own-message' : 'message';
        messageElement.textContent = `${isOwnMessage ? 'You: ' : 'Server: '}${message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; 
    };

    socket.onopen = function (event) {
        console.log("Connected to WebSocket");

        userNameElement.textContent = "User";
        avatarElement.src = "path/to/user/avatar.jpg";
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        addMessage(data.message, false);
    };

    socket.onerror = function (error) {
        console.error("WebSocket Error:", error);
    };

    sendButton.onclick = function () {
        const message = messageInput.value.trim();
        if (message) {

            socket.send(JSON.stringify({ message: message, is_private: false }));
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
