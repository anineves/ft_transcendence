import { navigateTo } from '../utils.js';
import { resetGameState } from './pong/pong.js';

const translations = {
    english: {
        numberPlayers: "Select Number of Players",
        fourPlayers: "4 Players",
        eightPlayers: "8 Players",
        playert: "Player ",
        namet: "Name ", 
        enterName: "Enter Player Names",
        startBtn: "Start Tournament",
        winner: "Winner of the tournament is ",
    },
    portuguese: {
        numberPlayers: "Selecionar Número de Jogadores",
        fourPlayers: "4 Jogadores",
        eightPlayers: "8 Jogadores",
        playert: "Jogador ",
        namet: "Nome ", 
        enterName: "Insira os Nomes dos Jogadores",
        startBtn: "Iniciar Torneio",
        winner: "O vencedor do torneio é ",
    },
    french: {
        numberPlayers: "Sélectionnez le Nombre de Joueurs",
        fourPlayers: "4 Joueurs",
        eightPlayers: "8 Joueurs",
        playert: "Joueur ",
        namet: "Nom ", 
        enterName: "Entrez les Noms des Joueurs",
        startBtn: "Démarrer le Tournoi",
        winner: "Le vainqueur du tournoi est ",
    }
};

let savedLanguage = localStorage.getItem('language');


if (!savedLanguage || !translations[savedLanguage]) {
    savedLanguage = 'english'; 
} 
;
export const selectTournamentPlayers = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="select-players">
            <h2>${translations[savedLanguage].numberPlayers}</h2>
            <button id="select4Players" class="btn">${translations[savedLanguage].fourPlayers}</button>
            <button id="select8Players" class="btn">${translations[savedLanguage].eightPlayers}</button>
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
    const nickname = sessionStorage.getItem('nickname');
    let playersForm = '';
    playersForm += `<div class="player-inputs-container">`;

    for (let i = 1; i <= playersCount; i++) {
        if (i === 1 && nickname) {
            playersForm += `
                <div class="player-input">
                    <label for="player${i}">${translations[savedLanguage].playert} ${i} ${translations[savedLanguage].namet}:</label>
                    <span>${nickname}</span>
                    <input type="hidden" id="player${i}" name="player${i}" value="${nickname}">
                </div>`;
        } else {
            playersForm += `
                <div class="player-input">
                    <label for="player${i}">${translations[savedLanguage].playert}${i} ${translations[savedLanguage].namet}:</label>
                    <input type="text" id="player${i}" name="player${i}">
                </div>`;
        }
    }

    playersForm += `</div>`; // Fechando o contêiner

    app.innerHTML = `
        <div class="setup-tournament">
            <h2>${translations[savedLanguage].enterName}</h2>
            <form id="tournamentForm">
                ${playersForm}
                <button type="submit" class="btn">${translations[savedLanguage].startBtn}</button>
            </form>
        </div>
    `;
   
    document.getElementById('tournamentForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const playerNames = [];
        for (let i = 1; i <= playersCount; i++) {
            const playerName = document.getElementById(`player${i}`).value || nickname; 
            playerNames.push(playerName);
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
            alert(`${translations[savedLanguage].winner} ${winners[0][0]}!`);
            navigateTo('/select-playerOrAI'); 
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
