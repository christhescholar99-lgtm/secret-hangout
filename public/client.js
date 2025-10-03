const socket = io();

let currentUser = null;
let selectedUser = null;

const userListEl = document.getElementById('user-list');
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg');

// When user submits login form:
document.getElementById('user-info-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // Collect nickname and other info
  const nickname = document.getElementById('nickname').value.trim();

  if (!nickname) return alert('Please enter a nickname.');

  currentUser = nickname;

  // Hide modal and show chat container
  document.getElementById('user-info-modal').style.display = 'none';
  document.getElementById('chat-container').style.display = 'block';

  // Join the chat on server
  socket.emit('join', currentUser);
});

// Update user list UI with clickable usernames
socket.on('user list', (users) => {
  userListEl.innerHTML = '<strong>Users Online:</strong><br>';
  users.forEach(user => {
    if (user === currentUser) return; // Don't show yourself

    const userEl = document.createElement('div');
    userEl.textContent = user;
    userEl.style.cursor = 'pointer';
    userEl.style.padding = '4px';
    userEl.style.borderBottom = '1px solid #ccc';

    // Highlight if selected
    if (user === selectedUser) {
      userEl.style.backgroundColor = '#d0f0c0';
      userEl.style.fontWeight = 'bold';
    }

    userEl.onclick = () => {
      selectedUser = user;
      updateChatHeader();
      clearChat();
    };

    userListEl.appendChild(userEl);
  });
});

// Show who you're chatting with
function updateChatHeader() {
  chatBox.innerHTML = `<div><em>Private chat with <strong>${selectedUser}</strong></em></div><hr>`;
}

// Clear chat messages when switching users
function clearChat() {
  chatBox.innerHTML = '';
  updateChatHeader();
}

// Send message handler
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!selectedUser) {
    alert('Select a user to chat with first!');
    return;
  }
  const message = msgInput.value.trim();
  if (!message) return;

  // Display message in chat box
  addMessage(`Me to ${selectedUser}: ${message}`);

  // Send private message to server
  socket.emit('private message', {
    content: message,
    to: selectedUser,
    from: currentUser
  });

  msgInput.value = '';
});

// Receive private messages
socket.on('private message', ({ content, from }) => {
  // Only show messages from the selected user
  if (from === selectedUser) {
    addMessage(`${from}: ${content}`);
  } else {
    // Optionally notify about messages from other users
    console.log(`New message from ${from} (not selected)`);
  }
});

// Helper to add message to chat box
function addMessage(msg) {
  const msgEl = document.createElement('div');
  msgEl.textContent = msg;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}
