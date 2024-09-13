import { navigateTo } from '../../utils.js';

let ws = null;
const jwttoken = sessionStorage.getItem('jwtToken'); 

export function initPongSocket(url) {
    
    if (!ws) {
        ws = new WebSocket(url);
    }

    ws.onopen = function (event) {
        console.log("Connected to Pong WebSocket");
        ws.send(JSON.stringify({
            Authorization: jwttoken,
        }));
    };

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