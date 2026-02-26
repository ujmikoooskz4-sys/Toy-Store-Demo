let selectedPayment = 'SCB';

function selectPay(method, btn) {
  selectedPayment = method;
  document.getElementById('payment').value = method;
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', async () => {
  // Block page if not logged in
  const me = await fetch('/api/users/me', { credentials: 'same-origin' }).then(r => r.json());
  if (!me.loggedIn) {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);font-family:'Nunito',sans-serif">
        <div style="text-align:center;padding:3rem;background:#fff;border-radius:24px;box-shadow:0 16px 48px rgba(255,79,139,.15);max-width:400px;width:90%">
          <div style="font-size:3rem;margin-bottom:1rem">🔒</div>
          <h2 style="font-family:'Fredoka One',cursive;font-size:1.6rem;margin-bottom:.5rem">Please select a profile</h2>
          <p style="color:#6B6B8A;margin-bottom:1.5rem">You need to select a user profile before checking out.</p>
          <a href="index.html" style="display:inline-flex;align-items:center;gap:.4rem;background:linear-gradient(135deg,#FF4F8B,#D93070);color:#fff;padding:.8rem 2rem;border-radius:50px;font-weight:800;text-decoration:none">← Go to Home</a>
        </div>
      </div>`;
    return;
  }
  loadOrderSummary();
  updateCartCount();
});

async function loadOrderSummary() {
  const cartItems = await fetch('/api/cart',{credentials:'same-origin'}).then(r=>r.json());
  const container = document.getElementById('order-items');
  const totalEl = document.getElementById('order-total');

  if (!cartItems || !cartItems.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:.85rem">Cart is empty. <a href="products.html" style="color:var(--pink)">Go shopping!</a></p>';
    return;
  }

  const data = await fetch('/api/products',{credentials:'same-origin'}).then(r=>r.json());
  const products = data.products;
  let grand = 0;
  container.innerHTML = '';

  cartItems.forEach(item => {
    const p = products.find(x => x.productId == item.productId);
    if (!p) return;
    const price = Number(p.price), qty = Number(item.quantity), total = price * qty;
    grand += total;
    container.innerHTML += `
      <div class="order-item-row">
        <span>${p.name} <span style="color:var(--muted)">×${qty}</span></span>
        <span style="font-weight:700">฿${total}</span>
      </div>`;
  });
  totalEl.textContent = grand;
}

async function submitOrder() {
  const name    = document.getElementById('name').value.trim();
  const address = document.getElementById('address').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const payment = selectedPayment;

  if (!name || !address || !phone) {
    showToast('⚠️ Please fill in all required fields');
    return;
  }

  const btn = document.getElementById('confirm-btn');
  btn.classList.add('loading');
  btn.textContent = '⏳ Placing order…';

  try {
    const res = await fetch('/api/orders', {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin',
      body: JSON.stringify({ name, address, phone, payment })
    });
    const data = await res.json();
    location.href = `order-success.html?orderId=${data.orderId}`;
  } catch {
    showToast('❌ Something went wrong. Please try again.');
    btn.classList.remove('loading');
    btn.textContent = '✅ Place Order';
  }
}