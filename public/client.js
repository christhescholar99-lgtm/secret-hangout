const socket = io();

// Elements
const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const userListDiv = document.getElementById('user-list');

// Listen for messages
socket.on('message', function (msg) {
  const div = document.createElement('div');
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Listen for user list updates
socket.on('userList', function (users) {
  userListDiv.innerHTML = ''; // Clear list
  users.forEach(username => {
    const div = document.createElement('div');
    div.textContent = username;
    userListDiv.appendChild(div);
  });
});

// On message send
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const message = input.value.trim();
  if (message) {
    socket.emit('chatMessage', message);
    input.value = '';
  }
});
