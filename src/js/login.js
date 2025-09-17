import { signIn } from './modules/Auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const error = await signIn(email, password);
      if (!error) {
        document.getElementById('login-message').textContent = '¡Login exitoso!';
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        document.getElementById('login-message').textContent = error.message;
      }
    });
  }
});
