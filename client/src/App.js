import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "./components/Footer";
import EmojiPicker from "emoji-picker-react";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [error, setError] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const loginSectionRef = useRef(null);
  const pickerRef = useRef(null);

  const onEmojiClick = (emojiData) => {
    setInputMessage((prevInput) => prevInput + emojiData.emoji);
    setShowPicker(false);
  };

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("activeUsers", (users) => {
      setActiveUsers(users.filter((id) => id !== user?.userId));
    });

    return () => {
      socket.off("message");
      socket.off("activeUsers");
    };
  }, [user]);

  useEffect(() => {
    if (user && selectedUser) {
      fetchMessages();
    }
  }, [user, selectedUser]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${selectedUser._id}`,
        {
          credentials: "include", // Include cookies with the request
        }
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage && user && selectedUser) {
      socket.emit("sendMessage", {
        senderId: user.userId,
        receiverId: selectedUser._id,
        content: inputMessage,
      });
      setInputMessage("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
        credentials: "include", // Include cookies with the request
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data); // Expecting the user data from the response
        socket.emit("login", data.userId);
        fetchActiveUsers(); // No need for token now
        setError("");
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Error logging in");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
        }),
        credentials: "include", // Include cookies with the request
      });
      const data = await response.json();
      if (response.ok) {
        setError("Registration successful. Please log in.");
        setShowLoginForm(true);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Error registering");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include", // Include cookies with the request
      });
      setUser(null);
      setMessages([]);
      setSelectedUser(null);
      socket.emit("logout");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        credentials: "include", // Include cookies with the request
      });
      const data = await response.json();
      setActiveUsers(data);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  const selectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    setMessages([]);
  };

  const showLogin = () => setShowLoginForm(true);
  const showRegister = () => setShowLoginForm(false);

  const emojiPickerStyles = {
    position: "absolute",
    bottom: "100%",
    right: "0",
    zIndex: 9999, // Ensure picker appears above other elements
    marginBottom: "10px", // Add some spacing from the input
  };

  if (!user) {
    return (
      <div className="container-fluid p-0">
        {/* Hero Section */}
        <div className="bg-light py-5 mb-5">
          <div className="container text-center">
            <h1 className="display-4 fw-bold text-primary mb-4">
              ChatterBox, Chatting made easy!
            </h1>
            <button
              className="btn btn-primary btn-lg px-4 mb-4"
              onClick={() => {
                loginSectionRef.current.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Login / Register
            </button>
            <p className="lead px-4 text-muted">
              ChatterBox is your go-to platform for seamless real-time
              messaging. Whether you're catching up with old friends, chatting
              with your team, or simply staying in touch with family, ChatterBox
              makes it all possible. Our platform is designed to deliver fast,
              reliable, and fun communication experiences for everyone.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mb-5">
          <h2 className="text-center mb-4 fw-bold text-primary">
            Key Features
          </h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center">
                  <h3 className="h4 mb-3">💬 Instant Messaging</h3>
                  <p className="text-muted">
                    Exchange messages in real-time with ease.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center">
                  <h3 className="h4 mb-3">🔒 Private Chats</h3>
                  <p className="text-muted">
                    Stay connected through private conversations.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center">
                  <h3 className="h4 mb-3">⚡ Seamless Experience</h3>
                  <p className="text-muted">
                    Enjoy a sleek interface without distractions.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center">
                  <h3 className="h4 mb-3">🟢 Active Users</h3>
                  <p className="text-muted">
                    See who's online and start conversations easily.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-0 shadow">
                <div className="card-body p-4">
                  <h2 className="text-center mb-4 text-primary">
                    Welcome to ChatterBox
                  </h2>
                  <div className="d-flex justify-content-center gap-3 mb-4">
                    <button
                      className={`btn ${
                        showLoginForm ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={showLogin}
                    >
                      Login
                    </button>
                    <button
                      className={`btn ${
                        !showLoginForm ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={showRegister}
                    >
                      Register
                    </button>
                  </div>

                  {showLoginForm ? (
                    <form
                      onSubmit={handleLogin}
                      ref={loginSectionRef}
                      className="needs-validation"
                    >
                      <h3 className="h4 text-center mb-4 text-secondary">
                        Already Registered? Login Here!
                      </h3>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Username"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 btn-lg mb-3"
                      >
                        Login
                      </button>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleRegister}
                      className="needs-validation"
                    >
                      <h3 className="h4 text-center mb-4 text-secondary">
                        New Here? Register!
                      </h3>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="Username"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 btn-lg mb-3"
                      >
                        Register
                      </button>
                    </form>
                  )}

                  {error && (
                    <div className="alert alert-danger text-center">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row py-3 bg-light border-bottom">
        <div className="col-12 text-center">
          <h1 className="h3 text-primary mb-0">ChatterBox</h1>
          <p className="mb-2">
            Welcome, <span className="fw-bold">{user.username}</span>!
            <button
              className="btn btn-outline-danger btn-sm ms-3"
              onClick={handleLogout}
            >
              Logout
            </button>
          </p>
        </div>
      </div>

      <div className="row flex-grow-1 overflow-hidden">
        <div className="col-md-3 border-end p-0">
          <div className="p-3 bg-light border-bottom">
            <h2 className="h5 mb-0">Active Users</h2>
          </div>
          <div
            className="list-group list-group-flush overflow-auto"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {activeUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => selectUser(u)}
                className={`list-group-item list-group-item-action ${
                  selectedUser?._id === u._id ? "active" : ""
                }`}
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-9 p-0 d-flex flex-column">
          {selectedUser ? (
            <>
              <div className="p-3 bg-light border-bottom">
                <h2 className="h5 mb-0">Chat with {selectedUser.username}</h2>
              </div>
              <div
                className="flex-grow-1 p-3 overflow-auto"
                style={{ maxHeight: "calc(100vh - 250px)" }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`d-flex mb-3 ${
                      msg.sender._id === user.userId
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`rounded p-3 ${
                        msg.sender._id === user.userId
                          ? "bg-primary text-white"
                          : "bg-light border"
                      }`}
                      style={{ maxWidth: "75%" }}
                    >
                      <div className="small mb-1 opacity-75">
                        {msg.sender.username}
                      </div>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-top bg-light position-relative">
                <form onSubmit={sendMessage} className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                  <div className="position-relative">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPicker((prev) => !prev);
                      }}
                    >
                      😀
                    </button>
                    {showPicker && (
                      <div style={emojiPickerStyles} ref={pickerRef}>
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          width={300}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              <p className="mb-0">Select someone to start chatting!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;