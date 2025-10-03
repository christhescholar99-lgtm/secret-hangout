io.on('connection', (socket) => {
  socket.on('join', (userInfo) => {
    // Basic validation: check if nickname exists and is not already taken
    if (!userInfo.nickname) {
      socket.emit('joinFail');
      return;
    }

    // Check if nickname already used by another connected user
    const nicknameTaken = Object.values(users).some(u => u.nickname === userInfo.nickname);
    if (nicknameTaken) {
      socket.emit('joinFail');
      return;
    }

    userInfo.vip = vipUsers.has(userInfo.nickname);
    users[socket.id] = userInfo;
    socket.username = userInfo.nickname;

    socket.emit('joinSuccess');  // Notify client that join was successful
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
