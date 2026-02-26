function login() {
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('error');
  btn.textContent = '⏳ Signing in…';
  btn.disabled = true;
  err.style.display = 'none';

  fetch('/api/admin/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    })
  })
  .then(r => { if(!r.ok) throw new Error(); return r.json(); })
  .then(() => { window.location.href = '/admin/orders.html'; })
  .catch(() => {
    err.style.display = 'block';
    btn.textContent = 'Sign In →';
    btn.disabled = false;
  });
}
