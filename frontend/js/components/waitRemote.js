import { navigateTo } from '../utils.js';
import { movePaddle } from './pong/canvasUtils.js';

export const waitRemote = () => {
    const app = document.getElementById('app');
    app.innerHTML = 
    `
         <div class="background-form">
            <h2>Invite Your Friend</h2>
            <form id="playerForm2">
               <input type="text" id="nickFriend" placeholder="nickname" required class="form-control mb-2">
               <button type="submit" class="btn">Submit</button>
               <button type="submit" class="btn">Accept</button>
            </form>
        </div>
    `;

    document.getElementById('playerForm2').addEventListener('submit', async (e) => 
        {
        e.preventDefault(); 

        const user = sessionStorage.getItem('user');
        const user_json = JSON.parse(user);
        const playerID = sessionStorage.getItem('player');
        const friendId = document.getElementById('nickFriend').value;
        sessionStorage.setItem('playerID', playerID);
        sessionStorage.setItem('friendID', friendId);
        const players = [playerID, friendId];
        console.log("wait " , friendId," player", playerID)
        const game = 1;

        try {
            console.log('entrei partida aqui');
            const response = await fetch('http://localhost:8000/api/matches/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ game, players })
            });
            console.log("teste aqui");

            const data = await response.json();
            console.log("teste ", data);

            if (data) {
                console.log('Data:', data);
                sessionStorage.setItem('id_match', data.id);
            } else {
                console.error('Match error', data);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error occurred while processing match.');
        }

    const ws = new WebSocket('ws://localhost:8000/ws/pong_match/pong1/');  //Change /pong1/


        console.log('user_id')
        console.log(user_json['id'])

        ws.onopen = () => {
            ws.send(JSON.stringify({ 
                'action': 'create_match',
                'user': user_json,
                'game': 1,
                'players': [playerID, friendId]
            }));
        }
        ws.onmessage = (event) => {
            console.log('On message event: ')
            console.log(event.data)

            let data = JSON.parse(event.data)

            if (data.action === 'match_created') {
                console.log(`Match created with ID: ${data.match_id}`);
            }

            movePaddle(data);
        }

        document.addEventListener('keydown', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                console.log("Arrow Up/Down -> Keydown")

                ws.send(JSON.stringify({
                    'action': 'move',
                    'user': user_json,
                    'key': event.key
                }));
            }
        });


        document.addEventListener('keyup', function (event) {
            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                console.log("Arrow Up/Down -> Keyup")

                ws.send(JSON.stringify({
                    'user': user_json,
                    'key': event.key
                }));

                // stopPaddle(event);
            }
        });

        document.addEventListener('keyup', function (event) {
            if (['w', 'W', 's', 'S'].includes(event.key) && user_json['id'] === 1) {
                console.log("W/S -> Keyup")

                ws.send(JSON.stringify({
                    'user': user_json,
                    'key': event.key
                }));

                // stopPaddle(event);
            }
        });
        navigateTo('/pong');
})

document.getElementById('playerForm2').addEventListener('submit', async (e) => 
    {
    e.preventDefault(); 

    const user = sessionStorage.getItem('user');
    const user_json = JSON.parse(user);
    const playerID = sessionStorage.getItem('player');
    const friendId = document.getElementById('nickFriend').value;
    sessionStorage.setItem('playerID', playerID);
    sessionStorage.setItem('friendID', friendId);
    console.log("wait " , friendId," player", playerID);

   
const ws = new WebSocket('ws://localhost:8000/ws/pong_match/pong1/');  //Change /pong1/


    console.log('user_id')
    console.log(user_json['id'])

    ws.onmessage = (event) => {
        console.log('On message event: ')
        console.log(event.data)

        let data = JSON.parse(event.data)

        if (data.action === 'match_created') {
            console.log(`Match created with ID: ${data.match_id}`);
        }

        movePaddle(data);
    }

    document.addEventListener('keydown', function (event) {
        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            console.log("Arrow Up/Down -> Keydown")

            ws.send(JSON.stringify({
                'action': 'move',
                'user': user_json,
                'key': event.key
            }));
        }
    });


    document.addEventListener('keyup', function (event) {
        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
            console.log("Arrow Up/Down -> Keyup")

            ws.send(JSON.stringify({
                'user': user_json,
                'key': event.key
            }));

            // stopPaddle(event);
        }
    });

    document.addEventListener('keyup', function (event) {
        if (['w', 'W', 's', 'S'].includes(event.key) && user_json['id'] === 1) {
            console.log("W/S -> Keyup")

            ws.send(JSON.stringify({
                'user': user_json,
                'key': event.key
            }));

            // stopPaddle(event);
        }
    });
    navigateTo('/pong');
})

};