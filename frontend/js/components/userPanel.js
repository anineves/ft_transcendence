import { navigateTo, checkLoginStatus, logout } from '../utils.js';

export const renderPanel = (user) => {
    const app = document.getElementById('app');

    const defaultAvatar = '../../assets/avatar.png';
    const avatarUrl = user.avatar ? user.avatar : defaultAvatar;
    app.innerHTML = `
        <div class="user-panel">
            <h2>User Profile</h2>
            <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="User Avatar" class="avatar">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Firstname:</strong> ${user.first_name}</p>
            <p><strong>Lastname:</strong> ${user.last_name}</p>
            <p><strong>Id:</strong> ${user.id}</p>
            <button id="logoutBtn" class="btn">Logout</button>
            <button id="editBtn" class="btn">Edit</button>
            
            <!-- Seção para atualizar o perfil, inicialmente oculta -->
            <div id="updateProfileSection" style="display: none;">
                <h2>Update Profile</h2>
                <form id="updateProfileForm">
                    <input type="file" id="updateAvatar" placeholder="Avatar" class="form-control mb-2">
                    <input type="text" id="updateFirstName" placeholder="First Name" class="form-control mb-2" value="${user.first_name}">
                    <input type="text" id="updateLastName" placeholder="Last Name" class="form-control mb-2" value="${user.last_name}">
                    <input type="text" id="updateUsername" placeholder="Username" class="form-control mb-2" value="${user.username}">
                    <input type="email" id="updateEmail" placeholder="Email" class="form-control mb-2" value="${user.email}">
                    <button type="submit" class="btn">Update</button>
                </form>
            </div>
        </div>
    `;

    // Adiciona um listener para o botão de logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      logout();
    });

    // Adiciona um listener para o botão de edição do perfil
    document.getElementById('editBtn').addEventListener('click', () => {
        const updateProfileSection = document.getElementById('updateProfileSection');
        // Alterna a visibilidade da seção de atualização do perfil
        updateProfileSection.style.display = updateProfileSection.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault()

    
        const formData = new FormData();
        const avatarFile = document.getElementById('updateAvatar').files[0]; 
        const firstName = document.getElementById('updateFirstName').value;
        const lastName = document.getElementById('updateLastName').value;
        const username = document.getElementById('updateUsername').value;
        const email = document.getElementById('updateEmail').value;

        // Adiciona o arquivo de avatar ao FormData se estiver presente
        if (avatarFile) formData.append('avatar', avatarFile);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('username', username);
        formData.append('email', email);

        try {
            // Faz uma requisição PUT para atualizar os dados do usuário na API
            const response = await fetch(`http://127.0.0.1:8000/api/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: formData 
            });

            const data = await response.json(); 

            if (response.ok) {
                alert('Profile updated successfully!');
                localStorage.setItem('user', JSON.stringify(data)); 
                checkLoginStatus(); 
                navigateTo('/game-selection', data);
            } else {
                alert('Update failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile.');
        }
    });
};
