import { navigateTo, checkLoginStatus } from '../utils.js'; 

export const renderLogin = () => {
    // Obtem a app onde o formulário de login será inserido.
    const app = document.getElementById('app'); 

    app.innerHTML = `
        <div class="login">
            <h2>Login</h2> 
            <!-- Título da seção de login -->
            <form id="loginForm">
                <!-- Formulário de login -->
                <input type="text" id="email" placeholder="Email or user" required class="form-control mb-2">
                <!-- Campo de entrada para o email, obrigatório para submissão -->
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <!-- Campo de entrada para a senha, obrigatório para submissão -->
                <button type="submit" class="btn">Submit</button>
                <!-- Botão de submissão do formulário -->
            </form>
        </div>
    `;

    // Adiciona um listener para o evento de submissão do formulário de login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        // Previne o comportamento padrão do formulário de recarregar a página.
        e.preventDefault(); 
        const email = document.getElementById('email').value; 
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
                body: JSON.stringify({ email, password }) 
            });

            // Converte a resposta da API em um objeto JSON.
            const data = await response.json(); 
            // Se a resposta for bem-sucedida (status 200), armazena os tokens JWT e dados do usuário.
            if (response.ok) {
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
};