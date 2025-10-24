````markdown
# Secure Real-Time Chat Application

This is a full-stack, real-time chat application built with a **Django** backend and a **React** frontend. It features a robust OAuth2 authentication system, automatic database-level message encryption, and a live monitoring dashboard to visualize the encrypted data flow.



## Key Features

* **Secure Authentication:** Full user registration and login flow using **OAuth2** for token-based authentication (Access & Refresh tokens).
* **Real-Time Messaging:** Live, bi-directional communication built with **Django Channels** and **WebSockets**.
* **Automatic Encryption:** Messages are automatically encrypted at rest using the **Fernet** (AES) symmetric encryption library. The plaintext content is never stored in the main `Message` table.
* **Decryption Property:** A custom `@property` on the `Message` model provides on-the-fly decryption, so the API only ever serves decrypted content.
* **Telegram-Style Interface:** A modern, responsive chat UI with a room list and active chat window, built with React and `styled-components`.
* **Live Monitoring Dashboard:** A unique page using **Framer Motion** to visualize encrypted messages moving between chat rooms in real-time.
* **Robust API:** A complete REST API built with Django Rest Framework for managing rooms, messages, and user actions.

---

## Tech Stack

### Backend
* **Framework:** Django, Django Rest Framework
* **Real-Time:** Django Channels
* **Authentication:** `django-oauth-toolkit` (OAuth2)
* **Encryption:** `cryptography` (Fernet)
* **Database:** PostgreSQL (recommended) or SQLite
* **Channel Layer:** `channels_redis` (requires a Redis server)
* **Server:** Daphne (ASGI)

### Frontend
* **Library:** React (with Vite)
* **Routing:** `react-router-dom`
* **Styling:** `styled-components` (for the specified color palette)
* **API Client:** `axios`
* **Animations:** `framer-motion`
* **WebSockets:** Native `WebSocket` API

---

## Setup and Installation

You will need two terminals to run the backend and frontend servers.

### 1. Backend (Django)

1.  **Clone the repository:**
    ```bash
    git clone [https://your-repo-url.com/](https://your-repo-url.com/)
    cd your-project/backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Start a Redis server:**
    The easiest way is with Docker:
    ```bash
    docker run -p 6379:6379 -d redis:7
    ```

5.  **Create your `.env` file:**
    In the `backend` root, create a `.env` file and add the following variables.

    ```ini
    # Django
    SECRET_KEY=your-strong-django-secret-key
    DEBUG=True
    
    # OAuth2 (will be created in the next step)
    ID=your-client-id
    SECRET=your-client-secret
    BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
    
    # Encryption (GENERATE THIS ONCE AND SAVE IT)
    FERNET_KEY=your-generated-fernet-key
    ```
    > **To generate a `FERNET_KEY`:**
    > Run `python manage.py shell`, then:
    > ```python
    > from cryptography.fernet import Fernet
    > key = Fernet.generate_key()
    > print(key.decode())
    > ```
    > Copy the output into your `.env` file. **Do not lose this key!**

6.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

7.  **Create the OAuth2 Application:**
    This step is **critical** for login to work.
    ```bash
    python manage.py createapplication --client-type confidential --authorization-grant-type password --name "ChatApp"
    ```
    * This will output a `Client ID` and `Client Secret`.
    * Copy these values into the `ID` and `SECRET` fields in your `.env` file.

8.  **Run the backend server:**
    ```bash
    python manage.py runserver
    ```
    The server will be running at `http://127.0.0.1:8000`.

### 2. Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend  # From the backend directory
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://127.0.0.1:5173` (or a similar port).

---

## API Endpoints

### Authentication
* `POST /api/auth/register/`: Create a new user.
* `POST /oauth/token/`: Log in (using `grant_type: password`) or refresh a token (using `grant_type: refresh_token`).
* `POST /oauth/revoke_token/`: Log out.
* `GET /api/auth/profile/`: Get the authenticated user's profile.

### Chat
* `GET, POST /api/chat/rooms/`: List all rooms or create a new one.
* `GET /api/chat/rooms/<slug>/`: Get details for a single room.
* `GET, POST /api/chat/rooms/<slug>/messages/`: List all messages in a room or send a new message.
* `POST /api/chat/rooms/<slug>/join/`: Join a room.
* `POST /api/chat/rooms/<slug>/leave/`: Leave a room.

### WebSockets
* `ws/chat/<slug>/`: WebSocket endpoint for real-time messages in a room.
````         
