import { navigateTo } from '../../utils.js';


let ws = null;
export function initPongSocket(url) {
    
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    const inviter = sessionStorage.getItem('Inviter'); 
    let wsSession = sessionStorage.getItem('WS');
    let modality2 = sessionStorage.getItem('modality');

    if (wsSession == "clean")
    {
        ws = null;
        sessionStorage.removeItem('WS');
    }

    if (!ws) {
        ws = new WebSocket(url);
    }
    
    let lobbyTimeout = null;

    ws.onopen = function (event) {
        ws.send(JSON.stringify({
            Authorization: jwttoken,
        }));
        
        if(inviter == "True" && modality2 == 'remote')
        {
            lobbyTimeout = setTimeout(() => {
                console.log("The opponent did not accept the duel");
                ws.send(JSON.stringify({
                    action: 'end_game'
                }));
                ws.close();
                navigateTo('/live-chat'); 
            }, 10000);
        }
    };

    ws.onmessage = (event) => {
    
        let data = JSON.parse(event.data)
        
        if (data.action === 'match_created') {
            console.log(`Match created with ID: ${data.match_id}`);
        }
        if (data.action == 'full_lobby') {
            if (lobbyTimeout) {
                clearTimeout(lobbyTimeout);
                lobbyTimeout = null;
            }
            console.log("Lobby is full");
            sessionStorage.setItem('playerID', data.message.player);
            sessionStorage.setItem('friendID', data.message.opponent);
            let duelGame = sessionStorage.getItem("duelGame");
            if(duelGame == "duel-snake")
            {
                navigateTo('/snake');
            }
            else{
                navigateTo('/pong');
            }
    }
    }
    console.log("Enteiiiiiiiiii");
    ws.onclose = () => {
        ws = null;
    };
    return ws;
}

export function closePongSocket(ws) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();  
    }
    ws.onclose = () => {
        ws = null;
    };
}