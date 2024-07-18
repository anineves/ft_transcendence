//para cchamar a funcao render quando a DOM e carregada
document.addEventListener('DOMContentLoaded', () => {
    render();
});

const app = document.getElementById('app');

const renderMenu = () => {
    app.innerHTML = `
        <div class="menu">
            <h1>FT TRANSCENDENCE</h1>
            <h2>Welcome to the Django</h2>
            <div class="btn-container">
                <button id="startGameBtn" class="btn">
                    <img src="../../assets/play.png" alt="Pong" class="button-image">
                </button>
                <button id="loginBtn" class="btn">Login</button>
                 <button id="registerBtn" class="btn">Register</button>
            </div>
        </div>
    `;
    document.getElementById('startGameBtn').addEventListener('click', () => navigateTo('/game-selection'));
    document.getElementById('loginBtn').addEventListener('click', () => navigateTo('/login'));
    document.getElementById('registerBtn').addEventListener('click', () => navigateTo('/register'));
};




const renderLogin = () => {
    app.innerHTML = `
        <div class="login">
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <button type="submit" class="btn">Login</button>
            </form>
        </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        navigateTo('/game-selection');
    });
};


const renderRegister = () => {
    app.innerHTML = `
        <div class="register">
            <h2>Register</h2>
            <form id="registerForm">
                <input type="text" id="username" placeholder="Username" required class="form-control mb-2">
                <input type="email" id="email" placeholder="Email" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <button type="submit" class="btn">Register</button>
            </form>
        </div>
    `;

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, email, password})
            });

            const data = await response.json();
            if (response.status === 201) {
                alert('User registered successfully!');
                navigateTo('/login');
            } else {
                alert('Registration failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration');
        }
    });
};


const renderGameSelection = () => {
    app.innerHTML = `
         <div class="game-selection">
                    <h2>Select Game</h2>
                    <div class="btn-container">
                        <button id="pongBtn" class="btn">Pong</button>
                        <button id="4LineBtn" class="btn">4 in a Line</button>
                    </div>
                </div>
            `;
    document.getElementById('pongBtn').addEventListener('click', () => navigateTo('/pong'));
    document.getElementById('4LineBtn').addEventListener('click', () => navigateTo('/4line'));
};

//TV
/*
const renderPong = () => {
    app.innerHTML = `
        <div class="tv-container">
            <canvas id="pongCanvas" width="800" height="600"></canvas>
            </div>`;
    startPongGame();
};*/


//Arcade

const renderPong = () => {
    app.innerHTML = `
        <div class="arcade-container">
            <div class="arcade-screen">
                <h2 class="arcade-title">PONG</h2>
                <canvas id="pongCanvas" width="600" height="400"></canvas>
            </div>
            <div class="arcade-controls">
                <div class="arcade-joystick"></div>
                <div class="arcade-button" style="background:red;"></div>
                <div class="arcade-button" style="background:green;"></div>
                <div class="arcade-button" style="background:blue;"></div>
            </div>
        </div>
    `;
    startPongGame();
};

const render4line = () => {
    app.innerHTML = `
        <div class="arcade-container">
            <div class="arcade-screen">
                <div id="4line"></div>
            </div>
            <div class="arcade-controls">
                <div class="arcade-joystick"></div>
                <div class="arcade-button" style="background:red;"></div>
                <div class="arcade-button" style="background:green;"></div>
                <div class="arcade-button" style="background:blue;"></div>
            </div>
        </div>
    `;
    start4LineGame();
};


const routes = {
    '/': renderMenu,
    '/login': renderLogin,
    '/game-selection': renderGameSelection,
    '/pong': renderPong,
    '/4line': render4line,
    '/register': renderRegister,
};

const navigateTo = (path) => {
    window.history.pushState({}, path, window.location.origin + path);
    render();
};

const render = () => {
    const path = window.location.pathname;
    const route = routes[path] || renderMenu;
    route();
};



//para usar os botoes de avancar e retroceder no navegador
window.onpopstate = render;

