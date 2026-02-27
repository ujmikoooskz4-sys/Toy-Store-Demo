let allProducts = [], allCategories = [];

function showToast(msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast'; t.innerHTML = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('leaving'); setTimeout(() => t.remove(), 300); }, 2500);
}

function sendChat() {
  const i = document.getElementById('chat-input'), m = i.value.trim(); if(!m) return;
  const b = document.getElementById('chat-messages');
  b.innerHTML += `<div class="msg-user">${m}</div>`; i.value=''; b.scrollTop=99999;
  setTimeout(()=>{ b.innerHTML+=`<div class="msg-bot">Thank you! Our team will respond shortly 😊</div>`; b.scrollTop=99999; },800);
}

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/products', { credentials: 'same-origin' });
  const data = await res.json();
  allCategories = data.categories;
  allProducts = data.products;

  // Category chips
  const chips = document.getElementById('cat-chips');
  chips.innerHTML = `<button class="chip chip-active" onclick="chipSelect(0,this)">✨ All (${allProducts.length})</button>`;
  allCategories.forEach(c => {
    const cnt = allProducts.filter(p=>p.categoryId===c.categoryId).length;
    chips.innerHTML += `<button class="chip chip-inactive" onclick="chipSelect(${c.categoryId},this)">${c.name} (${cnt})</button>`;
  });

  // Dropdown
  const sel = document.getElementById('cat-select');
  allCategories.forEach(c => { sel.innerHTML += `<option value="${c.categoryId}">${c.name}</option>`; });

  // URL param
  const cat = new URLSearchParams(location.search).get('category');
  if (cat) {
    document.getElementById('cat-select').value = cat;
    const btn = [...chips.querySelectorAll('.chip')].find((b,i)=>i>0&&allCategories[i-1]?.categoryId==cat);
    if(btn) chipSelect(Number(cat), btn);
  }

  applyFilters();
  updateCartCount();
});

function chipSelect(id, btn) {
  document.querySelectorAll('#cat-chips .chip').forEach(c => c.className='chip chip-inactive');
  btn.className = 'chip chip-active';
  document.getElementById('cat-select').value = id;
  applyFilters();
}

function catName(id) { return (allCategories.find(c=>c.categoryId===id)||{name:''}).name; }

function applyFilters() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const catId = Number(document.getElementById('cat-select').value);
  const sort = document.getElementById('sort-select').value;

  let list = allProducts.filter(p => {
    return (!catId || p.categoryId===catId) &&
      (p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
  });

  if(sort==='name-asc')   list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='name-desc')  list.sort((a,b)=>b.name.localeCompare(a.name));
  if(sort==='price-asc')  list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);

  document.getElementById('results-meta').textContent = `Showing ${list.length} toy${list.length!==1?'s':''}`;
  renderGrid(list);
}

function renderGrid(list) {
  const grid = document.getElementById('product-grid');
  const noRes = document.getElementById('no-results');
  if(!list.length) { grid.innerHTML=''; noRes.classList.remove('hidden'); return; }
  noRes.classList.add('hidden');
  grid.innerHTML = '';
  list.forEach((p,i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.style.animationDelay = `${i*.05}s`;
    card.onclick = () => location.href = `product-detail.html?id=${p.productId}`;
    card.innerHTML = `
      <div style="overflow:hidden">
        <img src="${p.imageUrl}" class="card-img" style="object-position:${p.imagePosition||'center'}" onerror="this.src='https://placehold.co/400x300/FFE5F0/FF4F8B?text=🧸'">
      </div>
      <div class="card-body">
        <span class="card-category">${catName(p.categoryId)}</span>
        <h3 class="card-title">${p.name}</h3>
        <p class="card-desc">${p.description}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.5rem">
          <span class="card-price">฿${p.price}</span>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();quickAdd(${p.productId},'${p.name.replace(/'/g,'\\\'')}')" >+ Cart</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

async function quickAdd(id, name) {
  await fetch('/api/cart', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify({productId:id,quantity:1}) });
  showToast(`🛒 "${name}" added to cart!`);
  updateCartCount();
}

function updateCartCount() {
  fetch('/api/cart',{credentials:'same-origin'}).then(r=>r.json()).then(c=>{
    document.getElementById('cart-count').textContent = c.reduce((t,i)=>t+Number(i.quantity),0);
  });
}