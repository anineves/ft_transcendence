import { navigateTo, checkLoginStatus } from '../utils.js';
const apiUrl = window.config.API_URL;
const translations = {
    english: {
        login: "Login",
        email: "Email or Username",
        password: "Password",
        submit: "Login",
        submit2: "Login using 2FA",
        errorLogin: "There is no user created with this data",
        errorUsername: "There is no user created with this data,Username must contain only letters, numbers, and the '-' symbol.", 
        errorPassword: "Password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit, and a special character _, - or @; other special characters will not be accepted.",
        errorWrongPassword: "Wrong password.",
    },
    portuguese: {
        login: "Entrar",
        email: "Email ou Nome de Usuário",
        password: "Palavra passe",
        submit: "Entrar",
        submit2: "Entrar com 2FA",
        guest: "Jogar como Convidado",
        errorLogin: "Nao ha utilizador criado com esses dados",
        errorUsername: "Nao ha utilizador criado com esses dados, O username deve conter apenas letras, números e o símbolo '-'.",
        errorPassword: "A palavra-passe deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um dígito e um caracter especial _, - ou @, outros caracteres especiais não serão aceites.",
        errorWrongPassword: "Palavra-passe errada."
    },
    french: {
        login: "Se connecter",
        email: "Email ou Nom d'utilisateur",
        password: "Mot de passe",
        submit: "Entrer",
        submit2: "Entrer avec 2FA",
        guest: "Jouer en tant qu'invité",
        errorLogin: "Aucun utilisateur n'a été créé avec ces données",
        errorUsername: "Aucun utilisateur n'a été créé avec ces données,Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
        errorPassword: "Le mot de passe doit contenir au moins 8 caractères, y compris au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial _, - ou @, d'autres caractères spéciaux ne seront pas acceptés.",
        errorWrongPassword: "Mot de passe incorrect."
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
        let email;
        let username; // Declara a variável email

        const password = document.getElementById('password').value; 
        const emailError = document.getElementById('emailError');

        const passwordError = document.getElementById('passwordError');
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@])[a-zA-Z\d-_@]{8,}$/;
        const nameRegex = /^[a-zA-Z0-9-]+$/; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let valid = true;
        emailError.textContent = '';
        passwordError.textContent = '';
        if (emailOrUsername.includes('@')) {
            email = emailOrUsername; 
            if (!emailRegex.test(email)) {
                passwordError.textContent += `${translations[savedLanguage].errorUsername}`;
                valid = false;
            }
        }
        else
        {
            username = emailOrUsername;
            if (!nameRegex.test(username)) {
                passwordError.textContent += `${translations[savedLanguage].errorUsername}`;
                valid = false;
            }
        }


        if (!passwordRegex.test(password)) {
            passwordError.textContent = `${translations[savedLanguage].errorWrongPassword}`
            passwordError.textContent += `${translations[savedLanguage].errorPassword}`
            valid = false; 
        }
        if(emailRegex.le)

        if (!valid) return;
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
                passwordError.textContent = `${translations[savedLanguage].errorWrongPassword}`;
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
                                checkLoginStatus(); 
                                sessionStorage.setItem('firtChat', 'true');
                                navigateTo('/create-player');
                                return;
                            }
                        } else {
                            //console.log("error loading players");
                        }
                    } catch (error) {
                        console.error('Error', error);
                    }
                    
                    checkLoginStatus(); 
                    sessionStorage.setItem('firtChat', 'true');
                    navigateTo('/game-selection', data); 
                    return;
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
                //console.log('Failed to send verification code.1');
            }
        } catch (error) {
            console.error('Error:', error);
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
                            checkLoginStatus(); 
                            sessionStorage.setItem('firtChat', 'true');
                            navigateTo('/create-player');
                            return;
                        }
                    } else {
                        //console.log("error loading players");
                    }
                } catch (error) {
                    console.error('Error', error);
                }
            
                checkLoginStatus(); 
                sessionStorage.setItem('firtChat', 'true');
                navigateTo('/game-selection', data); 
            } else {
                //('Failed to send verification code.2');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
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
        
            if (playerInfo.ok) {
                const playerT = await playerInfo.json();
                sessionStorage.setItem('playerStatus', playerT.status);
                
                checkLoginStatus();
                navigateTo('/game-selection');
    
            } else if (user) {
                //console.log("player not found");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
};