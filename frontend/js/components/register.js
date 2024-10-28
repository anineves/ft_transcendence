import { navigateTo, checkLoginStatus  } from '../utils.js';

export const renderRegister = () => {
    const app = document.getElementById('app');
    const translations = {
        english: {
            register: "Register",
            first: "First Name",
            last: "Last Name",
            user: "Username",
            email: "Email", 
            pass: "Password",
            confirmPass: "Confirm Password",
            submit: "Register",
        },
        portuguese: {
            register: "Registar",
            first: "Primeiro Nome",
            last: "Último Nome",
            user: "Nome de Utilizador",
            email: "Email", 
            pass: "Palavra-passe",
            confirmPass: "Confirmar Palavra-passe",
            submit: "Registar",
        },
        french: {
            register: "S'inscrire",
            first: "Prénom",
            last: "Nom de famille",
            user: "Nom d'utilisateur",
            email: "Email", 
            pass: "Mot de passe",
            confirmPass: "Confirmer le mot de passe",
            submit: "S'inscrire",
        }
    };
    
    // Obtenção do idioma salvo ou definição do padrão
    let savedLanguage = localStorage.getItem('language');
    
    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    }
    
    
    app.innerHTML = `
        <div class="background-form" id="registerForm" class="form-log-reg">
            <h2>${translations[savedLanguage].register}</h2>
            <form  enctype="multipart/form-data">
                <input type="text" id="firstName" placeholder="${translations[savedLanguage].first}" required class="form-control mb-2">
                <input type="text" id="lastName" placeholder="${translations[savedLanguage].last}" required class="form-control mb-2">
                <input type="text" id="username" placeholder="${translations[savedLanguage].user}" required class="form-control mb-2">
                <input type="text" id="email" placeholder="${translations[savedLanguage].email}" required class="form-control mb-2">
                <input type="password" id="password" placeholder="${translations[savedLanguage].pass}" required class="form-control mb-2">
                <div id="passwordError" class="error-message" style="color:red; font-size: 0.9em;"></div> 
                <input type="password" id="password2" placeholder="${translations[savedLanguage].confirmPass}" required class="form-control mb-2">
                <div id="confirmPasswordError" class="error-message" style="color:red; font-size: 0.9em;"></div>
                <input type="file" id="avatar" accept="image/*" class="form-control mb-2">
                <div class="button-container">
                    <button type="submit" class="btn">${translations[savedLanguage].submit}</button>
                    <button type="button" id="btn-register42" class="btn">
                        <img src="./assets/42.png" alt="Pong" class="button-image">
                    </button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('btn-register42').addEventListener('click', async (e) => {
        e.preventDefault();
        sessionStorage.setItem('register', '42');
        const apiUrl = window.config.API_URL;
        window.location.href = `${apiUrl}/oauth/login`; 
    });
  

    // Adiciona um listener para o evento de submissão do formulário de registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o comportamento padrão de submissão do formulário

        // Obtém os valores dos campos do formulário
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const password2 = document.getElementById('password2').value;
        const avatar = document.getElementById('avatar').files[0]; // Obtém o arquivo de imagem de avatar

        const passwordError = document.getElementById('passwordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
    
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        let valid = true;
    
        if (!passwordRegex.test(password)) {
            passwordError.textContent = 'A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula e um dígito.';
            valid = false; 
        }
    
  
        if (password !== password2) {
            confirmPasswordError.textContent = 'As senhas não coincidem!';
            valid = false;
        }
    
        if (!valid) return;


        // Cria um objeto FormData para enviar os dados do formulário, incluindo o arquivo de avatar
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('password2', password2);
        if (avatar) {
            formData.append('avatar', avatar); // Adiciona o avatar apenas se estiver presente
        }

        try {
            // Faz uma requisição POST para a API de registro com os dados do formulário
            console.log("API", window.config.API_URL)
            const apiUrl = window.config.API_URL;
            const urlRegister = `${apiUrl}/api/register/`;

            const response = await fetch(urlRegister, {
                method: 'POST',
                body: formData 
            });


            const data = await response.json(); // Converte a resposta para JSON

            if (response.status === 201) {
                alert('User registered success!');
                sessionStorage.setItem('userReg', JSON.stringify(data)); // Armazena os dados do usuário registrado no sessionStorage

                // Após o registro, faça login automaticamente com as credenciais fornecidas
                const loginResponse = await fetch('http://127.0.0.1:8000/api/token/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password
                    })
                });

                const loginData = await loginResponse.json();

                if (loginResponse.ok) {
                    sessionStorage.setItem('register', 'form');
                    sessionStorage.setItem('jwtToken', loginData.access); 
                    sessionStorage.setItem('refreshToken', loginData.refresh); 
                    sessionStorage.setItem('user', JSON.stringify(loginData.user)); 
                    checkLoginStatus(); 
                    navigateTo('/game-selection', data);  // Redireciona para a próxima página após login
                } else {
                    alert('Login after registration failed: ' + JSON.stringify(loginData));
                }
            } else {
                // Se o registro falhar, alerta o usuário com a mensagem de erro
                alert('Registration failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration');
        }
    });
};