import { navigateTo } from '../utils.js';

export const renderPlayerProfile = () => {
    const playerJson = sessionStorage.getItem('playerProfile');
    
    if (!playerJson) {
        console.error("Player profile not found in session storage.");
        navigateTo('/live-chat');
        return;
    }
    
    const player = JSON.parse(playerJson);
    const app = document.getElementById('app');
    const defaultAvatar = '../../assets/avatar.png';
    const avatarUrl = player.avatar || defaultAvatar;

    app.innerHTML = `
        <div class="user-panel">
            <div id="profileSection">
                <h2>Player Profile</h2>
                <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="Player Avatar" class="avatar">
                <p><strong>Nickname:</strong> ${player.nickname}</p>
                <p><strong>Status:</strong> ${player.status}</p>
                <p><strong>Id:</strong> ${player.id}</p>
                <button id="backBtn" class="btn">Back to Chat</button>
            </div>
        </div>
    `;

    document.getElementById('backBtn').addEventListener('click', () => {
        navigateTo('/live-chat');
    });
};
