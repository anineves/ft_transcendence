import { navigateTo } from '../../utils.js';

let ws = null;

//Need to get URL dinamically
export function initPongSocket(url='ws://localhost:8000/ws/pong_match/pong1/') {
    
    if (!ws) {
        ws = new WebSocket(url);
    }

    ws.onmessage = (event) => {
    
        let data = JSON.parse(event.data)
        
        console.log("On message Data: ", data)

        if (data.action === 'match_created') {
            console.log(`Match created with ID: ${data.match_id}`);
        }
        if (data.action === 'full_lobby') {
            sessionStorage.setItem('playerID', data.message.player);
            sessionStorage.setItem('friendID', data.message.opponent);
            navigateTo('/pong');
        }
    }

    ws.onclose = () => {
        console.log("WebSocket connection closed.");
        ws = null;
    };

    return ws;
}