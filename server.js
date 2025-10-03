const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const ADMIN_PASSWORD = 'Pavarotti69';
const vipUsers = new Set();
let users = {};

function updateUserList() {
  const userArray = Object.values(users);
  userArray.sort((a, b) => {
    const aVip = vipUsers.has(a.nickname);
    const bVip = vipUsers.has(b.nickname);
    return bVip - aVip; // VIPs first
  });
  io.emit('userList', userArray);
}

io.on('connection', (socket) => {
  socket.on('join', (userInfo) => {
    userInfo.vip = vipUsers.has(userInfo.nickname);
    users[socket.id] = userInfo;
    socket.username = userInfo.nickname;
    socket.broadcast.emit('message', `${userInfo.nickname} joined the chat`);
    updateUserList();
  });

  socket.on('chatMessage', (msg) => {
    const sender = users[socket.id];
    if (sender) {
      io.emit('message', `${sender.nickname}: ${msg}`);
    }
  });

  socket.on('disconnect', () => {
    const leftUser = users[socket.id];
    if (leftUser) {
      socket.broadcast.emit('message', `${leftUser.nickname} left the chat`);
      delete users[socket.id];
      updateUserList();
    }
  });

  socket.on('addVip', ({ username, password }) => {
    if (password === ADMIN_PASSWORD) {
      vipUsers.add(username);
      updateUserList();
      socket.emit('vipAddResult', { success: true, message: `${username} added as VIP.` });
    } else {
      socket.emit('vipAddResult', { success: false, message: 'Incorrect admin password.' });
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
