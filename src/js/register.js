import { signUp } from './modules/Auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const error = await signUp(email, password);
      document.getElementById('signup-message').textContent = error ? error.message : '¡Registro exitoso! Revisa tu correo.';
    });
  }
});
