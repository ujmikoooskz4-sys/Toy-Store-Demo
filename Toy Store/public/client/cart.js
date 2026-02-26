document.addEventListener('DOMContentLoaded', () => { loadCart(); updateCartCount(); });

async function loadCart() {
  const cartItems = await fetch('/api/cart',{credentials:'same-origin'}).then(r=>r.json());
  const container = document.getElementById('cart-items');
  const summaryEl = document.getElementById('summary-items');
  const totalEl = document.getElementById('cart-total');
  container.innerHTML = '';

  if (!cartItems || !cartItems.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some toys to get started!</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:1.2rem;display:inline-flex">Browse Products</a>
      </div>`;
    totalEl.textContent = '0';
    summaryEl.innerHTML = '<p style="color:var(--muted);font-size:.85rem;text-align:center;padding:.5rem 0">No items yet</p>';
    return;
  }

  const data = await fetch('/api/products',{credentials:'same-origin'}).then(r=>r.json());
  const products = data.products;
  let grand = 0;
  summaryEl.innerHTML = '';

  cartItems.forEach((item, idx) => {
    const p = products.find(x => x.productId == item.productId);
    if (!p) return;
    const price = Number(p.price), qty = Number(item.quantity), total = price * qty;
    grand += total;

    const attrs = item.attributes && Object.keys(item.attributes).length
      ? Object.entries(item.attributes).map(([k,v])=>`${k}: ${v}`).join(' · ')
      : '';

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.style.animationDelay = `${idx*.06}s`;
    div.id = `cart-item-${item.productId}`;
    div.innerHTML = `
      <img src="${p.imageUrl}" class="cart-item-img" onerror="this.src='https://placehold.co/80x80/FFE5F0/FF4F8B?text=🧸'">
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        ${attrs ? `<div class="cart-item-attrs">${attrs}</div>` : ''}
        <div class="cart-item-price">฿${price} each</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="updateQty(${item.productId},${qty-1})">−</button>
        <span class="qty-val">${qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.productId},${qty+1})">+</button>
      </div>
      <div class="cart-item-total">฿${total}</div>
      <button class="remove-btn" onclick="removeItem(${item.productId})" title="Remove">✕</button>`;
    container.appendChild(div);

    summaryEl.innerHTML += `<div class="summary-row"><span>${p.name} ×${qty}</span><span>฿${total}</span></div>`;
  });

  totalEl.textContent = grand;
  updateCartCount();
}

async function updateQty(id, newQty) {
  if (newQty <= 0) { removeItem(id); return; }
  await fetch(`/api/cart/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify({quantity:newQty}) });
  loadCart();
}

async function removeItem(id) {
  const el = document.getElementById(`cart-item-${id}`);
  if (el) { el.style.opacity='0'; el.style.transform='translateX(30px)'; await new Promise(r=>setTimeout(r,200)); }
  await fetch(`/api/cart/${id}`, { method:'DELETE', credentials:'same-origin' });
  loadCart();
}

function updateCartCount() {
  fetch('/api/cart',{credentials:'same-origin'}).then(r=>r.json()).then(c=>{
    document.getElementById('cart-count').textContent = c.reduce((t,i)=>t+Number(i.quantity),0);
  });
}

function goToCheckout() { location.href='order.html'; }
