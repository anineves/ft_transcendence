import { navigateTo } from '../utils.js';
import { resetGameState } from './pong/pong.js';
import { resetGameSnake } from './snake/snake.js';
const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;
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
        repeatName: "Please enter different names for each player.",
        missingNames: "Please fill in all player names before continuing.",
        errorUsername: "The name must contain only letters, numbers, and the '-' symbol.", 
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
        repeatName: "Por favor, insira nomes diferentes para cada jogador.",
        missingNames: "Por favor, preencha todos os nomes dos jogadores antes de continuar.",
        errorUsername: "O nome  deve conter apenas letras, números e o símbolo '-'.",
        
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
        repeatName: "Veuillez entrer des noms différents pour chaque joueur.",
        missingNames: "Veuillez remplir tous les noms des joueurs avant de continuer.",
        errorUsername: "Le nom d'utilisateur doit contenir uniquement des lettres, des chiffres et le symbole '-'.", 
    }
};

let savedLanguage = localStorage.getItem('language');
if (!savedLanguage || !translations[savedLanguage]) {
    savedLanguage = 'english'; 
}

export const selectTournamentPlayers = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="select-players">
        <h2>${translations[savedLanguage].numberPlayers}</h2>
        <div class="button-container"> 
            <button id="select4Players" class="btn">
                <img src="./assets/4players.png" alt="Player" class="button-image-type">
                <p>${translations[savedLanguage].fourPlayers}</p>
            </button>
            <button id="select8Players" class="btn">
                <img src="./assets/8players.png" alt="Player" class="button-image-type">
                <p>${translations[savedLanguage].eightPlayers}</p>
            </button>
        </div>
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
    const nickname2 = sessionStorage.getItem('nickname');
    const nickname = nickname2.replace(/^"|"$/g, '');
    let playersForm = '<div class="player-inputs-container">';

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

    playersForm += `</div>`;

    app.innerHTML = `
        <div class="setup-tournament">
            <h2>${translations[savedLanguage].enterName}</h2>
            <form id="tournamentForm">
                ${playersForm}
                <p id="errorMessage" class="error-message"></p> 
                <button type="submit" class="btn">${translations[savedLanguage].startBtn}</button>
            </form>
        </div>
    `;

    document.getElementById('tournamentForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const nameRegex = /^[a-zA-Z0-9-]+$/; 

        const playerNames = [];
        let allNamesFilled = true;
        const nameSet = new Set();
        const errorMessageElement = document.getElementById('errorMessage');

        
        errorMessageElement.textContent = '';

        for (let i = 1; i <= playersCount; i++) {
            const playerInput = document.getElementById(`player${i}`);
            let playerName = playerInput.value.trim();

            
            if (i === 1 && nickname) {

                playerName = nickname;
            } else if (!playerName) {
               
                allNamesFilled = false;
                break;
            }

            if (nameSet.has(playerName)) {
               
                errorMessageElement.textContent = `${translations[savedLanguage].repeatName}`;
                return;
            }
            if(!nameRegex.test(playerName))
            {
                errorMessageElement.textContent = `${translations[savedLanguage].errorUsername}`;
                return;
            }

            nameSet.add(playerName);
            playerNames.push(playerName);
        }

        if (!allNamesFilled) {
            errorMessageElement.textContent = `${translations[savedLanguage].missingNames}`;
            return;
        }

        sessionStorage.setItem('playerNames', JSON.stringify(playerNames));
        initializeTournament();
    });
};


const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const initializeTournament = () => {
    const modality = sessionStorage.getItem('modality');
    let players = JSON.parse(sessionStorage.getItem('playerNames'));
    if(modality != 'tourn-remote')
        shuffleArray(players)
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
    const nickname2 = sessionStorage.getItem('nickname');
    const nickname = nickname2.replace(/^"|"$/g, '');
    const currentRound = parseInt(sessionStorage.getItem('currentRound'), 10);
    resetGameState();
    resetGameSnake();


    const modality = sessionStorage.getItem('modality');

    const playersInfo = JSON.parse(sessionStorage.getItem('playersInfo')); 

    const playersMap = {};
    if(modality == "remote" || modality == 'tourn-remote')
    {   
        playersInfo.forEach(player => {
            playersMap[player.nickname] = player.id;
        });
    }
    
    if (currentRound < rounds.length) {
        const [player1, player2] = rounds[currentRound];
        if (modality == "remote" && (player1 === nickname || player2 === nickname))
            sessionStorage.setItem("nickTorn", "True"); 
        else 
            sessionStorage.setItem("nickTorn", "False"); 
     
        sessionStorage.setItem('currentMatch', JSON.stringify({ player1, player2 }));
        const match = document.getElementById('match-footer');
            match.innerHTML = `
            <div class="match-footer">
                <p> The next game will be: ${player1} vs ${player2} </p>
            </div>`
        if (modality == 'tourn-remote') {
            const player1Id = playersMap[player1]; 
            const player2Id = playersMap[player2]; 

            
            const groupName = `privateGroup${player1Id}${player2Id}`;
            sessionStorage.setItem("groupName", groupName);

            sessionStorage.setItem('playerID', player1Id);
            sessionStorage.setItem('friendID', player2Id);
            const player = sessionStorage.getItem('player');
            if(player == player1Id)
                sessionStorage.setItem("nickTorn", "True"); 
            else 
                sessionStorage.setItem("nickTorn", "False");
            setTimeout(() => {
            const game = sessionStorage.getItem('game')
            if(game == "pong")
                navigateTo('/pong');
            else if(game == "snake")
                navigateTo('/snake');
            }, 2000); 
        }
        else{
            resetGameState();
            resetGameSnake();
            setTimeout(() => {
                let game = sessionStorage.getItem("game");
                if(game == 'pong')
                    navigateTo('/pong');
                else if(game == 'snake')
                    navigateTo('/snake')
            }, 2000); 
        }
    } else {
        const winners = JSON.parse(sessionStorage.getItem('winners'));
        const giveUptr= sessionStorage.getItem('trGiveUp')
        if(giveUptr == "true")
            return;
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
            sessionStorage.setItem("nickTorn", "False");
            const app = document.getElementById('app');
           app.innerHTML += `<div id="winnerTorn"> 
               <h2>${translations[savedLanguage].winner} ${winners[0][0]} </h2?
           </div>`;
            setTimeout(() => {
                navigateTo('/select-playerOrAI'); 
            },2000);
        
        }
    }
};

export function endMatch(winner) {
    let winners = JSON.parse(sessionStorage.getItem('winners')) || [];
    winners.push([winner]);
    sessionStorage.setItem('winners', JSON.stringify(winners));

    const currentRound = parseInt(sessionStorage.getItem('currentRound'), 10);
    sessionStorage.setItem('currentRound', currentRound + 1);
    startMatch();
};