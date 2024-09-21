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
                    <p><strong>Nickname:</strong> ${player.nickname}</p>
                    <p><strong>Status:</strong> ${player.status}</p>
                    <p><strong>Id:</strong> ${player.id}</p>
                    <p><strong>Total Wins:</strong> <span id="totalWins">Loading...</span></p>
                    <p><strong>Total Losses:</strong> <span id="totalLosses">Loading...</span></p>
                    <p><strong>Total Matches:</strong> <span id="totalMatches">Loading...</span></p>
                    <button id="backBtn" class="btn">Chat</button>
                    <button id="gameBtn" class="btn">Game</button>
                    <button id="historyBtn" class="btn">Match History</button>
                </div>
                <div class="match-history" id="matchHistory" style="display: none;">
                    <h3>Match History</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Opponent</th>
                                <th>Result</th>
                                <th>Game Type</th>
                            </tr>
                        </thead>
                        <tbody id="historyBody">
                            <tr>
                                <td colspan="4">Loading...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        const response = await fetch('http://localhost:8000/api/matches/');
        const matches = await response.json();

        let totalWins = 0;
        let totalLosses = 0;
        let totalMatches = 0;
        let matchHistoryHtml = '';

        matches.forEach(match => {
            if (match.players.includes(player.id)) {
                totalMatches++;
                if (match.winner_id === player.id) {
                    totalWins++;
                    matchHistoryHtml += `
                        <tr>
                            <td>${new Date(match.date).toLocaleDateString()}</td>
                            <td>${match.players.find(p => p !== player.id)}</td>
                            <td>Win</td>
                            <td>${match.game}</td>
                        </tr>
                    `;
                } else {
                    totalLosses++;
                    matchHistoryHtml += `
                        <tr>
                            <td>${new Date(match.date).toLocaleDateString()}</td>
                            <td>${match.players.find(p => p !== player.id)}</td>
                            <td>Loss</td>
                            <td>${match.game}</td>
                        </tr>
                    `;
                }
            }
        });

        document.getElementById('totalWins').innerText = totalWins;
        document.getElementById('totalLosses').innerText = totalLosses;
        document.getElementById('totalMatches').innerText = totalMatches;

        // Update match history
        const historyBody = document.getElementById('historyBody');
        if (matchHistoryHtml) {
            historyBody.innerHTML = matchHistoryHtml;
        } else {
            historyBody.innerHTML = '<tr><td colspan="4">No matches found.</td></tr>';
        }

    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/live-chat');
    }

    document.getElementById('backBtn').addEventListener('click', () => {
        navigateTo('/live-chat');
    });

    document.getElementById('gameBtn').addEventListener('click', () => {
        navigateTo('/game-selection');
    });

    document.getElementById('historyBtn').addEventListener('click', () => {
        const historySection = document.getElementById('matchHistory');
        historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
    });
};
