const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = 'Pavarotti69';
const vipUsers = new Set();

app.use(express.static('public'));

// Track connected users
let users = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining with info
  socket.on('join', (userInfo) => {
    const isVIP = vipUsers.has(userInfo.nickname);
    users[socket.id] = {
      ...userInfo,
      vip: isVIP
    };
    socket.username = userInfo.nickname;

    // Broadcast user joined
    socket.broadcast.emit('message', `${userInfo.nickname} joined the chat`);

    // Update user list
    updateUserList();
  });

  // Handle chat messages
  socket.on('chatMessage', (msg) => {
    const user = users[socket.id];
    if (user) {
      io.emit('message', `${user.nickname}: ${msg}`);
    }
  });

  // Handle VIP add request
  socket.on('addVip', ({ username, password }) => {
    if (password === ADMIN_PASSWORD) {
      vipUsers.add(username);

      // Update existing users if they're now VIP
      for (const id in users) {
        if (users[id].nickname === username) {
          users[id].vip = true;
        }
      }

      socket.emit('vipAddResult', {
        success: true,
        message: `${username} added as VIP.`
      });

      updateUserList();
    } else {
      socket.emit('vipAddResult', {
        success: false,
        message: 'Incorrect admin password.'
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.emit('message', `${user.nickname} left the chat`);
      delete users[socket.id];
      updateUserList();
    }
  });

  // Function to broadcast updated user list
  function updateUserList() {
    const userList = Object.values(users);
    io.emit('userList', userList);
  }
});

// Start server
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
