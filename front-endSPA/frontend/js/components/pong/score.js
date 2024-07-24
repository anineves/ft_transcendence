import { context, canvas } from './canvasUtils.js';

export function drawScore(playerScore, opponentScore) {
    context.font = "16px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
    context.fillText("Player: " + playerScore, 20, 20);
    context.fillText("Opponent: " + opponentScore, canvas.width - 220, 20);
}

export function drawGameOver(playerScore) {
    context.font = "32px 'Press Start 2P', cursive";
    context.fillStyle = "#ffcc00";
    context.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    context.fillText("Player Score: " + playerScore, canvas.width / 2 - 150, canvas.height / 2 + 50);
}
