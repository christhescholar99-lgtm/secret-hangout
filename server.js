const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Keep track of connected users
let users = {};

io.on('connection', (socket) => {
  // Assign random guest name
  const guestName = 'Guest' + Math.floor(Math.random() * 10000);
  socket.username = guestName;
  users[socket.id] = guestName;

  // Send updated user list to all
  io.emit('userList', Object.values(users));

  // Notify everyone that someone joined
  socket.broadcast.emit('message', `${guestName} joined the chat`);

  // Handle incoming chat message
  socket.on('chatMessage', (msg) => {
    io.emit('message', `${socket.username}: ${msg}`);
  });

  // On disconnect
  socket.on('disconnect', () => {
    // Announce user left
    io.emit('message', `${socket.username} left the chat`);

    // Remove from user list
    delete users[socket.id];

    // Update user list for everyone
    io.emit('userList', Object.values(users));
  });
});

// Start the server
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
