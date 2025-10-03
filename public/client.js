function showChat(user) {
  userInfoModal.style.display = 'none';
  chatContainer.style.display = 'flex';
  logoutBtn.style.display = 'inline-block'; // ✅ Show logout button

  userInfo = user;

  if (user.nickname.toLowerCase() === 'admin') {
    vipSection.style.display = 'block';
  } else {
    vipSection.style.display = 'none';
  }
}

logoutBtn.addEventListener('click', () => {
  clearUserInfo(); // clear localStorage
  location.reload(); // reload to go back to login
});
