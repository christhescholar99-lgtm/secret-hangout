const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve index.html and static files
app.use(express.static(__dirname));

// Handle socket connections
io.on('connection', socket => {
  console.log('A user connected');

  socket.on('message', msg => {
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
