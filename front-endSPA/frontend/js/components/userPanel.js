import { logout } from '../utils.js';

export const renderPanel = (userReg) => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="user-panel">
            <h2>User Profiiile</h2>
            <img id="avatarImg" src="./assets/avatar.png" alt="Useir Avatar" class="avatar">
            <p><strong>Username:</strong> ${userReg.username}</p>
            <p><strong>Email:</strong> ${userReg.email}</p>
            <p><strong>Firstname:</strong> ${userReg.first_name}</p>
            <p><strong>Lastname:</strong> ${userReg.last_name}</p>
            <button id="logoutBtn" class="btn">Logout</button>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });
};
