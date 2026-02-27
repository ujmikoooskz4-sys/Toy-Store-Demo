let qty = 1;
const selectedAttrs = {};

document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(location.search).get('id');

  // ✅ FIXED redirect
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

  // Pre-select first attributes
  if (p.attributes) {
    for (const key in p.attributes) {
      selectedAttrs[key] = p.attributes[key][0];
    }
  }

  let attrsHTML = '';
  if (p.attributes) {
    for (const key in p.attributes) {
      attrsHTML += `
        <div style="margin-top:1.2rem">
          <label class="form-label" style="text-transform:capitalize">${key}</label>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem" id="attr-${key}">
            ${p.attributes[key].map((v,i) => `
              <button class="attr-btn${i===0?' selected':''}" 
                      onclick="selectAttr('${key}','${v}',this)">
                ${v}
              </button>
            `).join('')}
          </div>
        </div>`;
    }
  }

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
        <p style="color:var(--muted);font-size:.95rem;margin-top:1rem;line-height:1.7">
          ${p.description}
        </p>

        ${attrsHTML}

        <div style="margin-top:1.5rem">
          <label class="form-label">Quantity</label>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(-1)">−</button>
            <span class="qty-val" id="qty-val">1</span>
            <button class="qty-btn" onclick="changeQty(1)">+</button>
          </div>
        </div>

        <button class="btn btn-primary btn-lg add-btn" 
                onclick="addToCart(${p.productId})">
          🛒 Add to Cart
        </button>

        <div style="margin-top:1rem;display:flex;gap:.75rem">
          
          <!-- ✅ FIXED HERE -->
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

function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById('qty-val').textContent = qty;
}

function selectAttr(key, val, btn) {
  selectedAttrs[key] = val;
  document
    .querySelectorAll(`#attr-${key} .attr-btn`)
    .forEach(b => b.classList.remove('selected'));

  btn.classList.add('selected');
}

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
      quantity: qty,
      attributes: selectedAttrs
    })
  });

  showToast('🛒 Added to cart!');
  updateCartCount();

  setTimeout(() => {
    btn.innerHTML = '🛒 Add to Cart';
    btn.style.background = '';
  }, 1800);
}