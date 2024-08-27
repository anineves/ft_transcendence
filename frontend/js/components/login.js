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
                <button type="submit" id="btn-login"class="btn">Submit</button>
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
                console.log("Login");
                console.log(data);
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
                            sessionStorage.setItem('nickname', JSON.stringify(player.nickname));
                        } else {
                            console.log("You need create a player");
                        }
                    } else {
                        console.log("error loading players");
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
};