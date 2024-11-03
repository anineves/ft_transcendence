const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;
import { navigateTo } from "./utils.js";

export const visibilitychange = (wsPong, visiblity) => {
    console.log("visibility: ", visiblity);
    
    sessionStorage.removeItem("whoGiveUp");
    const handleVisibilityChange = async () => {

    
        sessionStorage.setItem('initPong', 'false');
        const pong = sessionStorage.getItem("pongGame")
        const snake = sessionStorage.getItem("snakeGame")
        if ((window.location.href !== `${apiUrl}/pong`) && (window.location.href !== `${apiUrl}/wait-remote` && pong == 'true') && (window.location.href !== `${apiUrl}/snake`) && (window.location.href !== `${apiUrl}/wait-remote` && snake == 'true')) {

            cleanup();
            return; 
        }

        if (visiblity == "true")
        {
            visiblity = "false"
            let friendID = sessionStorage.getItem('friendID');
            let playerID = sessionStorage.getItem('playerID');
            let inviter = sessionStorage.getItem("Inviter");
            let groupName = sessionStorage.getItem('groupName');
            let modality = sessionStorage.getItem('modality');
            let player = JSON.parse(sessionStorage.getItem('playerInfo'));
          
            if (modality == 'remote' || modality == 'tourn-remote') {
                if (wsPong) {
                    if(player.id == playerID)
                    {   
                        sessionStorage.setItem("whoGiveUp", "IPlayer");
                    }
                    wsPong.send(JSON.stringify({
                        'action': 'player_disconnect',
                        'message': {
                            'player_id': playerID,
                            'friend_id': friendID,
                            'inviter': inviter,
                            'group_name': groupName,
                        }
                    }));
                }
                
            }
    }
    };
    
    window.addEventListener('offline', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', () => {
        handleVisibilityChange(); 
    });
    window.addEventListener('beforeunload', () => {
        handleVisibilityChange(); 
    });
    
    
    //const originalPushState = history.pushState;
    //history.pushState = function(...args) {
    //    originalPushState.apply(this, args);
    //    handleVisibilityChange(); 
    //};
    //
    //const originalReplaceState = history.replaceState;
    //history.replaceState = function(...args) {
    //    originalReplaceState.apply(this, args);
    //    handleVisibilityChange(); 
    //};
    
     const cleanup = () => {
        window.removeEventListener('offline', handleVisibilityChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', handleVisibilityChange);
        history.pushState = originalPushState; 
        history.replaceState = originalReplaceState; 
    };
    

}

