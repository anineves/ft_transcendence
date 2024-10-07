export const stats = async () => {
    const app = document.getElementById('app');
    const player = JSON.parse(sessionStorage.getItem('playerInfo'));

    const translations = {
        english: {
            pWin: "Pong Wins",
            pLosses: "Pong Losses",
            pMatches: "Pong Matches",
            sWin: "Snake Wins",
            sLosses: "Snake Losses",
            sMatches: "Snake Matches",
            gameTime: "Gaming time (sec)",
            cleanSheet: "Shutout",
            showBtn: "Show Matches History",
            hideBtn: "Hide Matches History",
            dateInfo: "Date", 
            idInfo: "Id", 
            gameInfo: "Game",
            typeInfo: "Type", 
            resultInfo: "Result",
            durationInfo: "Duration",
            titleMatch: "Match History", 
            
        },
        portuguese: {
            pWin: "Vitorias Pong",
            pLosses: "Derrotas Pong",
            pMatches: "Partidas Pong",
            sWin: "Vitorias Snake",
            sLosses: "Derrotas Snake ",
            sMatches: "Partidas Snake",
            gameTime: "Tempo de Jogo (seg)",
            cleanSheet: "Sem Pontos Sofridos",
            showBtn: "Mostrar Histórico de Partidas",
            hideBtn: "Ocultar Histórico de Partidas",
            dateInfo: "Data", 
            idInfo: "Id", 
            gameInfo: "Jogo",
            typeInfo: "Tipo", 
            resultInfo: "Resultado",
            durationInfo: "Duração",
            titleMatch: "Histórico de Partidas"
        },
        french: {
            pWin: "Pong Vitoires",
            pLosses: "Pong Défaites",
            pMatches: "Matchs de Pong",
            sWin: "Snake Vitoires",
            sLosses: "Snake Défaites",
            sMatches: "Matchs de Snake",
            gameTime: "Temps de Jeu (sec)",
            cleanSheet: "Feuille Propre",
            showBtn: "Afficher l'Historique des Matchs",
            hideBtn: "Cacher l'Historique des Matchs",
            dateInfo: "Date", 
            idInfo: "Id", 
            gameInfo: "Jeu",
            typeInfo: "Type", 
            resultInfo: "Résultat",
            durationInfo: "Durée",
            titleMatch: "Historique des Matchs"
        }
    };
    
    let savedLanguage = localStorage.getItem('language');


    if (!savedLanguage || !translations[savedLanguage]) {
        savedLanguage = 'english'; 
    } 
  ;

    try {
        const response = await fetch('http://localhost:8000/api/matches/');
        const matches = await response.json();

        let pongWins = 0, pongLosses = 0, pongMatches = 0;
        let snakeWins = 0, snakeLosses = 0, snakeMatches = 0;
        let totalPongTime = 0;
        let totalSnakeTime = 0;
        let cleanSheetPong = 0;
        let cleanSheetSnake = 0;
        let matchHistoryRows = '';

        const today = new Date();
        const days = [];
        let pongWinsPerDay = Array(7).fill(0);
        let pongMatchesPerDay = Array(7).fill(0);
        let snakeWinsPerDay = Array(7).fill(0);
        let snakeMatchesPerDay = Array(7).fill(0);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            days.push(formattedDate);
        }

        matches.forEach(match => {
            if (match.players.includes(player.id)) {
                const matchDate = new Date(match.date);
                const matchFormattedDate = `${String(matchDate.getDate()).padStart(2, '0')}/${String(matchDate.getMonth() + 1).padStart(2, '0')}`;
                console.log(match, match.game)
                const dayIndex = days.indexOf(matchFormattedDate);
                if (dayIndex !== -1) {
                    if (match.game == 1) {
                        pongMatches++;
                        pongMatchesPerDay[dayIndex]++;
                        //totalPongTime += convertDurationToSeconds(match.duration);
                        if (match.winner_id === player.id) {
                            pongWins++;
                            pongWinsPerDay[dayIndex]++;
                            if (match.score === '5-0') cleanSheetPong++;
                        } else {
                            pongLosses++;
                        }
                    } else if (match.game == 'snake') {
                        snakeMatches++;
                        snakeMatchesPerDay[dayIndex]++;
                        //totalSnakeTime += convertDurationToSeconds(match.duration);
                        if (match.winner_id === player.id) {
                            snakeWins++;
                            if (match.score === '5-0') cleanSheetSnake++;
                        } else {
                            snakeLosses++;
                        }
                    }
                }

                const result = match.winner_id === player.id ? 'Win' : 'Loss';
                matchHistoryRows += `
                    <tr>
                        <td>${matchDate.toLocaleDateString()}</td>
                        <td>${match.id}</td>
                        <td>${match.game == '1' ? 'Pong' : 'Snake'}</td>
                        <td>${match.match_type}</td>
                        <td>${result}</td>
                        <td>${match.duration}</td>
                    </tr>
                `;
            }
        });

        const indestrutivelTitle = (pongMatches > 0 && pongLosses === 0) ? '<h2>Congrats!!!! You are unbeatable!</h2>' : '';

        app.innerHTML = `
            <div class="stats">
                ${indestrutivelTitle}
                <div class="pong-stats">
                    <h3>Pong</h3>
                    <p><strong>${translations[savedLanguage].pWin}:</strong> <span id="pongWins">${pongWins}</span></p>
                    <p><strong>${translations[savedLanguage].pLosses}:</strong> <span id="pongLosses">${pongLosses}</span></p>
                    <p><strong>${translations[savedLanguage].pMatches}:</strong> <span id="pongMatches">${pongMatches}</span></p>
                    <p><strong>${translations[savedLanguage].gameTime}:</strong> <span id="pongGamingTime">${totalPongTime}</span></p>
                    <p><strong>${translations[savedLanguage].cleanSheet}:</strong> <span id="cleanSheetPong">${cleanSheetPong}</span></p>
                </div>
                <div class="snake-stats">
                    <h3>Snake</h3>
                    <p><strong>${translations[savedLanguage].sWin}:</strong> <span id="snakeWins">${snakeWins}</span></p>
                    <p><strong>${translations[savedLanguage].sLosses}:</strong> <span id="snakeLosses">${snakeLosses}</span></p>
                    <p><strong>${translations[savedLanguage].sMatches}:</strong> <span id="snakeMatches">${snakeMatches}</span></p>
                    <p><strong>${translations[savedLanguage].gameTime}:</strong> <span id="snakeGamingTime">${totalSnakeTime}</span></p>
                    <p><strong>${translations[savedLanguage].cleanSheet}:</strong> <span id="cleanSheetSnake">${cleanSheetSnake}</span></p>
                </div>
                <button id="toggleMatchHistory">${translations[savedLanguage].showBtn}</button>
        <div class="match-history" style="display: none;">
            <h3>${translations[savedLanguage].titleMatch}</h3>
            <div class="match-history-container">
                <table id="matchHistoryTable">
                    <thead>
                        <tr>
                            <th>${translations[savedLanguage].dateInfo}</th>
                            <th>${translations[savedLanguage].idInfo}</th>
                            <th>${translations[savedLanguage].gameInfo}</th>
                            <th>${translations[savedLanguage].typeInfo}</th>
                            <th>${translations[savedLanguage].resultInfo}</th>
                            <th>${translations[savedLanguage].durationInfo}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matchHistoryRows}
                    </tbody>
                </table>
            </div>
        </div>
        <canvas id="victoryChart" width="400" height="200"></canvas>
    </div>
        `;

        const ctx = document.getElementById('victoryChart').getContext('2d');
        const victoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days.reverse(),
                datasets: [
                    {
                        label: `${translations[savedLanguage].pWin}`,
                        data: pongWinsPerDay.reverse(),
                        borderColor: '#00FFFF',
                        backgroundColor: 'rgba(0, 255, 255, 0.2)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: `${translations[savedLanguage].pMatches}`,
                        data: pongMatchesPerDay.reverse(),
                        borderColor: '#FF00FF',
                        backgroundColor: 'rgba(255, 0, 255, 0.2)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: `${translations[savedLanguage].sWin}`,
                        data: snakeWinsPerDay.reverse(),
                        borderColor: '#FFFF00',
                        backgroundColor: 'rgba(255, 255, 0, 0.2)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: `${translations[savedLanguage].sMatches}`,
                        data: snakeMatchesPerDay.reverse(),
                        borderColor: '#FF4500',
                        backgroundColor: 'rgba(255, 69, 0, 0.2)',
                        fill: true,
                        tension: 0.3,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        document.getElementById('toggleMatchHistory').addEventListener('click', () => {
            const matchHistory = document.querySelector('.match-history');
            if (matchHistory.style.display === 'none') {
                matchHistory.style.display = 'block';
                document.getElementById('toggleMatchHistory').innerText = `${translations[savedLanguage].hideBtn}`;
            } else {
                matchHistory.style.display = 'none';
                document.getElementById('toggleMatchHistory').innerText = `${translations[savedLanguage].showBtn}`;
            }
        });

    } catch (error) {
        console.error('Failed to fetch player stats:', error);
        navigateTo('/live-chat');
    }
};


function convertDurationToSeconds(duration) {
    const parts = duration.split(':');
    return (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + (parseInt(parts[2]));
}
