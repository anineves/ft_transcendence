import { navigateTo } from '../utils.js';

export const renderPlayerProfile = async () => {
    const playerJson = sessionStorage.getItem('playerProfile');

    if (!playerJson) {
        console.error("Player profile not found in session storage.");
        navigateTo('/live-chat');
        return;
    }
    const translations = {
        english: {
            title: "Friend Profile",
            nickFriend: "Nickname:",
            statusFriend: "Status: ",
            idFriend: "ID",
            ttWinsPong: "Total Wins Pong:",
            ttLossesPong: "Total Losses Pong:",
            ttMatchesPong: "Total Match Pong:",
            ttWinsSnake: "Total Wins Snake:",
            ttLossesSnake: "Total Losses Snake:",
            ttMatchesSnake: "Total Match Snake:",
            chatBtn: "Chat",
            gameBtn: "Game", 
            matchHistBnt: "Match History",
            dateInfo: "Date",
            opponentInfo: "Opponent", 
            idInfo: "Id", 
            gameInfo: "Game",
            typeInfo: "Type", 
            resultInfo: "Result",
            durationInfo: "Duration",
            noMatchs: "No matches found"
        },
        portuguese: {
            title: "Perfil do Amigo",
            nickFriend: "Apelido:",
            statusFriend: "Status: ",
            idFriend: "ID",
            ttWinsPong: "Vitórias Totais em Pong:",
            ttLossesPong: "Derrotas Totais em Pong:",
            ttMatchesPong: "Partidas Totais em Pong:",
            ttWinsSnake: "Vitórias Totais em Snake:",
            ttLossesSnake: "Derrotas Totais em Snake:",
            ttMatchesSnake: "Partidas Totais em Snake:",
            chatBtn: "Chat",
            gameBtn: "Jogo",
            matchHistBnt: "Histórico de Partidas",
            dateInfo: "Data",
            opponentInfo: "Oponente",
            idInfo: "Id", 
            gameInfo: "Jogo",
            typeInfo: "Tipo",
            resultInfo: "Resultado",
            durationInfo: "Duração",
            noMatchs: "Nenhuma partida encontrada"
        },
        french: {
            title: "Profil d'Ami",
            nickFriend: "Surnom :",
            statusFriend: "Statut : ",
            idFriend: "ID",
            ttWinsPong: "Total des Victoires en Pong :",
            ttLossesPong: "Total des Défaites en Pong :",
            ttMatchesPong: "Total des Matches en Pong :",
            ttWinsSnake: "Total des Victoires en Snake :",
            ttLossesSnake: "Total des Défaites en Snake :",
            ttMatchesSnake: "Total des Matches en Snake :",
            chatBtn: "Chat",
            gameBtn: "Jeu",
            matchHistBnt: "Historique des Matches",
            dateInfo: "Date",
            opponentInfo: "Adversaire",
            idInfo: "Id", 
            gameInfo: "Jeu",
            typeInfo: "Type", 
            resultInfo: "Résultat",
            durationInfo: "Durée",
            noMatchs: "Aucun match trouvé"
        }
    };
    

    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english';
    }
    ;
    const player = JSON.parse(playerJson);
    const app = document.getElementById('app');
    const defaultAvatar = '../../assets/avatar.png';
    const avatarUrl = player.avatar || defaultAvatar;

    try {
        app.innerHTML = `
            <div class="user-panel">
                <div id="profileSection">
                    <h2>${translations[savedLanguage].title}/h2>
                    <img id="avatarImg" src="${avatarUrl}?${new Date().getTime()}" alt="Player Avatar" class="avatar">
                    <p><strong>${translations[savedLanguage].nickFriend}:</strong> ${player.nickname}</p>
                    <p><strong>${translations[savedLanguage].statusFriend}:</strong> ${player.status}</p>
                    <p><strong>${translations[savedLanguage].idFriend}:</strong> ${player.id}</p>
                    <p><strong>${translations[savedLanguage].ttWinsPong}</strong> <span id="totalWins">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttLossesPong}:</strong> <span id="totalLosses">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttMatchesPong}:</strong> <span id="totalMatches">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttWinsSnake}</strong> <span id="totalWins">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttLossesSnake}:</strong> <span id="totalLosses">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttMatchesSnake}:</strong> <span id="totalMatches">Loading...</span></p>
                    <button id="backBtn" class="btn">${translations[savedLanguage].chatBtn}</button>
                    <button id="gameBtn" class="btn">${translations[savedLanguage].gameBtn}</button>
                    <button id="historyBtn" class="btn">${translations[savedLanguage].matchHistBnt}</button>
                </div>
                <div class="match-history" id="matchHistory" style="display: none;">
                    <h3>${translations[savedLanguage].matchHistBnt}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>${translations[savedLanguage].dateInfo}</th>
                                <th>${translations[savedLanguage].opponentInfo}</th>
                                <th>${translations[savedLanguage].resultInfo}</th>
                                <th>${translations[savedLanguage].typeInfo}</th>
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
