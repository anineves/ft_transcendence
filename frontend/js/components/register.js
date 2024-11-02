import { navigateTo, checkLoginStatus  } from '../utils.js';
import { putPlayer } from './login.js';
const apiUrl = window.config.API_URL;

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
            errorFirstName: "First name must contain only letters, numbers, and the '-' symbol.", 
            errorLastName: "Last name must contain only letters, numbers, and the '-' symbol.", 
            errorUsername: "Username must contain only letters, numbers, and the '-' symbol.", 
            errorEmail: "Email must be valid.",
            errorPassword: "Password must be at least 8 characters long, including at least one uppercase letter, one lowercase letter, one digit, and a special character _, - or @; other special characters will not be accepted.",
            errorRepeatPassword: "Passwords do not match.",
            errorEmailGeneral: "This e-mail already exist!"
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
            errorFirstName: "O primeiro nome deve conter apenas letras, números e o símbolo '-'.", 
            errorLastName: "Sobrenome deve conter apenas letras, números e o símbolo '-'.", 
            errorUsername: "O username deve conter apenas letras, números e o símbolo '-'.", 
            errorEmail: "O e-mail deve ser válido.",
            errorPassword: "A palavra-passe deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um dígito e um caracter especial _, - ou @, outros caracteres especiais não serão aceites.",
            errorRepeatPassword: "As palavras-passe não coincidem.",
            errorEmailGeneral: "Este e-mail já existe!"
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
            errorFirstName: "Le prénom doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
            errorLastName: "Le nom de famille doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
            errorUsername: "Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
            errorEmail: "L'e-mail doit être valide.",
            errorPassword: "Le mot de passe doit contenir au moins 8 caractères, y compris au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial _, - ou @, d'autres caractères spéciaux ne seront pas acceptés.",
            errorRepeatPassword: "Les mots de passe ne correspondent pas.",
            errorEmailGeneral: "Cet e-mail existe déjà!"
        }
    };
    
    // Obtenção do idioma salvo ou definição do padrão
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage || !translations[savedLanguage])
        savedLanguage = 'english';
    
    app.innerHTML = `
        <div class="background-form" id="registerForm" class="form-log-reg">
            <h2>${translations[savedLanguage].register}</h2>
            <form  enctype="multipart/form-data">
                <input type="text" id="firstName" placeholder="${translations[savedLanguage].first}" required class="form-control mb-2">
                <input type="text" id="lastName" placeholder="${translations[savedLanguage].last}" required class="form-control mb-2">
                <input type="text" id="username" placeholder="${translations[savedLanguage].user}" required class="form-control mb-2">
                <input type="text" id="email" placeholder="${translations[savedLanguage].email}" required class="form-control mb-2">
                <input type="password" id="password" placeholder="${translations[savedLanguage].pass}" required class="form-control mb-2">
                <input type="password" id="password2" placeholder="${translations[savedLanguage].confirmPass}" required class="form-control mb-2">
                <input type="file" id="avatar" accept="image/*" class="form-control mb-2">
                <div id="passwordError" class="error-message" style="color:red; font-size: 0.9em;"></div> 
                <div id="confirmPasswordError" class="error-message" style="color:red; font-size: 0.9em;"></div>
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
        const avatar = document.getElementById('avatar').files[0]; 
        const passwordError = document.getElementById('passwordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
    
        passwordError.textContent = '';
        confirmPasswordError.textContent = '';
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@])[a-zA-Z\d-_@]{8,}$/;
        const nameRegex = /^[a-zA-Z0-9-]+$/; 
        let valid = true;
    
        if (!passwordRegex.test(password)) {
            passwordError.textContent = `${translations[savedLanguage].errorPassword}`
            valid = false; 
        }
    
  
        if (password !== password2) {
            confirmPasswordError.textContent = `${translations[savedLanguage].errorRepeatPassword}`
            valid = false;
        }
    
        if (!valid) return;
        if (!nameRegex.test(firstName)) {
            passwordError.textContent += `${translations[savedLanguage].errorFirstName}`;
            valid = false;
        }
   
        if (!nameRegex.test(lastName)) {
            passwordError.textContent += `${translations[savedLanguage].errorLastName}`;
            valid = false;
        }
    

        if (!nameRegex.test(username)) {
            passwordError.textContent += `${translations[savedLanguage].errorUsername}`;
            valid = false;
        }
    
   
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            passwordError.textContent += `${translations[savedLanguage].errorEmail}`;
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

            const apiUrl = window.config.API_URL;
            const urlRegister = `${apiUrl}/api/register/`;

            const response = await fetch(urlRegister, {
                method: 'POST',
                body: formData 
            });


            const data = await response.json(); // Converte a resposta para JSON

            if (response.status === 201) {
    
                sessionStorage.setItem('userReg', JSON.stringify(data)); // Armazena os dados do usuário registrado no sessionStorage

                // Após o registro, faça login automaticamente com as credenciais fornecidas
                const apiUrl = window.config.API_URL;
                const urlLogin = `${apiUrl}/api/token/`;
                const loginResponse = await fetch(urlLogin,  {
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
                    navigateTo('/create-player', data);  // Redireciona para a próxima página após login
                } else {
                    console.log('Login after registration failed: ' + JSON.stringify(loginData));
                }
            } else {
                passwordError.textContent += `${translations[savedLanguage].errorEmailGeneral}`;
                console.log('Registration failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
};