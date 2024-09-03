import { navigateTo, checkLoginStatus } from '../utils.js';

export const renderLogin = () => {
    // Obtem a app onde o formulário de login será inserido.
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="background-form" id="form-login">
            <h2>Login</h2>
            <form id="loginForm">
                <input type="text" id="emailOrUsername" placeholder="Email or Username" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <button type="submit" id="btn-login" class="btn">Submit</button>
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
            const response = await fetch('http://127.0.0.1:8000/api/otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailOrUsername, password })
            });

            if (response.ok) {
                showCodeForm(emailOrUsername, password);
            } else {
                alert('Failed to send verification code.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });
};


const showCodeForm = (emailOrUsername, password) => {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="background-form" id="form-login">
            <h2>Verification</h2>
            <form id="codeForm">
                <p>Verification code sent successfully.</p>
                <input type="text" id="code" placeholder="Enter verification code" required class="form-control mb-2">
                <button type="submit" id="btn-code" class="btn">Submit</button>
            </form>
        </div>
    `;

    document.getElementById('codeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('code').value;

        try {
            const tokenResponse = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailOrUsername, password, otp })
            });

            if (tokenResponse.ok) {
                const data = await tokenResponse.json();
                sessionStorage.setItem('jwtToken', data.access);
                sessionStorage.setItem('refreshToken', data.refresh);
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('userID', JSON.stringify(data.user.id));
                handleSuccessfulLogin();
                checkLoginStatus();
            } else {
                const errorData = await tokenResponse.json();
                alert('Logiin failed: ' + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during code verification');
        }
    });
};


const handleSuccessfulLogin = async () => {
    
const jwtToken = sessionStorage.getItem('jwtToken');
const user = sessionStorage.getItem('user');
const userID = sessionStorage.getItem('userID');
alert("handle");
    try {
        const playerResponse = await fetch('http://127.0.0.1:8000/api/players/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (playerResponse.ok) {
            const playerData = await playerResponse.json();
            console.log("-----------------------------------------------------------")
            console.log(playerData)
            console.log("-----------------------------------------------------------")
            console.log(user)
            console.log(userID);
            const player = playerData.find(p => p.user === userID);

            if (player) {
                
                sessionStorage.setItem('player', player.id);
                sessionStorage.setItem('nickname', player.nickname);
                checkLoginStatus();
                putPlayer();
            } else {
                console.log("You need to create a player");
                navigateTo('/game-selection');
            }
        } else {
            console.log("Error loading players");
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


const putPlayer = async ()  =>
{
    const jwtToken = sessionStorage.getItem('jwtToken');
    const user = sessionStorage.getItem('user');
    const playerId = sessionStorage.getItem('player');
    console.log("Player", playerId);
    const stat = "online";

    try {
        const player = await fetch(`http://127.0.0.1:8000/api/${playerId}`,  {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({stat})
        });

        if (player.ok) 
        {
            const playerT = await player.json();
            console.log(playerT)
                
                checkLoginStatus();
                navigateTo('/game-selection');
          
        } else {
            alert("Player not found");
            console.log("Error player not found");
        }
    } catch (error) {
        console.error('Error:', error);
    }

};
