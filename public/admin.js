(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const rupee = (n) => '₹' + n.toLocaleString('en-IN');
  const when = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const ORDER_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled'];
  const OPEN = ['new', 'preparing', 'ready'];

  let token = sessionStorage.getItem('adminToken') || '';
  let data = { menu: [], orders: [], reservations: [], messages: [] };
  let special = '';
  let view = 'orders';
  let timer;

  async function api(path, method = 'GET', body) {
    const res = await fetch('/api/admin' + path, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: body ? JSON.stringify(body) : undefined,
    });
    const out = await res.json().catch(() => ({}));
    if (res.status === 401) {
      logout();
      throw new Error('Wrong password.');
    }
    if (!res.ok) throw new Error(out.error || 'Something went wrong.');
    return out;
  }

  // ---------- login ----------
  function logout() {
    token = '';
    sessionStorage.removeItem('adminToken');
    clearInterval(timer);
    $('#panel').hidden = true;
    $('#login').hidden = false;
  }

  async function start() {
    $('#login').hidden = true;
    $('#panel').hidden = false;
    await load(true);
    clearInterval(timer);
    timer = setInterval(() => load(view !== 'menu' && view !== 'special'), 20000);
  }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    token = $('#tokenInput').value.trim();
    const msg = $('#loginMsg');
    try {
      await api('/check');
      sessionStorage.setItem('adminToken', token);
      msg.textContent = '';
      start();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'form-msg err';
    }
  });

  $('#logout').addEventListener('click', logout);

  // ---------- loading ----------
  async function load(show) {
    try {
      data = await api('/data');
      const res = await fetch('/api/special');
      special = (await res.json()).text || '';
    } catch (err) {
      return;
    }
    const fresh = data.orders.filter((o) => o.status === 'new').length;
    $('#newCount').textContent = fresh || '';
    document.title = (fresh ? `(${fresh}) ` : '') + 'Admin · The Cozy Corner';
    if (show) render();
  }

  // ---------- screens ----------
  function ordersHtml() {
    if (!data.orders.length) return '<p class="muted">No orders yet.</p>';
    const sorted = [...data.orders].sort((a, b) => OPEN.includes(b.status) - OPEN.includes(a.status));
    return sorted.map((o) => `
      <article class="item${o.status === 'new' ? ' is-new' : ''}">
        <div class="item-head">
          <strong>#${o.id} · ${esc(o.name)}</strong>
          <span class="badge ${o.status}">${o.status}</span>
        </div>
        <p class="meta">${esc(o.phone)} · ${when(o.createdAt)} · ${rupee(o.total)}</p>
        <ul>${o.items.map((i) => `<li>${i.qty} × ${esc(i.name)}</li>`).join('')}</ul>
        ${o.note ? `<p class="meta">Note: ${esc(o.note)}</p>` : ''}
        <div class="actions">
          ${ORDER_STATUSES.map((s) => `<button class="chip${o.status === s ? ' on' : ''}" data-act="order" data-id="${o.id}" data-status="${s}">${s}</button>`).join('')}
        </div>
      </article>`).join('');
  }

  function reservationsHtml() {
    if (!data.reservations.length) return '<p class="muted">No reservations yet.</p>';
    const sorted = [...data.reservations].sort((a, b) => (b.status === 'pending') - (a.status === 'pending'));
    return sorted.map((r) => `
      <article class="item${r.status === 'pending' ? ' is-new' : ''}">
        <div class="item-head">
          <strong>${esc(r.name)} · ${r.guests} guest${r.guests > 1 ? 's' : ''}</strong>
          <span class="badge ${r.status}">${r.status}</span>
        </div>
        <p class="meta">${r.date} at ${r.time} · ${esc(r.phone)}</p>
        ${r.notes ? `<p class="meta">Note: ${esc(r.notes)}</p>` : ''}
        <div class="actions">
          <button class="chip${r.status === 'confirmed' ? ' on' : ''}" data-act="reservation" data-id="${r.id}" data-status="confirmed">Confirm</button>
          <button class="chip danger${r.status === 'cancelled' ? ' on' : ''}" data-act="reservation" data-id="${r.id}" data-status="cancelled">Cancel</button>
        </div>
      </article>`).join('');
  }

  function messagesHtml() {
    if (!data.messages.length) return '<p class="muted">No messages yet.</p>';
    return data.messages.map((m) => `
      <article class="item">
        <div class="item-head">
          <strong>${esc(m.name)}</strong>
          <span class="meta">${when(m.createdAt)}</span>
        </div>
        <p class="meta"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></p>
        <p>${esc(m.message)}</p>
      </article>`).join('');
  }

  function menuHtml() {
    const categories = [...new Set(data.menu.map((m) => m.category))];
    const rows = data.menu.map((m) => `
      <form class="menu-row${m.available ? '' : ' off'}" data-id="${m.id}">
        <label>Name<input name="name" value="${esc(m.name)}" required maxlength="80"></label>
        <label>Category<input name="category" value="${esc(m.category)}" list="cats" required maxlength="40"></label>
        <label>Price<input name="price" type="number" min="1" step="any" value="${m.price}" required></label>
        <label>Description<input name="description" value="${esc(m.description)}" maxlength="200"></label>
        <div class="actions">
          <button class="chip on" type="submit">Save</button>
          <button class="chip" type="button" data-act="toggle" data-id="${m.id}" data-available="${m.available}">${m.available ? 'Mark sold out' : 'Show on menu'}</button>
          <button class="chip danger" type="button" data-act="delete" data-id="${m.id}">Delete</button>
        </div>
      </form>`).join('');
    return `
      <datalist id="cats">${categories.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      <form class="form-card add-box" id="addForm">
        <h3>Add an item</h3>
        <div class="row">
          <label>Name<input name="name" required maxlength="80"></label>
          <label>Category<input name="category" list="cats" required maxlength="40"></label>
        </div>
        <div class="row">
          <label>Price (₹)<input name="price" type="number" min="1" step="any" required></label>
          <label>Description<input name="description" maxlength="200"></label>
        </div>
        <button class="btn" type="submit">Add to menu</button>
      </form>
      ${rows}`;
  }

  function specialHtml() {
    return `
      <form class="form-card" id="specialForm">
        <label>Text shown on the menu section
          <textarea name="text" rows="3" maxlength="200">${esc(special)}</textarea>
        </label>
        <button class="btn" type="submit">Save</button>
        <p class="meta">Leave it empty to hide the banner.</p>
      </form>`;
  }

  function render() {
    const screens = {
      orders: ordersHtml,
      reservations: reservationsHtml,
      messages: messagesHtml,
      menu: menuHtml,
      special: specialHtml,
    };
    $('#view').innerHTML = screens[view]();
  }

  $('#adminTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    view = tab.dataset.view;
    document.querySelectorAll('#adminTabs .tab').forEach((t) => t.classList.toggle('active', t === tab));
    render();
  });

  // ---------- actions ----------
  $('#view').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, id, status } = b.dataset;
    try {
      if (act === 'order') await api(`/orders/${id}`, 'PATCH', { status });
      if (act === 'reservation') await api(`/reservations/${id}`, 'PATCH', { status });
      if (act === 'toggle') await api(`/menu/${id}`, 'PATCH', { available: b.dataset.available !== 'true' });
      if (act === 'delete') {
        if (!confirm('Delete this item?')) return;
        await api(`/menu/${id}`, 'DELETE');
      }
      await load(true);
    } catch (err) {
      alert(err.message);
    }
  });

  $('#view').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fields = Object.fromEntries(new FormData(form).entries());
    try {
      if (form.id === 'addForm') await api('/menu', 'POST', fields);
      else if (form.id === 'specialForm') await api('/special', 'PUT', fields);
      else await api(`/menu/${form.dataset.id}`, 'PATCH', fields);
      await load(true);
    } catch (err) {
      alert(err.message);
    }
  });

  // ---------- start ----------
  if (token) {
    api('/check').then(start).catch(logout);
  }
})();