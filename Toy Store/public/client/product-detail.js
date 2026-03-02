let qty = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');

  if (!id) {
    location.href = 'products.html';
    return;
  }

  const r = await fetch(`/api/products/${id}`, {
    credentials: 'same-origin'
  });

  const p = await r.json();

  if (!p || p.message) {
    document.getElementById('product-detail').innerHTML = `
      <div class="empty-state">
        <div class="icon">😢</div>
        <h3>Product Not Found</h3>
        <p>
          <a href="products.html" class="btn btn-primary" 
             style="margin-top:1rem;display:inline-flex">
            ← Back to Products
          </a>
        </p>
      </div>`;
    return;
  }

  document.title = `${p.name} — SuperNina's`;
  document.getElementById('breadcrumb-name').textContent = p.name;

  document.getElementById('product-detail').innerHTML = `
    <div class="detail-grid">
      
      <div class="img-wrapper">
        <img src="${p.imageUrl}" 
             alt="${p.name}"
             style="object-position:${p.imagePosition||'center'}"
             onerror="this.src='https://placehold.co/500x500/FFE5F0/FF4F8B?text=🧸'">
      </div>

      <div>
        <h1 style="font-family:'Fredoka One',cursive;font-size:2rem;margin:.5rem 0 .75rem;line-height:1.15">
          ${p.name}
        </h1>

        <p class="detail-price">฿${p.price}</p>

        <!-- ✅ Manufacturer -->
        <p style="margin-top:1rem;font-weight:700;">
          Manufactured by: 
          <span style="color:var(--pink)">
            ${p.manufacturer || 'SuperNina Toys Co., Ltd.'}
          </span>
        </p>

        <!-- ✅ Product Details -->
        <div style="margin-top:1.5rem">
          <h3 style="font-family:'Fredoka One',cursive;font-size:1.2rem;margin-bottom:.5rem">
            Product Details
          </h3>
          <p style="color:var(--muted);font-size:.95rem;line-height:1.7">
            ${p.description}
          </p>
        </div>

        <!-- ✅ Quantity -->
        <div style="margin-top:1.8rem">
          <label class="form-label">Quantity</label>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(-1)">−</button>
            <span class="qty-val" id="qty-val">1</span>
            <button class="qty-btn" onclick="changeQty(1)">+</button>
          </div>
        </div>

        <!-- ✅ Add to Cart -->
        <button class="btn btn-primary btn-lg add-btn" 
                onclick="addToCart(${p.productId})">
          🛒 Add to Cart
        </button>

        <div style="margin-top:1rem;display:flex;gap:.75rem">
          <a href="products.html" 
             class="btn btn-ghost"
             style="flex:1;justify-content:center;font-size:.88rem">
             ← Back
          </a>

          <a href="cart.html" 
             class="btn btn-yellow"
             style="flex:1;justify-content:center;font-size:.88rem">
             View Cart 🛒
          </a>
        </div>

      </div>
    </div>`;

  updateCartCount();
});

/* ===============================
   Quantity
================================ */
function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById('qty-val').textContent = qty;
}

/* ===============================
   Add To Cart
================================ */
async function addToCart(productId) {
  const btn = document.querySelector('.add-btn');

  btn.textContent = '✓ Added!';
  btn.style.background =
    'linear-gradient(135deg,#43E97B,#38F9D7)';

  await fetch('/api/cart', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    credentials:'same-origin',
    body: JSON.stringify({
      productId,
      quantity: qty
    })
  });

  showToast('🛒 Added to cart!');
  updateCartCount();

  setTimeout(() => {
    btn.innerHTML = '🛒 Add to Cart';
    btn.style.background = '';
  }, 1800);
}