import { context, canvas } from './canvasUtils.js';
import { resetGameState } from './pong.js';


const modality = sessionStorage.getItem('modality');
export function drawScore(playerScore, opponentScore) {
    const currentMatch = JSON.parse(sessionStorage.getItem('currentMatch'));
    
    let player1 = "Player";
    let player2 = "Oponente";
    if (modality == 'tournament') {
        ({ player1, player2 } = currentMatch);
    }


    context.font = "16px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
    context.fillText(`${player1}: ${playerScore}`, 20, 20);
    context.fillText(`${player2}: ${opponentScore}`, canvas.width - 220, 20);
}
export function drawGameOver(playerScore) {
    context.font = "32px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
   
    context.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    context.fillText("Player Score: " + playerScore, canvas.width / 2 - 150, canvas.height / 2 + 50);
}
