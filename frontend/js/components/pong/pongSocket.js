import { navigateTo } from '../../utils.js';
import { visibilitychange } from '../../handlevisiblity.js';

let ws;
if(ws)
{
    console.log("ha ws")
    ws.onclose = () => {
        ws = null;
    };
}
else{
    console.log("nao ha ws")

}

export function initPongSocket(url) {

    const inviter = sessionStorage.getItem('Inviter'); 
    if(inviter == "True")
        sessionStorage.setItem('initPong', 'true');
    
    const jwttoken = sessionStorage.getItem('jwtToken'); 
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
            if(ws)
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
            sessionStorage.setItem('playerID', data.message.player);
            sessionStorage.setItem('friendID', data.message.opponent);
            let duelGame = sessionStorage.getItem("duelGame");
            if(duelGame == "duel-snake")
                navigateTo('/snake');
            else
                navigateTo('/pong');
    }
    }
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