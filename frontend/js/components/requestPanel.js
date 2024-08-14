export const renderRequestPanel = (user) => {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="friend-requests-panel background-form">
            <h2>Friend Requests</h2>
            <div id="receivedRequestsSection">
                <h3>Received Requests</h3>
                <ul id="receivedRequestsList"></ul>
            </div>
            <div id="sentRequestsSection">
                <h3>Sent Requests</h3>
                <ul id="sentRequestsList"></ul>
            </div>
        </div>
    `;

    const displayRequests = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/player/requests/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const receivedRequestsList = document.getElementById('receivedRequestsList');
                const sentRequestsList = document.getElementById('sentRequestsList');

                receivedRequestsList.innerHTML = '';
                sentRequestsList.innerHTML = '';

                data.forEach(request => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${request.sender} sent you a friend request`;

                    if (request.invited === user.username) {
                        const acceptButton = document.createElement('button');
                        acceptButton.textContent = 'Accept';
                        acceptButton.addEventListener('click', () => handleFriendRequest(request.id, true));

                        const rejectButton = document.createElement('button');
                        rejectButton.textContent = 'Reject';
                        rejectButton.addEventListener('click', () => handleFriendRequest(request.id, false));

                        listItem.appendChild(acceptButton);
                        listItem.appendChild(rejectButton);
                        receivedRequestsList.appendChild(listItem);
                    } else if (request.sender === user.username) {
                        listItem.textContent = `You sent a friend request to ${request.invited}`;
                        sentRequestsList.appendChild(listItem);
                    }
                });
            } else {
                alert('Failed to load friend requests.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while loading friend requests.');
        }
    };

    const handleFriendRequest = async (requestId, accepted) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/player/responde_friend_request/${requestId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accepted })
            });

            if (response.ok) {
                displayRequests();  
            } else {
                alert('Failed to update friend request.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the friend request.');
        }
    };

    displayRequests();
};