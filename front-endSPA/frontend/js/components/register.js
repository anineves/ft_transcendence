import { navigateTo } from '../utils.js';

export const renderRegister = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="register">
            <h2>Register</h2>
            <form id="registerForm">
                <input type="text" id="firstName" placeholder="First Name" required class="form-control mb-2">
                <input type="text" id="lastName" placeholder="Last Name" required class="form-control mb-2">
                <input type="text" id="username" placeholder="Username" required class="form-control mb-2">
                <input type="email" id="email" placeholder="Email" required class="form-control mb-2">
                <input type="password" id="password" placeholder="Password" required class="form-control mb-2">
                <button type="submit" class="btn">Submit</button>
            </form>
        </div>
    `;
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, username, email, password })
            });

            const data = await response.json();
            if (response.status === 201) {
                alert('User registered successfully!');
                navigateTo('/login');
            } else {
                alert('Registration failed: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration');
        }
    });
};
