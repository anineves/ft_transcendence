import { navigateTo } from '../utils.js';

export const renderPlayerProfile = async () => {
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

    try {
      
        app.innerHTML = `
            <div class="user-panel">
                <div id="profileSection">
                    <h2>Player Profile</h2>
                    <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="Player Avatar" class="avatar">
                    <p><strong>Username:</strong> ${player.username}</p>
                    <p><strong>Nickname:</strong> ${player.nickname}</p>
                    <p><strong>Email:</strong> ${player.email}</p>
                    <p><strong>Firstname:</strong> ${player.first_name}</p>
                    <p><strong>Lastname:</strong> ${player.last_name}</p>
                    <p><strong>Id:</strong> ${player.id}</p>
                    <p><strong>Total Wins:</strong> <span id="totalWins">Loading...</span></p>
                    <p><strong>Total Losses:</strong> <span id="totalLosses">Loading...</span></p>
                    <p><strong>Total Matches:</strong> <span id="totalMatches">Loading...</span></p>
                    <button id="backBtn" class="btn">Back to Chat</button>
                </div>
            </div>
        `;
        
        const response = await fetch('http://localhost:8000/api/matches/');
        const matches = await response.json();


        let totalWins = 0;
        let totalLosses = 0;
        let totalMatches = 0;

        matches.forEach(match => {
            if (match.players.includes(player.id)) {
                totalMatches++;
                if (match.winner_id === player.id) {
                    totalWins++;
                }
                else{
                    totalLosses++;
                }
            }
        });


        document.getElementById('totalWins').innerText = totalWins;
        document.getElementById('totalLosses').innerText = totalLosses;
        document.getElementById('totalMatches').innerText = totalMatches;

    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/live-chat');
    }

    document.getElementById('backBtn').addEventListener('click', () => {
        navigateTo('/live-chat');
    });
};
