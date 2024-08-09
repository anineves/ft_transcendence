import { navigateTo, checkLoginStatus } from '../utils.js';

export const createPlayer = () => {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="create-player">
            <h2>Create Your Player</h2>
            <form id="playerForm">
               <input type="text" id="nickname" placeholder="Nioickname" required class="form-control mb-2">
               <button type="submit" class="btn">Submit</button>
            </form>
        </div>
    `;

    document.getElementById('playerForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nickname = document.getElementById('nickname').value;
        

        const token = localStorage.getItem('jwtToken');
        
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
                navigateTo('/game-selection'); 
            } else {
                alert('Player creation failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the player.');
        }
    });
};
