// login.js
import { navigateTo } from '../utils.js';

export const renderLogin = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="login">
            <h2>Login</h2>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Email" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <button type="submit" class="btn">Login</button>
            </form>
        </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.status === 200) {
                alert('Login successful!');
                navigateTo('/game-selection');
            } else {
                alert('Login failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    });
};
