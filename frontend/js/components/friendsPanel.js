import { navigateTo } from '../utils.js';
const apiUrl = window.config.API_URL;
export const renderPlayerProfile = async () => {
    const playerJson = sessionStorage.getItem('playerProfile');

    if (!playerJson) {
        navigateTo('/game-selection');
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
            nickFriend: "Surnom ",
            statusFriend: "Statut ",
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
    const statusText = player.status === "ON" ? " online" : " offline";  
    const statusIcon = player.status === "ON" ? `<span class="status-icon online"></span>` : `<span class="status-icon offline"></span>`; 

    const avatarUrl = player.avatar || defaultAvatar;

    try {
        app.innerHTML = `
            <div class="user-panel">
                <div id="profileSection">
                    <h2>${translations[savedLanguage].title}</h2>
                    <p><strong>${translations[savedLanguage].nickFriend}:</strong> ${player.nickname}</p>
                    <p><strong>${translations[savedLanguage].statusFriend}:</strong> ${statusIcon}${statusText}</p>
                    <p><strong>${translations[savedLanguage].idFriend}:</strong> ${player.id}</p>
                    <p><strong>${translations[savedLanguage].ttWinsPong}</strong> <span id="totalPongWins">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttLossesPong}:</strong> <span id="totalPongLosses">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttMatchesPong}:</strong> <span id="totalPongMatches">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttWinsSnake}</strong> <span id="totalSnakeWins">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttLossesSnake}:</strong> <span id="totalSnakeLosses">Loading...</span></p>
                    <p><strong>${translations[savedLanguage].ttMatchesSnake}:</strong> <span id="totalSnakeMatches">Loading...</span></p>
                    <button id="backBtn" class="btn">${translations[savedLanguage].chatBtn}</button>
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

        const apiUrl = window.config.API_URL;
        const urlMatches= `${apiUrl}/api/matches/`;
        const response = await fetch(urlMatches, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            }
        });
        const matches = await response.json();

        let totalPongWins = 0;
        let totalPongLosses = 0;
        let totalPongMatches = 0;
        let totalSnakeWins = 0;
        let totalSnakeLosses = 0;
        let totalSnakeMatches = 0;
        let matchHistoryHtml = '';

        matches.forEach(match => {
            if (match.players.includes(player.id)) {
                if(match.game == 1)
                {
                    totalPongMatches++;
                    if (match.winner_id === player.id) {
                        totalPongWins++;
                        matchHistoryHtml += `
                            <tr>
                                <td>${new Date(match.date).toLocaleDateString()}</td>
                                <td>${match.players.find(p => p !== player.id)}</td>
                                <td>Win</td>
                                <td>${match.game}</td>
                            </tr>
                        `;
                    } else {
                        totalPongLosses++;
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
                if(match.game == 2)
                    {
                        totalSnakeMatches++;
                        if (match.winner_id === player.id) {
                            totalSnakeWins++;
                            matchHistoryHtml += `
                                <tr>
                                    <td>${new Date(match.date).toLocaleDateString()}</td>
                                    <td>${match.players.find(p => p !== player.id)}</td>
                                    <td>Win</td>
                                    <td>${match.game}</td>
                                </tr>
                            `;
                        } else {
                            totalSnakeLosses++;
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
            }
        });

        document.getElementById('totalPongWins').innerText = totalPongWins;
        document.getElementById('totalPongLosses').innerText = totalPongLosses;
        document.getElementById('totalPongMatches').innerText = totalPongMatches;
        document.getElementById('totalSnakeWins').innerText = totalSnakeWins;
        document.getElementById('totalSnakeLosses').innerText = totalSnakeLosses;
        document.getElementById('totalSnakeMatches').innerText = totalSnakeMatches;

        // Update match history
        const historyBody = document.getElementById('historyBody');
        if (matchHistoryHtml) {
            historyBody.innerHTML = matchHistoryHtml;
        } else {
            historyBody.innerHTML = '<tr><td colspan="4">No matches found.</td></tr>';
        }

    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/');
    }

    document.getElementById('backBtn').addEventListener('click', () => {
        navigateTo('/game-selection');
    });

    document.getElementById('historyBtn').addEventListener('click', () => {
        const historySection = document.getElementById('matchHistory');
        historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
    });
};