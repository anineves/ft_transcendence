import { navigateTo } from '../utils.js';
import { resetGameState } from './pong/pong.js';

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
        sessionStorage.setItem('playersCount', '4');
        navigateTo('/tournament-setup');
    });

    document.getElementById('select8Players').addEventListener('click', () => {
        sessionStorage.setItem('playersCount', '8');
        navigateTo('/tournament-setup');
    });
};

export const setupTournament = () => {
    const app = document.getElementById('app');
    const playersCount = sessionStorage.getItem('playersCount');

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

        sessionStorage.setItem('playerNames', JSON.stringify(playerNames));
        initializeTournament();
    });
};

const initializeTournament = () => {
    const players = JSON.parse(sessionStorage.getItem('playerNames'));
    const rounds = [];

    for (let i = 0; i < players.length; i += 2) {
        rounds.push([players[i], players[i + 1]]);
    }

    sessionStorage.setItem('rounds', JSON.stringify(rounds));
    sessionStorage.setItem('currentRound', '0');
    sessionStorage.setItem('winners', '[]');
    startMatch();
};

const startMatch = () => {
    const rounds = JSON.parse(sessionStorage.getItem('rounds'));
    const currentRound = parseInt(sessionStorage.getItem('currentRound'), 10);
    resetGameState();
    if (currentRound < rounds.length) {
        const [player1, player2] = rounds[currentRound];
        sessionStorage.setItem('currentMatch', JSON.stringify({ player1, player2 }));

        setTimeout(() => {
            resetGameState();
            navigateTo('/pong');
        }, 200); 
    } else {
        const winners = JSON.parse(sessionStorage.getItem('winners'));

        if (winners.length > 1) {
            const nextRound = [];
            for (let i = 0; i < winners.length; i += 2) {
                nextRound.push([winners[i][0], winners[i + 1][0]]);
            }
            sessionStorage.setItem('rounds', JSON.stringify(nextRound));
            sessionStorage.setItem('currentRound', '0');
            sessionStorage.setItem('winners', '[]');

            setTimeout(() => {
                startMatch();
            }, 200);  
        } else {
            alert(`Winner of the tournament is ${winners[0][0]}!`);
        }
    }
};


export function endMatch(winner) {
    let winners = JSON.parse(sessionStorage.getItem('winners')) || [];
    winners.push([winner]);
    sessionStorage.setItem('winners', JSON.stringify(winners));

    const currentRound = parseInt(sessionStorage.getItem('currentRound'), 10);
    sessionStorage.setItem('currentRound', currentRound + 1);
    console.log("entrei");
    startMatch();
};
