// frontend/components/userPanel.js

import { navigateTo, checkLoginStatus, logout } from '../utils.js';
import { renderFriendsPage } from './friendsPage.js';

export const renderPanel = (user) => {
    const app = document.getElementById('app');
    const defaultAvatar = '../../assets/avatar.png';
    const nickname = sessionStorage.getItem('nickname');
    const playerStatus = sessionStorage.getItem('playerStatus');
    const avatarUrl = user.avatar || defaultAvatar;

    app.innerHTML = `
        <div class="user-panel">
            <div id="profileSection">
                <h2>User Profile</h2>
                <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="User Avatar" class="avatar">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Nickname:</strong> ${nickname}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Firstname:</strong> ${user.first_name}</p>
                <p><strong>Lastname:</strong> ${user.last_name}</p>
                <p><strong>Id:</strong> ${user.id}</p>
                <p><strong>Status:</strong> ${playerStatus}</p>
                <button id="logoutBtn" class="btn">Logout</button>
                <button id="editBtn" class="btn">Edit</button>
                <button id="friendBtn" class="btn">Friends</button>
                <button id="createBtn" class="btn">Create Player</button>
                <button id="sendMensageBtn" class="btn">Send Mensage</button>
            </div>
            <div id="updateProfileSection" style="display: none;">
                <h2>Update Profile</h2>
                <form id="updateProfileForm">
                    <input type="file" id="updateAvatar" class="form-control mb-2">
                    <input type="text" id="updateFirstName" placeholder="First Name" class="form-control mb-2" value="${user.first_name}">
                    <input type="text" id="updateNickname" placeholder="Nickname" class="form-control mb-2" value="${nickname}">
                    <input type="text" id="updateLastName" placeholder="Last Name" class="form-control mb-2" value="${user.last_name}">
                    <input type="text" id="updateUsername" placeholder="Username" class="form-control mb-2" value="${user.username}">
                    <input type="email" id="updateEmail" placeholder="Email" class="form-control mb-2" value="${user.email}">
                    <button type="submit" class="btn">Update</button>
                </form>
            </div>
            <div id="inviteSection" style="display: none;">
                <form id="inviteForm">
                    <input type="number" id="friendId" placeholder="Friend ID" class="form-control mb-2" required>
                    <button type="submit" class="btn">Send Request</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.getElementById('editBtn').addEventListener('click', () => {
        const profileSection = document.getElementById('profileSection');
        const updateProfileSection = document.getElementById('updateProfileSection');
        const isHidden = updateProfileSection.style.display === 'none';

        updateProfileSection.style.display = isHidden ? 'flex' : 'none';
        profileSection.style.display = isHidden ? 'none' : 'flex';
    });

 

    document.getElementById('friendBtn').addEventListener('click', () => {
        renderFriendsPage(user);
    });

    document.getElementById('createBtn').addEventListener('click', () => {
        navigateTo('/create-player');
    });
    document.getElementById('sendMensageBtn').addEventListener('click', () => {
        navigateTo('/live-chat');
    });


    document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        const avatarFile = document.getElementById('updateAvatar').files[0];
        const firstName = document.getElementById('updateFirstName').value;
        const lastName = document.getElementById('updateLastName').value;
        const username = document.getElementById('updateUsername').value;
        const email = document.getElementById('updateEmail').value;
        const nickname = document.getElementById('updateNickname').value;

        sessionStorage.setItem('nickname', nickname);

        if (avatarFile) formData.append('avatar', avatarFile);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('username', username);
        formData.append('email', email);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully!');
                sessionStorage.setItem('user', JSON.stringify(data));
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
