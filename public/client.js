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
  const logoutBtn = document.getElementById('logout-btn');

  let userInfo = null;

  function countryCodeToFlagEmoji(code) {
    if (!code) return '';
    const A = 65;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - A));
  }

  function loadUserInfo() {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  function saveUserInfo(info) {
    localStorage.setItem('userInfo', JSON.stringify(info));
  }

  function clearUserInfo() {
    localStorage.removeItem('userInfo');
  }

  function showChat(user) {
    userInfoModal.style.display = 'none';
    chatContainer.style.display = 'flex';
    logoutBtn.style.display = 'inline-block'; // ✅ make logout visible
    userInfo = user;

    if (user.nickname.toLowerCase() === 'admin') {
      vipSection.style.display = 'block';
    } else {
      vipSection.style.display = 'none';
    }
  }

  const savedUser = loadUserInfo();
  if (savedUser) {
    showChat(savedUser);
    socket.emit('join', savedUser);
  } else {
    userInfoModal.style.display = 'block';
    chatContainer.style.display = 'none';
    logoutBtn.style.display = 'none'; // Hide logout if not logged in
  }

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

    const user = { nickname, age, sex, country, location };
    userInfo = user;
    saveUserInfo(user);
    socket.emit('join', user);
    showChat(user);
  });

  socket.on('message', (msg) => {
    const div = document.createElement('div');
    div.textContent = msg;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (message && userInfo) {
      socket.emit('chatMessage', message);
      input.value = '';
    }
  });

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

  // ✅ Logout button logic
  logoutBtn.addEventListener('click', () => {
    clearUserInfo();
    location.reload();
  });
});
