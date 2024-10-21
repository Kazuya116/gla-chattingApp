import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import WhyChooseChatterBox from "./components/WhyChooseChatterBox";
import Footer from "./components/Footer";
import EmojiPicker from "emoji-picker-react";
import { HashLoader } from "react-spinners";

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
  const [showLoginForm, setShowLoginForm] = useState(true); // State to toggle forms
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loginSectionRef = useRef(null);

  const onEmojiClick = (emojiData) => {
    console.log(emojiData.emoji);
    setInputMessage((prevInput) => prevInput + emojiData.emoji);
    setShowPicker(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 3 seconds delay for loading

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

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
          headers: { Authorization: user.token },
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
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        socket.emit("login", data.userId);
        fetchActiveUsers(data.token);
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
      });
      const data = await response.json();
      if (response.ok) {
        setError("Registration successful. Please log in.");
        setShowLoginForm(true); // Show login form after successful registration
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Error registering");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setSelectedUser(null);
    socket.emit("logout");
  };

  const fetchActiveUsers = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: token },
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

  if (isLoading) {
    return (
      <div className="loading-screen">
        <HashLoader size={180} color="#61e092" /> {/* Loading Spinner */}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <h1>
          ChatterBox, Chatting made easy!
          <div>
            <button
              onClick={() => {
                loginSectionRef.current.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Login / Register
            </button>
          </div>
        </h1>
        <p>
          ChatterBox is your go-to platform for seamless real-time messaging.
          Whether you're catching up with old friends, chatting with your team,
          or simply staying in touch with family, ChatterBox makes it all
          possible. Our platform is designed to deliver fast, reliable, and fun
          communication experiences for everyone.
        </p>
        <div className="features-wrapper">
          <div className="features-container">
            <h2 className="features-heading">Key Features</h2>
            <div className="features-list">
              <div className="feature-item">
                <h3>💬 Instant Messaging</h3>
                <p>Exchange messages in real-time with ease.</p>
              </div>
              <div className="feature-item">
                <h3>🔒 Private Chats</h3>
                <p>
                  Stay connected with friends, colleagues, and family through
                  private conversations.
                </p>
              </div>
              <div className="feature-item">
                <h3>⚡ Seamless Experience</h3>
                <p>
                  Enjoy a sleek interface that keeps your chats flowing
                  smoothly, without distractions.
                </p>
              </div>
              <div className="feature-item">
                <h3>🟢 Active Users</h3>
                <p>
                  Easily see who’s online and start conversations in a click.
                </p>
              </div>
            </div>
          </div>
          <img src="/chat1.png" alt="chat" id="chat1" />
        </div>

        <WhyChooseChatterBox />
        <br />
        <br />
        <br />
        <br />
        <div className="auth-wrapper">
          <div>
            <img src="/chat3.png" className="side-image" />
          </div>
          <div className="auth-container">
            <h2>Please login or register.</h2>
            <div className="button-container">
              <button onClick={showLogin}>Login</button>
              <button onClick={showRegister}>Register</button>
            </div>

            {showLoginForm ? (
              <form onSubmit={handleLogin} ref={loginSectionRef}>
                <h2>Already Registered? Login Here!</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button type="submit">Login</button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <h2>New Here? Register!</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
                <button type="submit">Register</button>
              </form>
            )}

            {error && <p className="error">{error}</p>}
          </div>
          <div>
            <img src="/chat2.png" className="side-image right-img" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>ChatterBox, Chatting made easy!</h1>
      <p>
        Welcome, {user.username} to ChatterBox! <br />
        <br />
        <button onClick={handleLogout}>Logout</button>
      </p>
      <div className="chat-container">
        <div className="user-list">
          <h2>Chat with whom?</h2>
          <ul>
            {activeUsers.map((u) => (
              <li
                key={u._id}
                onClick={() => selectUser(u)}
                className={selectedUser?._id === u._id ? "selected" : ""}
              >
                {u.username}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-window">
          {selectedUser ? (
            <>
              <h2>Chat with {selectedUser.username}</h2>
              <div className="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${
                      msg.sender._id === user.userId ? "sent" : "received"
                    }`}
                  >
                    <strong>{msg.sender.username}: </strong>
                    {msg.content}
                  </div>
                ))}
              </div>

              <div className="chat-input-container">
                <form onSubmit={sendMessage} className="chat-form">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                  />

                  <div className="picker-container">
                    <button
                      className="emoji-icon"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPicker((val) => !val)}}
                    >
                      Use Emoji😀
                    </button>

                    {showPicker && (
                      <div className="emoji-picker-wrapper">
                        <EmojiPicker
                          pickerStyle={{ width: "200px" }}
                          onEmojiClick={onEmojiClick}
                        />
                      </div>
                    )}

                    <button type="submit">Send</button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <p>Select someone to start chatting!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
