import { navigateTo } from '../utils.js';

export const renderMenu = () => {
    const app = document.getElementById('app'); //Obtém o elemento de conteúdo principal
    app.innerHTML = `
        <div class="menu">
            <h1>FT TRANSCENDENCE</h1>
            <h2>Welcome to the Django</h2>
            <div class="btn-container">
                <button id="startGameBtn" class="btn">
                    <img src="./assets/play.png" alt="Pong" class="button-image">
                </button>
            </div>
        </div>
    `;

    const button = document.getElementById('startGameBtn');

   
    let xSpeed = 4;
    let ySpeed = 5; 

    const moveButton = () => {
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let currentX = parseFloat(button.style.left) || 0;
        let currentY = parseFloat(button.style.top) || 0;

        currentX += xSpeed;
        currentY += ySpeed;

        if (currentX + buttonWidth > viewportWidth) {
            currentX = viewportWidth - buttonWidth;
            xSpeed = -xSpeed;
        } else if (currentX < 0) {
            currentX = 0;
            xSpeed = -xSpeed;
        }

        if (currentY + buttonHeight > viewportHeight) {
            currentY = viewportHeight - buttonHeight;
            ySpeed = -ySpeed;
        } else if (currentY < 0) {
            currentY = 0;
            ySpeed = -ySpeed;
        }

        button.style.left = `${currentX}px`;
        button.style.top = `${currentY}px`;
    };


    const intervalId = setInterval(moveButton, 18);

    button.addEventListener('click', () => {

        clearInterval(intervalId);
        navigateTo('/game-selection');
    });

 
    button.style.position = 'absolute';
    button.style.left = '0px';
    button.style.top = '0px';

    document.body.style.overflow = 'hidden';
};