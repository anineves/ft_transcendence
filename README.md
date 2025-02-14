ft_transcendence

📌 About the Project
ft_transcendence is a project developed within the 42 School context, designed to provide an interactive web experience based on the Pong game, 
featuring authentication, real-time multiplayer, and a user profile system. The goal is to apply modern full-stack web development concepts, 
including OAuth authentication, WebSockets, and secure architecture.


🚀 Features:
🔑 Secure Authentication: Supports login via OAuth2 and two-factor authentication (2FA).
🎮 Multiplayer Pong Game: Play real-time matches against other users
📊 Ranking and Profile System: User profiles with statistics and a scoring system.
💬 Real-Time Chat: Communication between players via WebSockets.
🛡️ Enhanced Security: Protection against common attacks such as SQL Injection and Cross-Site Scripting (XSS).


🛠️ Technologies Used:

Frontend: JavaScript

Backend: Django, PostgreSQL

Authentication: OAuth2, 2FA

Real-Time Communication: WebSockets

Database: PostgreSQL

Docker: Facilitates deployment and development environment


📦Requirements

Docker & Docker Compose

PostgreSQL

🔧How to Run the Project:

Clone the repository:
git clone https://github.com/anineves/ft_transcendence.git
cd ft_transcendence

Configure environment variables:
cp .env.example .env
Fill in the credentials in the .env file.

Build and start the containers with Docker:
docker-compose up --build

The frontend will be available at http://localhost:8443.




https://github.com/user-attachments/assets/2e6caa78-164f-4501-b77a-e672be6c02fb

