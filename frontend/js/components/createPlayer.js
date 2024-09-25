import { navigateTo, checkLoginStatus } from '../utils.js';

export const createPlayer = () => {
    const app = document.getElementById('app');
    const Player = sessionStorage.getItem("playerInfo");
    const user = JSON.parse(sessionStorage.getItem('user'));
    if(Player != null)
    {
        app.innerHTML = `
        <div class="background-form">
            <h2>Player already created</h2>
            <button id="exitBtn"type="submit" class="btn">Exit</button>
        </div>
    `;
    document.getElementById('exitBtn').addEventListener('click', () => navigateTo('/user-panel', user));
    }
    else
    {
    app.innerHTML = `
        <div class="background-form">
            <h2>Create Your Player</h2>
            <form id="playerForm">
               <input type="text" id="nickname" placeholder="Nickname" required class="form-control mb-2">
               <button type="submit" class="btn">Submit</button>
            </form>
        </div>
    `;

    document.getElementById('playerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nickname = document.getElementById('nickname').value;
        
        sessionStorage.setItem('nickname', nickname);
        const token = sessionStorage.getItem('jwtToken');
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/players/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ nickname })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Player created successfully!');
                sessionStorage.setItem('player', JSON.stringify(data.id));
                sessionStorage.setItem('playerInfo', JSON.stringify(data));
                sessionStorage.setItem('playerID', JSON.stringify(data.id));
                sessionStorage.setItem('nickname', JSON.stringify(data.nickname));
                navigateTo('/game-selection'); 
            } else {
                alert('Player creation failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the player.');
        }
    });
    }
};
