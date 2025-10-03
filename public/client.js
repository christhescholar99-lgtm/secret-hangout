document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  // Elements
  const userInfoModal = document.getElementById('user-info-modal');
  const userInfoForm = document.getElementById('user-info-form');
  const chatContainer = document.getElementById('chat-container');
  const chatBox = document.getElementById('chat-box');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('msg');
  const userListDiv = document.getElementById('user-list');
  const vipSection = document.getElementById('vip-section');
  const addVipBtn = document.getElementById('add-vip-btn');
  const vipMessage = document.getElementById('vip-message');

  let userInfo = null;

  // Convert country code to flag emoji
  function countryCodeToFlagEmoji(code) {
    if (!code) return '';
    const A = 65;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - A));
  }

  // Login form submit
  userInfoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nickname = document.getElementById('nickname').value.trim();
    const age = document.getElementById('age').value.trim();
    const sex = document.getElementById('sex').value;
    const country = document.getElementById('country').value.trim().toUpperCase();
    const location = document.getElementById('location').value.trim();

    if (!nickname || !age || !sex || !country || !location) {
      alert('Please fill out all fields.');
      return;
    }

    userInfo = { nickname, age, sex, country, location };

    socket.emit('join', userInfo);

    userInfoModal.style.display = 'none';
    chatContainer.style.display = 'flex';

    // Only show VIP section if admin is logged in
    if (nickname === 'admin') {
      vipSection.style.display = 'block';
    }
  });

  // Chat message received
  socket.on('message', (msg) => {
    const div = document.createElement('div');
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Updated user list
  socket.on('userList', (users) => {
    userListDiv.innerHTML = '';
    users.forEach(user => {
      const flag = countryCodeToFlagEmoji(user.country);
      const isVIP = user.vip ? ' ⭐ VIP ⭐' : '';
      const div = document.createElement('div');
      div.innerHTML = `<strong>${flag} ${user.nickname}${isVIP}</strong> (${user.age}, ${user.sex}) - ${user.location}`;
      userListDiv.appendChild(div);
    });
  });

  // Chat send
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message && userInfo) {
      socket.emit('chatMessage', message);
      input.value = '';
    }
  });

  // VIP button
  addVipBtn?.addEventListener('click', () => {
    const vipUsername = document.getElementById('vip-username').value.trim();
    const vipPassword = document.getElementById('vip-password').value;

    if (!vipUsername || !vipPassword) {
      vipMessage.textContent = 'Please enter username and admin password.';
      return;
    }

    socket.emit('addVip', { username: vipUsername, password: vipPassword });

    document.getElementById('vip-username').value = '';
    document.getElementById('vip-password').value = '';
    vipMessage.textContent = '';
  });

  socket.on('vipAddResult', ({ success, message }) => {
    vipMessage.textContent = message;
    vipMessage.style.color = success ? 'green' : 'red';
  });
});
