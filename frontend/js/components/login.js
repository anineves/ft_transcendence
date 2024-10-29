import { navigateTo, checkLoginStatus } from '../utils.js';
const apiUrl = window.config.API_URL;
const translations = {
    english: {
        login: "Logiin",
        email: "Email or Username",
        password: "Password",
        submit: "Login",
        submit2: "Login using 2FA",
        errorLogin: "There is no user created with this data"
    },
    portuguese: {
        login: "Entrssar",
        email: "Email ou Nome de Usuário",
        password: "Palavra passe",
        submit: "Entrar",
        submit2: "Entrar com 2FA",
        guest: "Jogar como Convidado",
        errorLogin: "Nao ha utilizador criado com esses dados"
    },
    french: {
        login: "Se connecter",
        email: "Email ou Nom d'utilisateur",
        password: "Mot de passe",
        submit: "Entrer",
        submit2: "Entrer avec 2FA",
        guest: "Jouer en tant qu'invité",
        errorLogin: "Aucun utilisateur n'a été créé avec ces données"
    }
    

};
export const renderLogin = () => {
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;
  app.innerHTML = `
  <div class="background-form" class="form-log-reg">
      <h2>${translations[savedLanguage].login}</h2>
      <form id="loginForm">
          <input type="text" id="emailOrUsername" placeholder="${translations[savedLanguage].email}" required class="form-control mb-2">
          <div id="emailError" class="error-message" style="color:red; font-size: 0.9em;"></div> 
          <input type="password" id="password" placeholder="${translations[savedLanguage].password}" required class="form-control mb-2">
          <div id="passwordError" class="error-message" style="color:red; font-size: 0.9em;"></div> 
          <button type="submit" id="btn-login" class="btn">${translations[savedLanguage].submit}</button>
      </form>
  </div>
`;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        // Previne o comportamento padrão do formulário de recarregar a página.
        e.preventDefault(); 
        const emailOrUsername = document.getElementById('emailOrUsername').value; 
        const password = document.getElementById('password').value; 
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        
        // Resetar mensagens de erro
        emailError.textContent = '';
        passwordError.textContent = '';


        const apiUrl = window.config.API_URL;
       
        try {
            const userCheckResponse = await fetch(`${apiUrl}/api/users/`);
            if (!userCheckResponse.ok) {
                throw new Error("Erro ao buscar usuários.");
            }

            const users = await userCheckResponse.json();
            const userExists = users.some(user => user.email === emailOrUsername || user.username === emailOrUsername);

            if (!userExists) {
                emailError.textContent = `${translations[savedLanguage].errorLogin}`;
                return;
            }
        } catch (error) {
            console.error("Erro ao verificar usuário:", error);
            return;
        }

        const urlLogin = `${apiUrl}/api/token/`;
        try {
            const response = await fetch(urlLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailOrUsername, password })
            });
        

            if(response.status == 203)
            {
                passwordError.textContent = `${translations[savedLanguage].errorlo}`;
                return; 
            }

            if (response.ok) {
                const data = await response.json();
                if(data.otp_agreement) {
                    showCodeForm();
                } else {
                    sessionStorage.setItem('register', 'form');
                    sessionStorage.setItem('jwtToken', data.access); 
                    sessionStorage.setItem('refreshToken', data.refresh); 
                    sessionStorage.setItem('user', JSON.stringify(data.user)); 
        
                    const userId = data.user.id;
                    const token = data.access;
                    const urlPlayers = `${apiUrl}/api/players/`;
                    try {
                        const playerResponse = await fetch(urlPlayers, {
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
                }
            } else {
                passwordError.textContent = `${translations[savedLanguage].errorLogin}`;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });


};

const showCodeForm = async () => {
    const app = document.getElementById('app');
    const emailOrUsername = document.getElementById('emailOrUsername').value;
        const password = document.getElementById('password').value;
        const urlOtp = `${apiUrl}/api/otp/`;
        try {

            const response = await fetch(urlOtp, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailOrUsername, password })
            });

            if (response.ok) {
                // showCodeForm(emailOrUsername, password); #TODO: POST twice to OTP
            } else {
                alert('Failed to send verification code.1');
            }
        } catch (error) {

            console.error('Error:', error);
            alert('An error occurred during login');
        }
    

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
        const apiUrl = window.config.API_URL;
        const urlLogin = `${apiUrl}/api/token/`;

        try {
            const response = await fetch(urlLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailOrUsername, password, otp })
            });

            if (response.ok) {
                const data = await response.json();

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
                const urlPlayers = `${apiUrl}/api/players/`;
                try {
                const playerResponse = await fetch(urlPlayers, {
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
                            console.log("nickname", player.nickname)
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
                alert('Failed to send verification code.2');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });
};


const handleSuccessfulLogin = async () => {

    const jwtToken = sessionStorage.getItem('jwtToken');
    const user = sessionStorage.getItem('user');
    const userID = sessionStorage.getItem('userID');
    try {
        const playerResponse = await fetch(urlPlayers, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        console.log("Player Response", playerResponse);
        if (playerResponse.ok) {
            const playerData = await playerResponse.json();

            let player = null;

            for (const p of playerData) {            
                if (p.user == userID) {
                    player = p;
                }
            }

            if (player) {
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
    const stat = status;

    const apiUrl = window.config.API_URL;
    const urlPlayer = `${apiUrl}/api/player/${playerId}`;
    if(playerId)
    {
        try {
            const playerInfo = await fetch(urlPlayer, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status : stat })
            });
            
            console.log("Player", playerInfo);
            if (playerInfo.ok) {
                const playerT = await playerInfo.json();
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
    }
};