import { navigateTo, checkLoginStatus } from '../utils.js'; 

export const renderLogin = () => {
  
    const translations = {
        english: {
            login: "Login",
            email: "Email or Username",
            password: "Password",
            submit: "Login",
            submit2: "Login using 2FA",
        },
        portuguese: {
            login: "Entrar",
            email: "Email ou Nome de Usuário",
            password: "Palavra passe",
            submit: "Entrar",
            submit2: "Entrar com 2FA",
            guest: "Jogar como Convidado",
        },
        french: {
            login: "Se connecter",
            email: "Email ou Nom d'utilisateur",
            password: "Mot de passe",
            submit: "Entrer",
            submit2: "Entrer avec 2FA",
            guest: "Jouer en tant qu'invité",
        }
        
    };
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;
    app.innerHTML = `
        <div class="background-form" id="loginForm" class="form-log-reg">
            <h2>${translations[savedLanguage].login}</h2>
            <form >
                <input type="text" id="emailOrUsername" placeholder="${translations[savedLanguage].email}}" required class="form-control mb-2">
                <input type="password" id="password" placeholder="${translations[savedLanguage].password}" required class="form-control mb-2">
                <button type="submit" id="btn-login"class="btn">${translations[savedLanguage].submit}</button>
            </form>
            <form id="loginForm2f">
               <input type="text" id="emailOrUsername2" placeholder="${translations[savedLanguage].email}" required class="form-control mb-2">
                <input type="password" id="password2" placeholder="${translations[savedLanguage].password}" required class="form-control mb-2">
                <button type="submit" id="btn-login2f"class="btn">${translations[savedLanguage].submit2}</button>
            </form>
        </div>
    `;

    // Adiciona um listener para o evento de submissão do formulário de login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        // Previne o comportamento padrão do formulário de recarregar a página.
        e.preventDefault(); 
        const emailOrUsername = document.getElementById('emailOrUsername').value; 
        const password = document.getElementById('password').value; 
        

        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                // Define o método de requisição HTTP como POST.
                method: 'POST', 
                // Define o cabeçalho da requisição indicando que o conteúdo é JSON.
                headers: {
                    'Content-Type': 'application/json'
                },
                // Converte o corpo da requisição para uma string JSON contendo email e senha.
                body: JSON.stringify({ email: emailOrUsername, password }) 
            });

            // Converte a resposta da API em um objeto JSON.
            const data = await response.json(); 
            // Se a resposta for bem-sucedida (status 200), armazena os tokens JWT e dados do usuário.
            if (response.ok) {
                sessionStorage.setItem('register', 'form');
                // Armazena o token de acesso JWT.
                sessionStorage.setItem('jwtToken', data.access); 
                // Armazena o token de atualização JWT.
                sessionStorage.setItem('refreshToken', data.refresh); 
                // Armazena as informações do usuário (por exemplo, nome, email).
                sessionStorage.setItem('user', JSON.stringify(data.user)); 

                //console.log(data);
                const userId = data.user.id;
                const token = data.access;
                try {

                    const playerResponse = await fetch('http://127.0.0.1:8000/api/players/', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        }
                    });
            
                    if (playerResponse.ok) {
                        const playerData = await playerResponse.json();
                        const player = playerData.find(p => p.user === userId);
                        
                        if (player) {
                            sessionStorage.setItem('player', JSON.stringify(player.id));
                            sessionStorage.setItem('playerInfo', JSON.stringify(player));
                            sessionStorage.setItem('nickname', JSON.stringify(player.nickname));
                            putPlayer("ON");
                        } else {
                            console.log("You need create a player");
                        }
                    } else {
                        console.error("error loading players");
                    }
                } catch (error) {
                    console.error('Error', error);
                }
            
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

    /*document.getElementById('loginForm2f').addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailOrUsername = document.getElementById('emailOrUsername2').value;
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
    });*/

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


            let player = null;

            for (const p of playerData) {
              

                if (p.user == userID) {
    
                    player = p;
                }
            }

            if (player) {
                sessionStorage.setItem('player', player.id);
                sessionStorage.setItem('nickname', player.nickname);
                checkLoginStatus();
                putPlayer("ON");
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


export const putPlayer = async (status) => {
    const jwtToken = sessionStorage.getItem('jwtToken');
    const user = sessionStorage.getItem('user');
    const playerId = sessionStorage.getItem('player');
    //console.log("Player", playerId);
    //console.log("Status", status)
    const stat = status;
    try {
        const player = await fetch(`http://127.0.0.1:8000/api/player/${playerId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status : stat })
        });
      
        if (player.ok) {
            const playerT = await player.json();
            sessionStorage.setItem('playerStatus', playerT.status);
            checkLoginStatus();
            navigateTo('/game-selection');

        } else if (user) {
            alert("Player not found");
            console.log("Error player not found");
        }
    } catch (error) {
        console.error('Error:', error);
    }

};