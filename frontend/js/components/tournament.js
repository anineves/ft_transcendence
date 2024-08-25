import { navigateTo } from '../utils.js';

export const selectTournamentPlayers = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="select-players">
            <h2>Select Number of Players</h2>
            <button id="select4Players" class="btn">4 Players</button>
            <button id="select8Players" class="btn">8 Players</button>
        </div>
    `;

    document.getElementById('select4Players').addEventListener('click', () => {
        navigateTo('/tournament-setup');
        localStorage.setItem('playersCount', '4');
    });

    document.getElementById('select8Players').addEventListener('click', () => {
        navigateTo('/tournament-setup');
        localStorage.setItem('playersCount', '8');
    });
};

export const setupTournament = () => {
    const app = document.getElementById('app');
    const playersCount = localStorage.getItem('playersCount');

    let playersForm = '';
    for (let i = 1; i <= playersCount; i++) {
        playersForm += `
            <div class="player-input">
                <label for="player${i}">Player ${i} Name:</label>
                <input type="text" id="player${i}" name="player${i}">
            </div>
        `;
    }

    app.innerHTML = `
        <div class="setup-tournament">
            <h2>Enter Player Names</h2>
            <form id="tournamentForm">
                ${playersForm}
                <button type="submit" class="btn">Start Tournament</button>
            </form>
        </div>
    `;

    document.getElementById('tournamentForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const playerNames = [];
        for (let i = 1; i <= playersCount; i++) {
            playerNames.push(document.getElementById(`player${i}`).value);
        }

        localStorage.setItem('playerNames', JSON.stringify(playerNames));
        initializeTournament();
    });
};

const initializeTournament = () => {
    const players = JSON.parse(localStorage.getItem('playerNames'));
    const rounds = [];

    for (let i = 0; i < players.length; i += 2) {
        rounds.push([players[i], players[i + 1]]);
    }

    localStorage.setItem('rounds', JSON.stringify(rounds));
    localStorage.setItem('currentRound', '0');
    localStorage.setItem('winners', '[]');
    startMatch();
};

const startMatch = () => {
    const rounds = JSON.parse(localStorage.getItem('rounds'));
    const currentRound = parseInt(localStorage.getItem('currentRound'), 10);

    if (currentRound < rounds.length) {
        const [player1, player2] = rounds[currentRound];
        localStorage.setItem('currentMatch', JSON.stringify({ player1, player2 }));
        navigateTo('/pong');  
    } else {
        const winners = JSON.parse(localStorage.getItem('winners'));
        
        if (winners.length > 1) {
            const nextRound = [];
            for (let i = 0; i < winners.length; i += 2) {
                nextRound.push([winners[i][0], winners[i + 1][0]]);
            }
            localStorage.setItem('rounds', JSON.stringify(nextRound));
            localStorage.setItem('currentRound', '0');
            localStorage.setItem('winners', '[]');  
            startMatch();  
        } else {
            
            alert(`Winner of the tournamnt is ${winners[0][0]}!`);
        }
    }
};

export function endMatch(winner) {
    let winners = JSON.parse(localStorage.getItem('winners')) || [];
    winners.push([winner]); 
    localStorage.setItem('winners', JSON.stringify(winners));
    const currentRound = parseInt(localStorage.getItem('currentRound'), 10);
    localStorage.setItem('currentRound', currentRound + 1);

    startMatch();
};
