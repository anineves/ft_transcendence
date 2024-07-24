export const start4LineGame = () => {
    const line4 = document.getElementById('4line');
    line4.innerHTML = `
        <h2 class="title4-line">4 in a Line</h>
        <div id="gameBoard"></div>
        <button id="resetBtn">O</button>
        <div id="victoryMessage"></div>
    `;

    const gameBoard = document.getElementById('gameBoard');
    const resetBtn = document.getElementById('resetBtn');
    const victoryMessage = document.getElementById('victoryMessage');

    let currentPlayer = 1;
    const rows = 6;
    const cols = 7;
    const board = Array.from({ length: rows }, () => Array(cols).fill(0));

    const createBoard = () => {
        gameBoard.innerHTML = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                gameBoard.appendChild(cell);
            }
        }
    };

    const handleCellClick = (e) => {
        if (victoryMessage.textContent !== '') return; 
        const col = parseInt(e.target.dataset.col);
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                board[r][col] = currentPlayer;
                updateBoard();
                if (checkWin(r, col)) {
                    showVictoryMessage(currentPlayer);
                    return;
                }
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                break;
            }
        }
    };

    const updateBoard = () => {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                cell.classList.remove('player1', 'player2');
                if (board[r][c] === 1) {
                    cell.classList.add('player1');
                } else if (board[r][c] === 2) {
                    cell.classList.add('player2');
                }
            }
        }
    };

    const checkWin = (row, col) => {
        return (
            checkDirection(row, col, 1, 0) || 
            checkDirection(row, col, 0, 1) || 
            checkDirection(row, col, 1, 1) || 
            checkDirection(row, col, 1, -1)   
        );
    };

    const checkDirection = (row, col, rowDir, colDir) => {
        let count = 0;
        for (let i = -3; i <= 3; i++) {
            const r = row + i * rowDir;
            const c = col + i * colDir;
            if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === currentPlayer) {
                count++;
                if (count === 4) return true;
            } else {
                count = 0;
            }
        }
        return false;
    };

    const showVictoryMessage = (winner) => {
        victoryMessage.textContent = `Player ${winner} wins!`;
    };

    resetBtn.addEventListener('click', () => {
        board.forEach(row => row.fill(0));
        currentPlayer = 1;
        victoryMessage.textContent = ''; 
        createBoard();
    });

    createBoard();
};


document.addEventListener('DOMContentLoaded', start4LineGame);
