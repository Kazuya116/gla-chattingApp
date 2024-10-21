const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const MONGO_URL = 'mongodb://localhost:27017/chatapp';
const JWT_SECRET = 'your_jwt_secret'; // Change this to a secure random string

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  content: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get active users
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, '_id username');
    res.json(users.filter(user => user._id.toString() !== req.user._id));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Get messages between two users
app.get('/api/messages/:userId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort('timestamp').populate('sender', 'username').populate('receiver', 'username');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Active users store
const activeUsers = new Map();

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('login', (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit('activeUsers', Array.from(activeUsers.keys()));
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const newMessage = new Message({
        content,
        sender: senderId,
        receiver: receiverId
      });
      await newMessage.save();
      
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username')
        .populate('receiver', 'username');

      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message', populatedMessage);
      }
      socket.emit('message', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    const userId = [...activeUsers.entries()]
      .find(([_, value]) => value === socket.id)?.[0];
    if (userId) {
      activeUsers.delete(userId);
      io.emit('activeUsers', Array.from(activeUsers.keys()));
    }
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));