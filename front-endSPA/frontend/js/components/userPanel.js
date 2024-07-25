import { logout } from '../utils.js';

export const renderPanel = (user) => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="user-panel">
            <h2>User Profile</h2>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <button id="logoutBtn" class="btn">Logout</button>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });
};
