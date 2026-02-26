document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/orders')
    .then(r => { if(r.status===403){location.href='/admin/login.html';return null;} return r.json(); })
    .then(orders => {
      if(!orders) return;
      const list = document.getElementById('orders-list');

      let revenue=0, pending=0, completed=0;
      orders.forEach(o => {
        revenue += Number(o.total||0);
        if(o.status==='Pending') pending++;
        if(o.status==='Completed') completed++;
      });
      document.getElementById('total-orders').textContent = orders.length;
      document.getElementById('total-revenue').textContent = '฿'+revenue.toLocaleString();
      document.getElementById('pending-count').textContent = pending;
      document.getElementById('completed-count').textContent = completed;

      if(!orders.length){
        list.innerHTML='<div style="text-align:center;padding:3rem;color:#9CA3AF;font-weight:700">No orders yet</div>';
        return;
      }

      [...orders].reverse().forEach((o,i) => {
        const statusBadge = o.status==='Pending' ? `<span class="badge badge-pending">${o.status}</span>`
          : o.status==='Shipped' ? `<span class="badge badge-shipped">${o.status}</span>`
          : `<span class="badge badge-completed">${o.status}</span>`;
        const itemsText = o.items.map(x=>`${x.productName} ×${x.quantity} (฿${x.price})`).join(' • ');
        const div = document.createElement('div');
        div.className='order-card'; div.style.animationDelay=`${i*.04}s`; div.id=`order-${o.id}`;
        div.innerHTML=`
          <div class="order-top">
            <div>
              <div style="font-family:'Fredoka One',cursive;font-size:1rem">Order #${o.id}</div>
              <div style="font-size:.78rem;color:var(--muted);font-weight:600">📅 ${o.date}</div>
            </div>
            ${statusBadge}
          </div>
          <div class="order-info-grid">
            <div class="order-info-item">Customer<span>${o.name}</span></div>
            <div class="order-info-item">Address<span>${o.address}</span></div>
            <div class="order-info-item">Phone<span>${o.phone}</span></div>
            <div class="order-info-item">Payment<span>${o.payment}</span></div>
            <div class="order-info-item">Total<span style="color:var(--pink);font-size:1.05rem;font-family:'Fredoka One',cursive">฿${o.total}</span></div>
          </div>
          <div class="items-list">🧸 ${itemsText}</div>
          <div class="status-actions" style="margin-top:1rem">
            <button class="s-btn s-pending" onclick="setStatus(${o.id},'Pending')">⏳ Pending</button>
            <button class="s-btn s-shipped" onclick="setStatus(${o.id},'Shipped')">🚚 Shipped</button>
            <button class="s-btn s-completed" onclick="setStatus(${o.id},'Completed')">✅ Completed</button>
            <button class="s-btn s-delete" onclick="delOrder(${o.id})">🗑 Delete</button>
          </div>`;
        list.appendChild(div);
      });
    });
});

function setStatus(id, status) {
  fetch(`/api/orders/${id}/status`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    .then(()=>location.reload());
}

function delOrder(id) {
  if(!confirm('Delete this order?')) return;
  const el = document.getElementById(`order-${id}`);
  if(el){el.style.opacity='0';el.style.transform='translateX(30px)';el.style.transition='all .25s';}
  setTimeout(()=>{
    fetch(`/api/orders/${id}`,{method:'DELETE'}).then(()=>location.reload());
  },220);
}
