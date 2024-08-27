import { navigateTo, checkLoginStatus } from '../utils.js';
export const renderLogin = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="background-form" id="form-login">
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="emailOrUsername" placeholder="Email or Username" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <button type="submit" id="btn-login"class="btn">Submit</button>
            </form>
            <div id="presence"><span class="tag is-success" id="pre_cnt">0</span> users online</div>
            <ul id="messages"></ul>
            <div class="box">
                <h1 class="title">Online Users</h1>
                <div id="online-users"></div>
            </div>
        </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailOrUsername = document.getElementById('emailOrUsername').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailOrUsername, password })
            });
            const data = await response.json();
            if (response.ok) {
                // Inicia a conexão WebSocket após o login bem-sucedido
                // initWebSocket();
                localStorage.setItem('register', 'form');
                // Armazena o token de acesso JWT.
                localStorage.setItem('jwtToken', data.access); 
                // Armazena o token de atualização JWT.
                localStorage.setItem('refreshToken', data.refresh); 
                // Armazena as informações do usuário (por exemplo, nome, email).
                localStorage.setItem('user', JSON.stringify(data.user)); 
                checkLoginStatus(); 
                navigateTo('/game-selection', data); 
            } else {
                alert('Login failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });
    // const initWebSocket = () => {
    //     const ws = new WebSocket('ws://localhost:8000/ws/presence/pong/');
    //     const presenceEl = document.getElementById('pre_cnt');
    //     const messagesEl = document.getElementById('messages');
    //     const onlineUsers = document.getElementById("online-users");
    //     ws.onmessage = (event) => {
    //         onlineUsers.innerHTML = "";
    //         console.log(event);
    //         let data = JSON.parse(event.data);
    //         presenceEl.innerHTML = data.online;
    //         const li1 = document.createElement('li');
    //         li1.innerHTML = data.msg;
    //         messagesEl.appendChild(li1);
    //         data.users.forEach(user => {
    //             const li2 = document.createElement("li");
    //             li2.classList.add("on-us");
    //             li2.innerHTML = `${user.username} (ID: ${user.id})`;
    //             onlineUsers.appendChild(li2);
    //         });
    //     };
    // };
    // // Inicia o WebSocket na primeira carga da página (antes do login)
    // initWebSocket();
};