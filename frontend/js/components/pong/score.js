import { context, canvas } from './canvasUtils.js';
import { resetGameState } from './pong.js';
import { navigateTo } from '../../utils.js';


export function drawScore(playerScore, opponentScore) {
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    const modality = sessionStorage.getItem('modality');
    let player1 = "Player"
    let player2 = "Oponente";
    if (modality == 'tournament' || modality == "tourn-remote") {
        ({ player1, player2 } = currentMatch);
    }


    context.font = "16px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
    context.fillText(`${player1}: ${playerScore}`, 20, 20);
    context.fillText(`${player2}: ${opponentScore}`, canvas.width - 220, 20);
}
export function drawGameOver(playerScore, opponentScore) {
    context.font = "32px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
   
    const giveUp = sessionStorage.getItem('giveUP');
    if(giveUp == "true")
        context.fillText('Someone GiveUp!',canvas.width / 2 - 90, canvas.height / 2 - 100);
    context.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    context.font = "12px 'Press Start 2P', cursive";
    context.fillText(`Player Score: ${playerScore} Opponente Score: ${opponentScore}`, canvas.width / 2 - 150, canvas.height / 2 + 50);

    const modality = sessionStorage.getItem('modality');
    if (modality == 'remote' || giveUp == 'true') {
        sessionStorage.setItem('giveUP', 'false');
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