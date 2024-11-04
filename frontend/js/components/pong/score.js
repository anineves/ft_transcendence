import { context, canvas } from './canvasUtils.js';
import { resetGameState } from './pong.js';
import { navigateTo } from '../../utils.js';

const translations = {
    english: {
        player: "Player", 
        opponent: "Opponent", 
        gameOver: "Game Over", 
        giveUp: "Someone gave up!"
    }, 
    portuguese: {
        player: "Jogador",
        opponent: "Adversário",
        gameOver: "Fim de Jogo",
        giveUp: "Alguém desistiu!"
    },
    french: {
        player: "Joueur",
        opponent: "Adversaire",
        gameOver: "Jeu Terminé",
        giveUp: "Quelqu'un abandonne!"
    }
};

export function drawScore(playerScore, opponentScore) {
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage || !translations[savedLanguage]) 
        savedLanguage = 'english'; 
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    let friendID = sessionStorage.getItem('friendID');
    let playerID = sessionStorage.getItem('playerID');
    let player = JSON.parse(sessionStorage.getItem('playerInfo'));
    const modality = sessionStorage.getItem('modality');
    let player1 = translations[savedLanguage].player
    let player2 = translations[savedLanguage].opponent
    const nickname = sessionStorage.getItem('nickname'); 
    if(nickname) {
        if (player.id == friendID) 
            player2 = nickname ? nickname.replace(/^"|"$/g, '') : "";
        else if (player.id == playerID)
            player1 = nickname ? nickname.replace(/^"|"$/g, '') : ""; 
    }
    if (modality == 'tournament' || modality == "tourn-remote") {
        ({ player1, player2 } = currentMatch);
    }


    context.font = "16px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
    context.fillText(`${player1}: ${playerScore}`, 20, 20);
    context.fillText(`${player2}: ${opponentScore}`, canvas.width - 220, 20);
}

export function drawGameOver(playerScore, opponentScore) {
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage || !translations[savedLanguage]) 
        savedLanguage = 'english'; 
    let player1 = translations[savedLanguage].player
    let player2 = translations[savedLanguage].opponent
    const nickname = sessionStorage.getItem('nickname'); 
    if(nickname)
        player1 = nickname ? nickname.replace(/^"|"$/g, '') : ""; 

    const giveUp = sessionStorage.getItem('giveUP');
    const giveUptr= sessionStorage.getItem('trGiveUp');
    if(giveUp == "true" || giveUptr == 'true')
    {
        context.font = "20px 'Press Start 2P', cursive";
        context.fillStyle = "#ff0000";
        context.fillText(`${translations[savedLanguage].giveUp}`,canvas.width / 2 - 200, canvas.height / 2 - 100);
        sessionStorage.setItem('giveUP', 'false');
        sessionStorage.setItem('trGiveUp', 'false');
    }
    
    context.font = "30px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
    context.fillText(`${translations[savedLanguage].gameOver}`, canvas.width / 2 - 180, canvas.height / 2);
    context.font = "25px 'Press Start 2P', cursive";
    context.fillText(`${player1}: ${playerScore} | ${player2}: ${opponentScore}`, canvas.width / 3 - 185, canvas.height / 2 + 50);

    const modality = sessionStorage.getItem('modality');
    if (modality == 'remote'  || giveUp == 'true' || giveUptr == 'true') {
        sessionStorage.setItem('giveUP', 'false')
        
        setTimeout(() => {
            navigateTo('/live-chat');
        }, 5000);
    }
    else if(modality != 'tournament' && modality != 'tourn-remote'){
        setTimeout(() => {
            navigateTo('/select-playerOrAI');
        }, 5000);

    }
}