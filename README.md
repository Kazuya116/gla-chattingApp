# ChatterBox - Real-Time Chat Application

ChatterBox is a full-stack real-time messaging application built using Node.js, Express, MongoDB, and Socket.IO. The app allows users to register, log in, and engage in private chats with other active users. ChatterBox ensures secure communication with user authentication and supports real-time message delivery, user presence tracking, and instant notifications.

## Features

- **Real-time Messaging**: Send and receive messages instantly using Socket.IO.
- **User Authentication**: Secure user registration and login using bcrypt for password hashing and JWT for session management.
- **Private Chats**: Engage in one-on-one chats with active users.
- **User Presence Tracking**: View and connect with currently active users.
- **Message History**: Access chat history between users.
- **Emoji Support**: Add fun to conversations with emoji integration.
- **Loading Screen**: A smooth user experience with a loading animation before the chat interface loads.

## Tech Stack

### Backend
- **Node.js & Express**: Handles API routes, authentication, and communication with the database.
- **MongoDB & Mongoose**: Stores user data and messages.
- **Socket.IO**: Manages real-time communication between users.
- **JWT**: Used for secure authentication.

### Frontend
- **React**: The frontend is built using React for UI components and state management.
- **Socket.IO-Client**: Allows the client to communicate in real-time with the server.
- **CSS & React-Slick**: Handles the styling and provides a sleek, responsive design for the features section.
- **Emoji-Picker**: Enables users to send emojis in their messages.
- **React-Spinners (HashLoader)**: Provides a loading animation during the initial app load.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB running locally or via a cloud provider (MongoDB Atlas).

### Installation

1. Clone the repository:

2. Navigate into the project directory:

3. Install the backend dependencies:

   ```bash
   npm install
   ```

4. Install the frontend dependencies:

   ```bash
   cd client
   npm install
   ```

### Running the Application

1. Start the backend server:

   ```bash
   node server.js
   ```

2. Start the React client:

   ```bash
   cd client
   npm start
   ```


## API Endpoints

### Auth Routes
- **POST** `/api/register`: Register a new user.
- **POST** `/api/login`: Log in an existing user.

### User Routes
- **GET** `/api/users`: Retrieve a list of active users.

### Message Routes
- **GET** `/api/messages/:userId`: Fetch all messages between the authenticated user and the target user.

## Socket.IO Events

- **`login`**: User logs in, server tracks their socket ID.
- **`sendMessage`**: Sends a message to another user in real-time.
- **`message`**: Receives real-time messages from other users.
- **`activeUsers`**: Updates the list of currently active users.
- **`disconnect`**: Handles user disconnection and updates active users.


## Future Enhancements

- Improve login/logout functionality
- Add functionality for deleting user account
- Improve overall UI
- Add login session management
- Improve overall structure of project
