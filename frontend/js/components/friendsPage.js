import { renderRequestPanel } from './requestPanel.js';

export const renderFriendsPage = async (user) => {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="friendship-management-panel background-form">
            <h2>Friendship Management</h2>
            <h3>Friends</h3>
            <ul id="friendsList"></ul> 
            <button id="inviteBtn2" class="btn">Invite friends</button>
            <button id="friendsBtn2" class="btn">Friend Requests</button>
            <div id="inviteSection" style="display: none;">
                <form id="inviteForm">
                    <input type="number" id="friendId" placeholder="Friend ID" class="form-control mb-2" required>
                    <button type="submit" class="btn">Send Request</button>
                </form>
            </div>
        </div>
    `;

    const friendsList = document.getElementById('friendsList');
    
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/player/${user.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.friendship && data.friendship.length > 0) {
                data.friendship.forEach(friendId => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `Friend ID: ${friendId}`;
                    friendsList.appendChild(listItem);
                });
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
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
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
