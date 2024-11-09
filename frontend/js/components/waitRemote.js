import { initPongSocket } from './pong/pongSocket.js'

const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;

export const waitRemote = () => {
    let duelGame = sessionStorage.getItem("duelGame");
    if(duelGame == "duel-snake")
    {
        const app = document.getElementById('app');
        app.innerHTML =
        `
        <div class="background-form">
        <h2>Waiting the Opponent Snake</h2>
        </div>
        `;
        sessionStorage.setItem('modality', 'remote');

        const groupName = sessionStorage.getItem("groupName"); 
        
        if (groupName && groupName != 'pongGroup' && groupName != 'snakeGroup')
        {
            const wssocket1= `wss://${apiUri}/ws/snake_match/${groupName}/`
            initPongSocket(wssocket1);
        }
    }
    else{
        const app = document.getElementById('app');
        app.innerHTML =
        `
        <div class="background-form">
        <h2>Waiting the Opponent</h2>
        </div>
        `;
        sessionStorage.setItem('modality', 'remote');
   
        const groupName = sessionStorage.getItem("groupName"); 
        
        if (groupName && groupName != 'pongGroup' && groupName != 'snakeGroup')
        {
            const wssocket2= `wss://${apiUri}/ws/pong_match/${groupName}/`
            initPongSocket(wssocket2);
        }
}
};