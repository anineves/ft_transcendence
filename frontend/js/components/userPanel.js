import { navigateTo, checkLoginStatus } from '../utils.js';

export const renderPanel = (user) => {
    const app = document.getElementById('app');
    console.log('User Avatar URL:', user.avatar);
    app.innerHTML = `
        <div class="user-panel">
            <h2>User Profile</h2>
            <img id="avatarImg" src="${user.avatar}?${new Date().getTime()}" alt="User Avatar" class="avatar">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Nickname:</strong> ${user.nickname}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Firstname:</strong> ${user.first_name}</p>
            <p><strong>Lastname:</strong> ${user.last_name}</p>
            <p><strong>Id:</strong> ${user.id}</p>
            <button id="logoutBtn" class="btn">Logout</button>
            <button id="editBtn" class="btn">Edit</button>
            
            <div id="updateProfileSection" style="display: none;">
                <h2>Update Profile</h2>
                <form id="updateProfileForm">
                    <input type="file" id="updateAvatar" class="form-control mb-2">
                    <input type="text" id="updateFirstName" placeholder="First Name" class="form-control mb-2" value="${user.first_name}">
                    <input type="text" id="updateLastName" placeholder="Last Name" class="form-control mb-2" value="${user.last_name}">
                    <input type="text" id="updateUsername" placeholder="Username" class="form-control mb-2" value="${user.username}">
                    <input type="email" id="updateEmail" placeholder="Email" class="form-control mb-2" value="${user.email}">
                    <button type="submit" class="btn">Update</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        checkLoginStatus();
        navigateTo('/login');
    });

    document.getElementById('editBtn').addEventListener('click', () => {
        const updateProfileSection = document.getElementById('updateProfileSection');
        updateProfileSection.style.display = updateProfileSection.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const avatarFile = document.getElementById('updateAvatar').files[0]; 
        const firstName = document.getElementById('updateFirstName').value;
        const lastName = document.getElementById('updateLastName').value;
        const username = document.getElementById('updateUsername').value;
        const email = document.getElementById('updateEmail').value;

        if (avatarFile) formData.append('avatar', avatarFile);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('username', username);
        formData.append('email', email);

        try {
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
                renderPanel(data);
            } else {
                alert('Update failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile.');
        }
    });
};