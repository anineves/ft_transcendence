import { navigateTo } from '../../utils.js';


let ws = null;
export function initPongSocket(url) {
    
    const jwttoken = sessionStorage.getItem('jwtToken'); 
    const inviter = sessionStorage.getItem('Inviter'); 
    let wsSession = sessionStorage.getItem('WS');
    let modality2 = sessionStorage.getItem('modality');
    let findOpponent = sessionStorage.getItem('findOpponent');

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
        
        if(inviter == "True" && modality2 == 'remote' && !findOpponent)
        {
            lobbyTimeout = setTimeout(() => {
                ws.send(JSON.stringify({
                    action: 'end_game'
                }));
                console.log("PongSocket 1")
                ws.close();
                navigateTo('/game-selection'); 
            }, 10000);
        }
    };

    ws.onmessage = (event) => {
    
        let data = JSON.parse(event.data)
        if (data.action === 'match_created') {
            //console.log(`Match created with ID: ${data.match_id}`);
        }
        let invitedTimeout = null;
        if(inviter != "True" && modality2 == 'remote' && !findOpponent)
            {
                invitedTimeout = setTimeout(() => {
                    ws.send(JSON.stringify({
                        action: 'end_game'
                    }));
                    console.log("PongSocket 2")
                    ws.close();
                    navigateTo('/game-selection'); 
                }, 10000);
            }
        if (data.action == 'full_lobby' && !findOpponent) {
            if (lobbyTimeout) {
                clearTimeout(lobbyTimeout);
                lobbyTimeout = null;            
            }
            if (invitedTimeout) {
                clearTimeout(invitedTimeout);
                invitedTimeout = null;
            }
            sessionStorage.setItem('playerID', data.message.player);
            sessionStorage.setItem('friendID', data.message.opponent);
            let duelGame = sessionStorage.getItem("duelGame");
            if(duelGame == "duel-snake")
                navigateTo('/snake');
            else
                navigateTo('/pong');
        if (data.message == 'failed_match')
            console.log('Failed Match!')
    }
    }
    ws.onclose = () => {
        ws = null;
        console.log("Closing in InitPocket")
    };
    return ws;
}

export function closePongSocket(ws) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log("PongSocket 3")
        ws.close();  
    }
}