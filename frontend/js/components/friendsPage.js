import { renderRequestPanel } from './requestPanel.js';
import { navigateTo } from '../utils.js';

export const renderFriendsPage = async (user) => {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="friendship-management-panel background-form">
            <h2>Friends:</h2>
            <ul id="friendsList"></ul> 
            <button id="inviteBtn2" class="btn">Invite friends</button>
            <button id="friendsBtn2" class="btn">Friend Requests</button>
            <div id="inviteSection" style="display: none;">
                <form id="inviteForm">
                    <input type="text" id="friendId" placeholder="Friend nickname" class="form-control mb-2" required>
                    <button type="submit" class="btn">Send Request</button>
                </form>
            </div>
        </div>
    `;

    const friendsList = document.getElementById('friendsList');
    const player = sessionStorage.getItem('player');

    if (player) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/player/${player}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.friendship && data.friendship.length > 0) {
                    for (let friendId of data.friendship) {
                        try {
                            const friendResponse = await fetch(`http://127.0.0.1:8000/api/player/${friendId}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (friendResponse.ok) {
                                const friendData = await friendResponse.json();
                                console.log(friendData);
                                const listItem = document.createElement('li');
                                const friendButton = document.createElement('button');
                                friendButton.textContent = "•" + friendData.nickname;
                                friendButton.className = 'friend-nickname-btn';

                                friendButton.onclick = () => {
                                    sessionStorage.setItem('playerProfile', JSON.stringify(friendData));
                                    navigateTo('/player-profile');
                                };
                                listItem.appendChild(friendButton);
                                friendsList.appendChild(listItem);
                            } else {
                                console.log(`Failed to load friend with ID: ${friendId}`);
                            }
                        } catch (friendError) {
                            console.error('Error fetching friend data:', friendError);
                        }
                    }
                } else {
                    friendsList.innerHTML = `<li>No friends found</li>`;
                }
            } else {
                alert('Failed to load friends.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while loading friends.');
        }
    } else {
        alert('You need to create a Player');
        navigateTo('/create-player');
    }


    document.getElementById('inviteBtn2').addEventListener('click', () => {
        const inviteSection = document.getElementById('inviteSection');
        inviteSection.style.display = inviteSection.style.display === 'none' ? 'flex' : 'none';
    });

    document.getElementById('friendsBtn2').addEventListener('click', () => {
        renderRequestPanel(user);
    });

    document.getElementById('inviteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const friendId = document.getElementById('friendId').value;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/player/send_friend_request/${friendId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Friend request sent successfully!');
            } else {
                const errorData = await response.json();
                alert('Failed to send friend request: ' + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the friend request.');
        }
    });
};
