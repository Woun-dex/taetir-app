Taetir - The Modern Mentorship Platform
Taetir is a full-stack web application designed to connect mentors and mentees, facilitating professional growth and knowledge sharing. It provides a complete ecosystem for discovering, connecting, communicating, and scheduling sessions in a modern, real-time environment.

✨ Features
👤 Role-Based System: Users can sign up as either a Mentor or a Mentee, with a tailored experience for each role.

🔐 Secure Authentication: Robust authentication system supporting both traditional email/password signup and Google OAuth 2.0 for seamless sign-in.

🖥️ Role-Specific Dashboards: Rich, dynamic dashboards that provide relevant statistics, upcoming events, and actionable items based on the user's role.

🔍 Mentor Discovery: A powerful "Find Mentors" page with live search and filtering capabilities to help mentees find the perfect match.

🤝 Connection Management: A complete connection lifecycle: send, receive, accept, and decline mentorship requests.

💬 Real-Time Messaging: A fully integrated, real-time chat system powered by WebSockets (socket.io) for instant communication between connected users.

📅 Session Scheduling & Calendar: An interactive calendar for viewing and managing sessions. Users can schedule new virtual or in-person sessions with their connections.

📹 Google Meet Integration: Automatically create and attach a unique Google Meet link to virtual sessions for a reliable video conferencing experience.

⭐ Two-Way Feedback System: After a session is completed, both the mentor and mentee can leave a rating and a review, fostering a transparent and high-quality community.

🌙 Light & Dark Mode: A beautifully implemented theme switcher that respects user preferences and provides a polished experience in both light and dark modes.

🖼️ Cloud-Based Image Uploads: User avatars are securely uploaded to and served from Cloudinary, a professional-grade cloud media service.

🐳 Fully Dockerized: The entire application stack (frontend, backend, database, cache) is containerized with Docker and orchestrated with Docker Compose for a consistent and portable development and production environment.

🛠️ Tech Stack
Category

Technology

Frontend

React, TypeScript, Vite, Tailwind CSS, Socket.io Client, Framer Motion, Lucide Icons

Backend

Node.js, Express, Passport.js, PostgreSQL, Redis, Socket.io, Cloudinary, Google APIs (googleapis)

DevOps

Docker, Docker Compose, Nginx

🗄️ Database Schema
The database is designed with a normalized structure to separate concerns and ensure data integrity. The schema is automatically initialized when running the application via Docker.

users: Stores core authentication data, role, and secure tokens.

profiles: Stores common profile information shared by both mentors and mentees (name, bio, avatar).

mentor_profiles: Contains data specific to mentors (e.g., professional experience, skills).

mentee_profiles: Contains data specific to mentees (e.g., learning objectives, education).

connections: Manages the relationship between a mentor and a mentee (pending, accepted, etc.).

sessions: Stores details about scheduled mentorship sessions, including the Google Meet link.

messages: Contains all real-time chat messages between connected users.

reviews: Stores the ratings and comments for completed sessions, allowing for two-way feedback.

🚀 Getting Started
This project is fully containerized. To get a local development environment up and running, you will need Docker and Docker Compose installed on your machine.

1. Clone the Repository
git clone <your-repository-url>
cd taetir-project

2. Configure Environment Variables
You must create a .env file in the root of the server directory. You can copy the provided example file to get started:

cp server/.env.example server/.env

Now, open server/.env and fill in your secret keys. You will need credentials for:

Google OAuth: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from the Google Cloud Console.

Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET from your Cloudinary dashboard.

3. Build and Run the Containers
From the root directory of the project, run the following command:

docker-compose up --build

This command will:

Build the Docker images for your client and server.

Start all four services (client, server, db, db_cache).

The first time it runs, the db container will automatically execute the init.sql script to create your database schema.

4. Access the Application
Frontend: Open your browser and navigate to http://localhost:5173

Backend API: The server is running on http://localhost:5000

Database: The PostgreSQL database is accessible on localhost:5433

You now have a fully functional local development environment with live reloading for both the frontend and backend.