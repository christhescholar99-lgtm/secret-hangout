const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const users = {}; // username -> socket.id

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their nickname
  socket.on('join', (username) => {
    users[username] = socket.id;
    io.emit('user list', Object.keys(users)); // broadcast updated user list
  });

  // Private message event
  socket.on('private message', ({ content, to, from }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('private message', { content, from });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (const username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
    io.emit('user list', Object.keys(users)); // update user list
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port ' + (process.env.PORT || 3000));
});
