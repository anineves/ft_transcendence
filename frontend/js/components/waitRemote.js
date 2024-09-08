import { initPongSocket } from './pong/pongSocket.js'


export const waitRemote = () => {
    const app = document.getElementById('app');
    app.innerHTML =
    `
    <div class="background-form">
    <h2>Waiting the Opponent</h2>
    </div>
    `;
    sessionStorage.setItem('modality', 'remote');
    initPongSocket('ws://localhost:8000/ws/pong_match/pong1/');
};


    // <form id="sendinv">
    // <input type="text" id="nickFriend" placeholder="nickname" required class="form-control mb-2">
    // <button id="submit" type="submit" class="btn">Submit</button>
    // </form>
    // <form id="accept-teste">
    // <input type="text" id="nickaccept" placeholder="nickname" required class="form-control mb-2">
    // <button id="submit" type="submit" class="btn">Submit</button>
    // </form>
    
    // document.getElementById('sendinv').addEventListener('submit', async (e) => {
    //     e.preventDefault();
        
        // const playerID = sessionStorage.getItem('player');
        // const friendId = document.getElementById('nickFriend').value;
        // sessionStorage.setItem('playerID', playerID);
        // sessionStorage.setItem('friendID', friendId);
        // sessionStorage.setItem('modality', 'remote');

    //     const players = [playerID, friendId];
    //     console.log("wait ", friendId, " player", playerID)
    //     const game = 1;
        // sessionStorage.setItem('remote', 'invite');
    //     try {
    //         console.log('entrei partida remote');
    //         const response = await fetch('http://localhost:8000/api/matches/', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({ game, players })
    //         });
            
    //         const data = await response.json();
            
    //         if (data) {
    //             console.log('Data:', data);
    //             sessionStorage.setItem('id_match', data.id);
    //         } else {
    //             console.error('Match error', data);
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert('Error occurred while processing match.');
    //     }