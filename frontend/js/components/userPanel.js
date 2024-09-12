import { navigateTo, checkLoginStatus, logout } from '../utils.js';
import { renderFriendsPage } from './friendsPage.js';

export const renderPanel = async (user) => {
    const app = document.getElementById('app');
    const defaultAvatar = '../../assets/avatar.png';
    const avatarUrl = user.avatar || defaultAvatar;
    const player = JSON.parse(sessionStorage.getItem('playerInfo'));
    const nickname = sessionStorage.getItem('nickname') || 'N/A';
    
    try {
        const response = await fetch('http://localhost:8000/api/matches/');
        const matches = await response.json();
        
        let totalWins = 0;
        
        matches.forEach(match => {
            console.log(player.id, match.winner_id, totalWins);
            if (match.players.includes(player.id) && match.winner_id == player.id) {
                totalWins++;
            }
        });

        const level = Math.floor(totalWins / 5) + 1; 
        const winsInCurrentLevel = totalWins % 5; 
        const progressPercentage = (winsInCurrentLevel / 5) * 100; 

    
        const progressBar = Array(5).fill('⬜').map((segment, index) => {
            return index < winsInCurrentLevel ? '🟦' : '⬜'; 
        }).join('');

    
        app.innerHTML = `
            <div class="user-panel">
                <div id="profileSection">
                    <h2>User Profile</h2>
                    <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="User Avatar" class="avatar">
                    <div class="profile-content">
                        <div class="info">
                            <h2>Info</h2>
                            <p><strong>Username:</strong> ${user.username}</p>
                            <p><strong>Nickname:</strong> ${nickname}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Firstname:</strong> ${user.first_name}</p>
                            <p><strong>Lastname:</strong> ${user.last_name}</p>
                            <p><strong>Id:</strong> ${user.id}</p>
                        </div>
                        <div class="progression">
                            <h2>Progression</h2>
                            <p><strong>Level:</strong> ${level}</p>
                            <div class="progress-bar" id="progressBar" style="cursor: pointer;">
                                <span class="progress-label">${progressBar}</span>
                                <p>${winsInCurrentLevel}/5 wins to reach next level</p>
                            </div>
                        </div>
                    </div>
                    <div class="all-btn">
                        <button id="logoutBtn" class="btn">Logout <i class="fa-solid fa-right-from-bracket"></i></button>
                        <button id="editBtn" class="btn"><i class="fas fa-pencil-alt"></i></button>
                        <button id="friendBtn" class="btn">Friends <i class="fas fa-user-group"></i></button>
                        <button id="createBtn" class="btn">Create Player</button>
                        <button id="sendMensageBtn" class="btn">Send Message <i class="fa-solid fa-message"></i></button>
                    </div>
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
                    <button id="backProfileBtn" class="btn">Back to Profile</button>
                </div>
                <div id="inviteSection" style="display: none;">
                    <form id="inviteForm">
                        <input type="number" id="friendId" placeholder="Friend ID" class="form-control mb-2" required>
                        <button type="submit" class="btn">Send Request</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('progressBar').addEventListener('click', () => {
            navigateTo('/stats');
        });

        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('editBtn').addEventListener('click', toggleEditProfile);
        document.getElementById('friendBtn').addEventListener('click', () => renderFriendsPage(user));
        document.getElementById('createBtn').addEventListener('click', () => navigateTo('/create-player'));
        document.getElementById('sendMensageBtn').addEventListener('click', handleSendMessage);
        document.getElementById('updateProfileForm').addEventListener('submit', handleUpdateProfile);
        document.getElementById('backProfileBtn').addEventListener('click', () => navigateTo('/user-panel', user));
    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/live-chat');
    }
};


const toggleEditProfile = () => {
    const profileSection = document.getElementById('profileSection');
    const updateProfileSection = document.getElementById('updateProfileSection');
    const isHidden = updateProfileSection.style.display === 'none';

    updateProfileSection.style.display = isHidden ? 'flex' : 'none';
    profileSection.style.display = isHidden ? 'none' : 'flex';
};

const handleSendMessage = () => {
    const nickname = sessionStorage.getItem('nickname');
    if (nickname !== 'N/A') {
        navigateTo('/live-chat');
    } else {
        alert("You need to create a player!");
        navigateTo('/create-player');
    }
};

const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const avatarFile = document.getElementById('updateAvatar').files[0];
    const firstName = document.getElementById('updateFirstName').value;
    const lastName = document.getElementById('updateLastName').value;
    const username = document.getElementById('updateUsername').value;
    const email = document.getElementById('updateEmail').value;
    const nickname = document.getElementById('updateNickname').value;

    if (avatarFile) formData.append('avatar', avatarFile);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('nickname', nickname);  

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
            navigateTo('/user-panel', data);
        } else {
            alert('Update failed: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the profile.');
    }
};
