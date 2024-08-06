import { navigateTo } from '../utils.js';

export const renderRegister = () => {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="register">
            <h2>Register</h2>
            <form id="registerForm" enctype="multipart/form-data">
                <input type="text" id="firstName" placeholder="First Name" required class="form-control mb-2">
                <input type="text" id="lastName" placeholder="Last Name" required class="form-control mb-2">
                <input type="text" id="username" placeholder="Username" required class="form-control mb-2">
                <input type="email" id="email" placeholder="Email" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <input type="password" id="password2" placeholder="Confirm Password" required class="form-control mb-2">
                <input type="file" id="avatar" accept="image/*" class="form-control mb-2">
                <button type="submit" class="btn">Submit</button>
                </form>
                <form id="btn-register42">
                    <button type="submit" class="btn" >Register with 42</button>
                </form>
                </div>
    `;

    document.getElementById('btn-register42').addEventListener('submit', async (e) => {
        e.preventDefault(); 

            alert('register ');
            navigateTo('/');
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
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                body: formData 
            });

            const data = await response.json(); // Converte a resposta para JSON

            if (response.status === 201) {
                alert('User registered successfully!');
                localStorage.setItem('userReg', JSON.stringify(data)); // Armazena os dados do usuário registrado no localStorage
                navigateTo('/login');
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
