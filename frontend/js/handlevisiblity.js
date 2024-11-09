const apiUrl = window.config.API_URL;
const apiUri = window.config.API_URI;

export const visibilitychange = (wsPong, visiblity) => {
    sessionStorage.removeItem("whoGiveUp");
    const handleVisibilityChange = async () => {
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
            //sessionStorage.setItem("pongGame", "false");
            //sessionStorage.setItem("snakeGame", "false");
          
            if (modality == 'remote') {
                if (wsPong && wsPong.readyState === WebSocket.OPEN) {
                    if(player.id == playerID)
                        sessionStorage.setItem("whoGiveUp", "IPlayer");
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
    
     const cleanup = () => {
        window.removeEventListener('offline', handleVisibilityChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', handleVisibilityChange);
        history.pushState = originalPushState; 
        history.replaceState = originalReplaceState; 
    };
    

}

