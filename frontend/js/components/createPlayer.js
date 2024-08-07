import { navigateTo, checkLoginStatus } from '../utils.js'; 

export const createPlayer = () => {
    const app = document.getElementById('app'); 

    app.innerHTML = `
        <div class="login">
            <h2>Create you Player</h2> 
            <form id="playerForm">
               <input type="text" id="nickname" placeholder="Nickname" required class="form-control mb-2">
               <button type="submit" class="btn">Submit</button>
            </form>
        </div>
    `;

    // Adiciona um listener para o evento de submissão do formulário de login
    document.getElementById('playerForm').addEventListener('submit', async (e) => {
        // Previne o comportamento padrão do formulário de recarregar a página.
        e.preventDefault(); 
        alert('entrei');
        const nickname = document.getElementById('nickname').value; 

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/player/${user.id}`, {
                // Define o método de requisição HTTP como POST.
                method: 'POST', 
                // Define o cabeçalho da requisição indicando que o conteúdo é JSON.
                headers: {
                    'Content-Type': 'application/json'
                },
                // Converte o corpo da requisição para uma string JSON contendo email e senha.
                body: JSON.stringify({ nickname}) 
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
                localStorage.setItem('player', JSON.stringify(data.player)); 
                checkLoginStatus(); 
                navigateTo('/login', data); 
            } else {
                alert('Login failed: ' + JSON.stringify(data)); 
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Player An error occurred during login'); 
        }
    });
};