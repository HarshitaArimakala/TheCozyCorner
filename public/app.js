(() => {
  'use strict';


  const $ = (sel) => document.querySelector(sel);
  const rupee = (n) => '₹' + n.toLocaleString('en-IN');


  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }


  function titleCase(s) {
    return String(s).trim().replace(/(^|\s)(\p{L})/gu, (m, space, ch) => space + ch.toUpperCase());
  }

  function sentenceCase(s) {
    const t = String(s || '').trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }


  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
  }

  function setMsg(el, text, ok) {
    el.textContent = text;
    el.className = 'form-msg ' + (ok ? 'ok' : 'err');
  }


  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }


  // ---------- state ----------
  let menu = [];
  let activeCategory = 'All';
  let cart = loadCart();

  // localStorage can fail (private mode, blocked), so it is wrapped in try/catch.
  function loadCart() {
    try { return JSON.parse(localStorage.getItem('hb-cart')) || []; }
    catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem('hb-cart', JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }

  // ---------- navbar (phone menu button) ----------
  const navLinks = $('#navLinks');
  const navToggle = $('#navToggle');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  $('#year').textContent = new Date().getFullYear();

  // ---------- menu ----------
  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('bad response');
      menu = await res.json();
      renderTabs();
      renderMenu();
      // Remove cart lines for items that no longer exist on the menu.
      cart = cart.filter((line) => menu.some((m) => m.id === line.id));
      saveCart();
      renderCart();
    } catch (e) {
      $('#menuGrid').innerHTML = '<p class="muted">Couldn\'t load the menu. Please refresh.</p>';
    }
  }

  function renderTabs() {
    const categories = ['All', ...new Set(menu.map((m) => m.category))];
    $('#menuTabs').innerHTML = categories
      .map((c) => `<button class="tab${c === activeCategory ? ' active' : ''}" data-cat="${esc(c)}" role="tab">${esc(c)}</button>`)
      .join('');
  }

  function renderMenu() {
    const items = activeCategory === 'All' ? menu : menu.filter((m) => m.category === activeCategory);
    $('#menuGrid').innerHTML = items.length
      ? items.map((m) => `
        <article class="card">
          <div class="card-top"><h3>${esc(titleCase(m.name))}</h3><span class="price">${rupee(m.price)}</span></div>
          <p>${esc(sentenceCase(m.description))}</p>
          <button class="add" data-id="${m.id}">+ Add to order</button>
        </article>`).join('')
      : '<p class="muted">Nothing here yet.</p>';
  }

  // Event delegation: one listener on the parent handles clicks on all tabs / buttons inside it.
  $('#menuTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    activeCategory = tab.dataset.cat;
    renderTabs();
    renderMenu();
  });

  $('#menuGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.add');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    addToCart(id);
    btn.textContent = '✓ Added';
    setTimeout(() => { btn.textContent = '+ Add to order'; }, 900);
  });

  // ---------- cart drawer ----------
  const drawer = $('#drawer');
  const overlay = $('#overlay');

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
  }
  $('#cartBtn').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  // ---------- cart logic ----------
  const MAX_QTY = 20;

  function addToCart(id) {
    const line = cart.find((l) => l.id === id);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + 1);
    else cart.push({ id, qty: 1 });
    saveCart();
    renderCart();
    // Little bounce on the cart counter so people notice something happened.
    const counter = $('#cartCount');
    counter.classList.remove('bump');
    void counter.offsetWidth;
    counter.classList.add('bump');
  }

  function changeQty(id, delta) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.qty = Math.min(MAX_QTY, line.qty + delta);
    if (line.qty <= 0) cart = cart.filter((l) => l.id !== id);
    saveCart();
    renderCart();
  }

  function renderCart() {
    let total = 0;
    let count = 0;
    const rows = cart.map((l) => {
      const item = menu.find((m) => m.id === l.id);
      if (!item) return '';
      const name = titleCase(item.name);
      total += item.price * l.qty;
      count += l.qty;
      return `
        <div class="line">
          <span class="name">${esc(name)}</span>
          <span>${rupee(item.price * l.qty)}</span>
          <div class="qty">
            <button data-id="${l.id}" data-d="-1" aria-label="Remove one ${esc(name)}">−</button>
            <span>${l.qty}</span>
            <button data-id="${l.id}" data-d="1" aria-label="Add one ${esc(name)}">+</button>
            <span class="sub-price">${rupee(item.price)} each</span>
          </div>
        </div>`;
    });
    $('#cartItems').innerHTML = count
      ? rows.join('')
      : '<p class="muted">Your order is empty. Add something tasty from the menu.</p>';
    $('#cartTotal').textContent = rupee(total);
    $('#cartCount').textContent = count;
  }

  $('#cartItems').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b) changeQty(Number(b.dataset.id), Number(b.dataset.d));
  });

  // ---------- place order ----------
  $('#orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = $('#orderMsg');
    const btn = form.querySelector('button[type="submit"]');
    if (!cart.length) return setMsg(msg, 'Your cart is empty.', false);
    btn.disabled = true;
    try {
      // Only ids and quantities are sent; the server works out the prices itself.
      const data = await postJSON('/api/orders', { ...formData(form), items: cart });
      setMsg(msg, `Order #${data.id} placed! Total ${rupee(data.total)}. We'll have it ready shortly.`, true);
      cart = [];
      saveCart();
      renderCart();
      form.reset();
    } catch (err) {
      setMsg(msg, err.message, false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- reservation form ----------
  const reserveForm = $('#reserveForm');
  // Stop picking past dates in the date box (local date, not UTC).
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  reserveForm.elements.date.min = today;

  reserveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('#reserveMsg');
    const btn = reserveForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await postJSON('/api/reservations', formData(reserveForm));
      setMsg(msg, 'Thanks! Your table request is in. We\'ll confirm by phone soon.', true);
      reserveForm.reset();
      reserveForm.elements.guests.value = 2;
    } catch (err) {
      setMsg(msg, err.message, false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- contact form ----------
  $('#contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const msg = $('#contactMsg');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await postJSON('/api/contact', formData(form));
      setMsg(msg, 'Thanks! We\'ll get back to you soon.', true);
      form.reset();
    } catch (err) {
      setMsg(msg, err.message, false);
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- start ----------
  renderCart();
  loadMenu();
})();