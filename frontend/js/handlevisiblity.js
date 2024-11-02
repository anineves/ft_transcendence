
export const visibilitychange = (wsPong, visiblity) => {
    const handleVisibilityChange = async () => {
        const pong = sessionStorage.getItem("pongGame")
        console.log()
        if ((window.location.href !== "https://10.0.2.15:8080/pong") && (window.location.href !== "https://10.0.2.15:8080/wait-remote" && pong == 'true')) {
            cleanup();
            return; 
        }
        console.log("fuiii chamada");
        if (visiblity == "true")
        {
            visiblity = "false";
            console.log("Entrei Handle")
            
            const user = sessionStorage.getItem('user');
            const user_json = JSON.parse(user);
            let friendID = sessionStorage.getItem('friendID');
            let playerID = sessionStorage.getItem('player');
            let inviter = sessionStorage.getItem("Inviter");
            let groupName = sessionStorage.getItem('groupName');
            let modality = sessionStorage.getItem('modality');
    
            if (modality == 'remote' || modality == 'tourn-remote') {
                if (wsPong) {
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
        handleVisibilityChange(); // Chama o mesmo handler
    });
    window.addEventListener('beforeunload', () => {
        handleVisibilityChange(); // Chama o mesmo handler
    });
    
    
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        handleVisibilityChange(); 
    };
    
    const originalReplaceState = history.replaceState;
    history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        handleVisibilityChange(); 
    };
    
     const cleanup = () => {
        window.removeEventListener('offline', handleVisibilityChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', handleVisibilityChange);
        history.pushState = originalPushState; 
        history.replaceState = originalReplaceState; 
    };
    

}

