let allProducts = [];
let allCategories = [];

/* ===============================
   Toast
================================= */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ===============================
   Chat
================================= */
function sendChat() {
  const input = document.getElementById('chat-input');
  const box = document.getElementById('chat-messages');
  if (!input || !box) return;

  const message = input.value.trim();
  if (!message) return;

  box.innerHTML += `<div class="msg-user">${message}</div>`;
  input.value = '';
  box.scrollTop = box.scrollHeight;

  setTimeout(() => {
    box.innerHTML += `<div class="msg-bot">Thank you! Our team will respond shortly 😊</div>`;
    box.scrollTop = box.scrollHeight;
  }, 800);
}

/* ===============================
   Main Load
================================= */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/products', { credentials: 'same-origin' });
    const data = await res.json();

    allProducts = data.products || [];
    allCategories = data.categories || [];

    renderBestSellers();
    renderCategories();
    renderDropdown();
    handleURLCategory();

    if (document.getElementById('search-input')) {
      applyFilters();
    }

    updateCartCount();

  } catch (err) {
    console.error('Error loading products:', err);
  }
});

async function loadBestSellers() {

  const bs = document.getElementById("best-seller-products");

  if (!bs) return;

  /* ------------------------------
     1️⃣ Show Skeleton Loading
  ------------------------------ */
  bs.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;

  try {
    /* ------------------------------
       2️⃣ Fetch Products
    ------------------------------ */
    const res = await fetch("/api/products");
    const products = await res.json();

    // You can change filter condition if needed
    const bestSellers = products.filter(p => p.isBestSeller);

    /* ------------------------------
       3️⃣ Render Real Cards
    ------------------------------ */
    renderBestSellers(bestSellers);

  } catch (err) {
    console.error("Failed to load products:", err);
    bs.innerHTML = "<p>Failed to load products 😢</p>";
  }
}



/* ===============================
   🔥 Best Sellers (Top 3)
================================= */
function renderBestSellers() {
  const container =
    document.getElementById('best-seller-products') ||
    document.getElementById('featured-products');

  if (!container) return;

 const bestThree = [...allProducts]
  .sort(() => 0.5 - Math.random())
  .slice(0, 3);
  container.innerHTML = '';

  bestThree.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.style.animationDelay = `${i * 0.1}s`;

    // ✅ CLICK GOES TO DETAIL PAGE
    card.onclick = () => {
      location.href = `product-detail.html?id=${p.productId}`;
    };

    card.innerHTML = `


      <div style="overflow:hidden; position:relative;">
        <span class="badge-best">🔥 Best Seller</span>
        <img src="${p.imageUrl}" class="card-img"
          onerror="this.src='https://placehold.co/400x300/FFE5F0/FF4F8B?text=🧸'">
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.name}</h3>
        <p class="card-price">฿${p.price}</p>
        <button class="btn btn-primary btn-sm"
          onclick="event.stopPropagation();
                   quickAdd(${p.productId},'${p.name.replace(/'/g,"\\'")}')">
          + Cart
        </button>
      </div>

    `;

    container.appendChild(card);
  });
}

/* ===============================
   Category Chips
================================= */
function renderCategories() {
  const chips = document.getElementById('cat-chips');
  if (!chips) return;

  chips.innerHTML = `
    <button class="chip chip-active" onclick="chipSelect(0,this)">
      ✨ All (${allProducts.length})
    </button>
  `;

  allCategories.forEach(category => {
    const count = allProducts.filter(
      p => p.categoryId === category.categoryId
    ).length;

    chips.innerHTML += `
      <button class="chip chip-inactive"
        onclick="chipSelect(${category.categoryId},this)">
        ${category.name} (${count})
      </button>
    `;
  });
}

/* ===============================
   Category Dropdown
================================= */
function renderDropdown() {
  const select = document.getElementById('cat-select');
  if (!select) return;

  allCategories.forEach(category => {
    select.innerHTML += `
      <option value="${category.categoryId}">
        ${category.name}
      </option>
    `;
  });
}

/* ===============================
   URL Category Handling
================================= */
function handleURLCategory() {
  const cat = new URLSearchParams(location.search).get('category');
  if (!cat) return;

  const select = document.getElementById('cat-select');
  const chips = document.getElementById('cat-chips');
  if (!select || !chips) return;

  select.value = cat;

  const btn = [...chips.querySelectorAll('.chip')]
    .find((b, i) =>
      i > 0 && allCategories[i - 1]?.categoryId == cat
    );

  if (btn) chipSelect(Number(cat), btn);
}

/* ===============================
   Filtering
================================= */
function chipSelect(id, btn) {
  document.querySelectorAll('#cat-chips .chip')
    .forEach(c => c.className = 'chip chip-inactive');

  btn.className = 'chip chip-active';

  const select = document.getElementById('cat-select');
  if (select) select.value = id;

  applyFilters();
}

function catName(id) {
  return (allCategories.find(c => c.categoryId === id) || {}).name || '';
}

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  const catSelect = document.getElementById('cat-select');
  const sortSelect = document.getElementById('sort-select');
  const resultsMeta = document.getElementById('results-meta');

  if (!searchInput || !catSelect || !sortSelect) return;

  const search = searchInput.value.toLowerCase();
  const catId = Number(catSelect.value);
  const sort = sortSelect.value;

  let list = allProducts.filter(p =>
    (!catId || p.categoryId === catId) &&
    (p.name.toLowerCase().includes(search) ||
     p.description.toLowerCase().includes(search))
  );

  if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  if (resultsMeta) {
    resultsMeta.textContent =
      `Showing ${list.length} toy${list.length !== 1 ? 's' : ''}`;
  }

  renderGrid(list);
}

/* ===============================
   Product Grid
================================= */
function renderGrid(list) {
  const grid = document.getElementById('product-grid');
  const noRes = document.getElementById('no-results');
  if (!grid || !noRes) return;

  if (!list.length) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }

  noRes.classList.add('hidden');
  grid.innerHTML = '';

  list.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.style.animationDelay = `${i * 0.05}s`;

    card.onclick = () =>
      location.href = `product-detail.html?id=${p.productId}`;

    card.innerHTML = `
      <div style="overflow:hidden">
        <img src="${p.imageUrl}" class="card-img"
          style="object-position:${p.imagePosition || 'center'}"
          onerror="this.src='https://placehold.co/400x300/FFE5F0/FF4F8B?text=🧸'">
      </div>
      <div class="card-body">
        <span class="card-category">${catName(p.categoryId)}</span>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-desc">${p.description}</p>
        <div style="display:flex;justify-content:space-between;margin-top:.5rem">
          <span class="card-price">฿${p.price}</span>
          <button class="btn btn-primary btn-sm"
            onclick="event.stopPropagation();
                     quickAdd(${p.productId},'${p.name.replace(/'/g,"\\'")}')">
            + Cart
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ===============================
   Cart
================================= */
async function quickAdd(id, name) {
  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ productId: id, quantity: 1 })
  });

  showToast(`🛒 "${name}" added to cart!`);
  updateCartCount();
}

function updateCartCount() {
  fetch('/api/cart', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(cart => {
      const el = document.getElementById('cart-count');
      if (!el) return;

      el.textContent = cart.reduce(
        (total, item) => total + Number(item.quantity),
        0
      );
    });
}