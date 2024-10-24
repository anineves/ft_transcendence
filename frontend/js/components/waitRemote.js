import { initPongSocket } from './pong/pongSocket.js'

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
        
        if (groupName)
            initPongSocket(`ws://localhost:8000/ws/snake_match/${groupName}/`);
        else
            alert("Something went wrong with groupName")
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
        
        if (groupName)
            initPongSocket(`ws://localhost:8000/ws/pong_match/${groupName}/`);
        else
            alert("Something went wrong with groupName")
}
};

