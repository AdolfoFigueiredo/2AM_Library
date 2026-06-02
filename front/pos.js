/**
 * ═══════════════════════════════════════════════════════════
 *  2AM Library — POS · pos.js
 *  Sistema de Frente de Caixa — Lógica principal
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────────────
   DADOS DE DEMONSTRAÇÃO
   (Em produção substituir por chamadas à API real)
───────────────────────────────────────────────────────── */
const DEMO_BOOKS = [
  { id: 'B001', title: 'O Alquimista',            author: 'Paulo Coelho',      price: 3500,  stock: 12, isbn: '9780062315007' },
  { id: 'B002', title: 'Memórias do Subsolo',     author: 'Fiódor Dostoiévski',price: 2800,  stock: 5,  isbn: '9788535911589' },
  { id: 'B003', title: 'Cem Anos de Solidão',     author: 'García Márquez',    price: 4200,  stock: 8,  isbn: '9780060883287' },
  { id: 'B004', title: 'O Pequeno Príncipe',      author: 'Antoine de S.-Exupéry', price: 1900, stock: 20, isbn: '9780156012195' },
  { id: 'B005', title: 'Ensaio sobre a Cegueira', author: 'José Saramago',     price: 3800,  stock: 3,  isbn: '9780156007757' },
  { id: 'B006', title: 'Dom Casmurro',            author: 'Machado de Assis',  price: 2500,  stock: 0,  isbn: '9788535914849' },
  { id: 'B007', title: 'A Metamorfose',           author: 'Franz Kafka',       price: 2200,  stock: 7,  isbn: '9780143105015' },
  { id: 'B008', title: 'Grande Sertão: Veredas',  author: 'João Guimarães Rosa',price: 5000, stock: 2,  isbn: '9788501013958' },
  { id: 'B009', title: '1984',                    author: 'George Orwell',     price: 3200,  stock: 15, isbn: '9780451524935' },
  { id: 'B010', title: 'A Hora da Estrela',       author: 'Clarice Lispector', price: 2700,  stock: 9,  isbn: '9788571641273' },
  { id: 'B011', title: 'Senhor dos Anéis',        author: 'J.R.R. Tolkien',    price: 6500,  stock: 4,  isbn: '9780618002030' },
  { id: 'B012', title: 'Harry Potter e a Pedra Filosofal', author: 'J.K. Rowling', price: 4800, stock: 6, isbn: '9780439708180' },
];

const DEMO_SALES = [
  { id: 'VND-0041', customer: 'Maria Fernanda', date: new Date(Date.now() - 1_800_000), total: 8200, method: 'cash',     status: 'completed', items: [{title:'O Alquimista', qty:2, unit:3500},{title:'A Metamorfose', qty:1, unit:2200}] },
  { id: 'VND-0040', customer: 'João Manuel',    date: new Date(Date.now() - 5_400_000), total: 4200, method: 'tpa',      status: 'completed', items: [{title:'Cem Anos de Solidão', qty:1, unit:4200}] },
  { id: 'VND-0039', customer: '—',              date: new Date(Date.now() - 86_400_000),total: 6500, method: 'transfer', status: 'completed', items: [{title:'Senhor dos Anéis', qty:1, unit:6500}] },
  { id: 'VND-0038', customer: 'Ana Sofia',      date: new Date(Date.now() - 172_800_000),total:5700, method: 'cash',     status: 'completed', items: [{title:'1984', qty:1, unit:3200},{title:'A Hora da Estrela',qty:1,unit:2700}] },
  { id: 'VND-0037', customer: 'Pedro Lopes',    date: new Date(Date.now() - 259_200_000),total:9600, method: 'tpa',      status: 'completed', items: [{title:'Harry Potter',qty:2,unit:4800}] },
];

/* ─────────────────────────────────────────────────────────
   ESTADO DA APLICAÇÃO
───────────────────────────────────────────────────────── */
const State = {
  books:       [],          // catálogo carregado
  filtered:    [],          // resultados de pesquisa
  cart:        [],          // [{ book, qty }]
  discount:    0,
  paymentMethod: 'cash',
  customer:    '',
  operator:    'Operador',
  sales:       [...DEMO_SALES],
};

/* ─────────────────────────────────────────────────────────
   UTILITÁRIOS
───────────────────────────────────────────────────────── */
const fmt = {
  /** Formata valor em Kwanzas */
  aoa(value) {
    return 'AOA ' + value.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  /** Formata data/hora */
  datetime(date) {
    return date.toLocaleString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  /** Gera ID único de venda */
  saleId() {
    const next = State.sales.length > 0
      ? Math.max(...State.sales.map(s => parseInt(s.id.replace('VND-', ''), 10))) + 1
      : 1;
    return 'VND-' + String(next).padStart(4, '0');
  },
};

/** Selecção de elemento DOM (com fallback silencioso) */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/* ─────────────────────────────────────────────────────────
   SISTEMA DE TOAST
───────────────────────────────────────────────────────── */
const Toast = (() => {
  const container = document.getElementById('toast-container');
  const ICONS = {
    success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>`,
    error:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  function show(message, type = 'info', duration = 3500) {
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `${ICONS[type] || ''}<span>${message}</span>`;
    container.appendChild(el);

    const dismiss = () => {
      el.classList.add('toast-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    const timer = setTimeout(dismiss, duration);
    el.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',    dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
  };
})();

/* ─────────────────────────────────────────────────────────
   NAVEGAÇÃO POR ABAS
───────────────────────────────────────────────────────── */
function initTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      $$('.tab-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });

      $$('.screen').forEach(s => {
        s.classList.toggle('active', s.id === `screen-${target}`);
        s.classList.toggle('hidden', s.id !== `screen-${target}`);
      });

      if (target === 'dashboard') loadDashboard();
    });
  });
}

/* ─────────────────────────────────────────────────────────
   CATÁLOGO DE LIVROS
───────────────────────────────────────────────────────── */
function showCatalogState(state) {
  // 'loading' | 'empty' | 'error' | 'grid'
  $('#catalog-loading').classList.toggle('hidden', state !== 'loading');
  $('#catalog-empty').classList.toggle('hidden',   state !== 'empty');
  $('#catalog-error').classList.toggle('hidden',   state !== 'error');
  $('#books-grid').classList.toggle('hidden',      state !== 'grid');
}

async function loadCatalog() {
  showCatalogState('loading');
  try {
    // Simula latência de rede
    await new Promise(r => setTimeout(r, 600));
    State.books    = [...DEMO_BOOKS];
    State.filtered = [...DEMO_BOOKS];
    renderBooks(State.filtered);
    showCatalogState('grid');
    updateCatalogCount(State.filtered.length);
  } catch (err) {
    console.error('[POS] Erro ao carregar catálogo:', err);
    showCatalogState('error');
  }
}

function renderBooks(books) {
  const grid = $('#books-grid');
  grid.innerHTML = '';

  if (!books.length) {
    showCatalogState('empty');
    return;
  }

  showCatalogState('grid');
  const fragment = document.createDocumentFragment();

  books.forEach(book => {
    const outOfStock = book.stock === 0;
    const lowStock   = book.stock > 0 && book.stock <= 3;

    const card = document.createElement('article');
    card.className = `book-card${outOfStock ? ' out-of-stock' : ''}`;
    card.setAttribute('role', 'listitem');
    card.dataset.id = book.id;

    const stockLabel = outOfStock ? 'Sem stock'
      : lowStock ? `⚠ Últimas ${book.stock} unid.`
      : `${book.stock} em stock`;
    const stockClass = outOfStock ? 'out' : lowStock ? 'low' : '';

    card.innerHTML = `
      <span class="book-title">${escapeHtml(book.title)}</span>
      <span class="book-author">${escapeHtml(book.author)}</span>
      <span class="book-price">${fmt.aoa(book.price)}</span>
      <span class="book-stock ${stockClass}">${stockLabel}</span>
      <button class="btn-add" data-id="${book.id}" ${outOfStock ? 'disabled aria-disabled="true"' : ''} aria-label="Adicionar ${escapeHtml(book.title)} ao carrinho">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Adicionar
      </button>
    `;

    card.querySelector('.btn-add').addEventListener('click', () => addToCart(book.id));
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function updateCatalogCount(count) {
  $('#catalog-count').textContent = `${count} livro${count !== 1 ? 's' : ''}`;
}

function filterBooks(query) {
  const q = query.trim().toLowerCase();
  State.filtered = q
    ? State.books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.id.toLowerCase().includes(q)
      )
    : [...State.books];

  renderBooks(State.filtered);
  updateCatalogCount(State.filtered.length);
}

function initCatalog() {
  const searchInput = $('#search-input');
  let debounceTimer;

  searchInput.addEventListener('input', e => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => filterBooks(e.target.value), 200);
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchInput.value = ''; filterBooks(''); }
  });

  $('#btn-refresh-catalog').addEventListener('click', () => {
    searchInput.value = '';
    loadCatalog();
    Toast.info('Catálogo recarregado');
  });

  $('#btn-retry-catalog').addEventListener('click', loadCatalog);

  loadCatalog();
}

/* ─────────────────────────────────────────────────────────
   CARRINHO
───────────────────────────────────────────────────────── */
function addToCart(bookId) {
  const book = State.books.find(b => b.id === bookId);
  if (!book || book.stock === 0) return;

  const existing = State.cart.find(item => item.book.id === bookId);
  if (existing) {
    if (existing.qty >= book.stock) {
      Toast.warning(`Stock máximo: ${book.stock} unidades`);
      return;
    }
    existing.qty++;
  } else {
    State.cart.push({ book, qty: 1 });
  }

  renderCart();
  bumpBadge();
  Toast.success(`"${book.title}" adicionado`);
}

function removeFromCart(bookId) {
  State.cart = State.cart.filter(item => item.book.id !== bookId);
  renderCart();
}

function updateQty(bookId, delta) {
  const item = State.cart.find(i => i.book.id === bookId);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(bookId);
    return;
  }
  if (newQty > item.book.stock) {
    Toast.warning(`Stock máximo: ${item.book.stock} unidades`);
    return;
  }
  item.qty = newQty;
  renderCart();
}

function clearCart() {
  if (!State.cart.length) return;
  State.cart = [];
  State.discount = 0;
  $('#discount-input').value = 0;
  renderCart();
  Toast.info('Carrinho limpo');
}

function renderCart() {
  const list      = $('#cart-list');
  const emptyEl   = $('#cart-empty-state');
  const badge     = $('#cart-badge');
  const isEmpty   = State.cart.length === 0;

  emptyEl.classList.toggle('hidden', !isEmpty);
  list.classList.toggle('hidden',     isEmpty);
  list.innerHTML = '';

  if (!isEmpty) {
    const fragment = document.createDocumentFragment();
    State.cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.id = item.book.id;
      li.innerHTML = `
        <div class="cart-item-info">
          <p class="cart-item-title">${escapeHtml(item.book.title)}</p>
          <span class="cart-item-price">${fmt.aoa(item.book.price)} × ${item.qty} = ${fmt.aoa(item.book.price * item.qty)}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec" data-id="${item.book.id}" aria-label="Diminuir quantidade">−</button>
          <span class="qty-display" aria-label="Quantidade: ${item.qty}">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.book.id}" aria-label="Aumentar quantidade">+</button>
          <button class="btn-remove-item" data-id="${item.book.id}" aria-label="Remover ${escapeHtml(item.book.title)}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;
      li.querySelector('[data-action="dec"]').addEventListener('click',  () => updateQty(item.book.id, -1));
      li.querySelector('[data-action="inc"]').addEventListener('click',  () => updateQty(item.book.id, +1));
      li.querySelector('.btn-remove-item').addEventListener('click',     () => removeFromCart(item.book.id));
      fragment.appendChild(li);
    });
    list.appendChild(fragment);
  }

  const totalItems = State.cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = totalItems;

  updateTotals();
  updateCheckoutButton();
}

function updateTotals() {
  const subtotal = State.cart.reduce((s, i) => s + i.book.price * i.qty, 0);
  const discount = Math.min(State.discount, subtotal);
  const total    = Math.max(0, subtotal - discount);

  $('#subtotal-val').textContent = fmt.aoa(subtotal);
  $('#total-val').textContent    = fmt.aoa(total);
}

function updateCheckoutButton() {
  const btn     = $('#btn-checkout');
  const hasItems = State.cart.length > 0;
  btn.disabled  = !hasItems;
  btn.setAttribute('aria-disabled', !hasItems ? 'true' : 'false');
}

function bumpBadge() {
  const badge = $('#cart-badge');
  badge.classList.remove('bump');
  void badge.offsetWidth; // reflow para reiniciar animação
  badge.classList.add('bump');
}

function initCart() {
  $('#btn-clear-cart').addEventListener('click', clearCart);

  $('#discount-input').addEventListener('input', e => {
    const val = parseFloat(e.target.value) || 0;
    State.discount = Math.max(0, val);
    updateTotals();
  });

  $$('.payment-method').forEach(label => {
    label.addEventListener('click', () => {
      $$('.payment-method').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      State.paymentMethod = label.dataset.method;
    });
  });

  $('#customer-input').addEventListener('input', e => {
    State.customer = e.target.value.trim();
  });

  updateCheckoutButton();
}

/* ─────────────────────────────────────────────────────────
   MODAL DE CONFIRMAÇÃO DE VENDA
───────────────────────────────────────────────────────── */
function getPaymentLabel(method) {
  return { cash: 'Dinheiro / Numerário', tpa: 'TPA / Cartão', transfer: 'Transferência Bancária' }[method] || method;
}

function openConfirmModal() {
  if (!State.cart.length) return;

  const subtotal = State.cart.reduce((s, i) => s + i.book.price * i.qty, 0);
  const discount = Math.min(State.discount, subtotal);
  const total    = Math.max(0, subtotal - discount);

  // Preenche resumo
  const summaryEl = $('#modal-summary');
  summaryEl.innerHTML = State.cart.map(item => `
    <div class="modal-summary-item">
      <span class="modal-summary-name">${escapeHtml(item.book.title)}</span>
      <span class="modal-summary-sub">${item.qty} × ${fmt.aoa(item.book.price)}</span>
    </div>
  `).join('');

  if (discount > 0) {
    summaryEl.innerHTML += `
      <div class="modal-summary-item" style="margin-top:4px;padding-top:4px;border-top:1px solid var(--border);">
        <span class="modal-summary-name" style="color:var(--status-warning);">Desconto</span>
        <span class="modal-summary-sub" style="color:var(--status-warning);">−${fmt.aoa(discount)}</span>
      </div>
    `;
  }

  $('#modal-total').textContent  = fmt.aoa(total);
  $('#modal-method').textContent = getPaymentLabel(State.paymentMethod);

  const overlay = $('#modal-confirm');
  overlay.classList.remove('hidden');
  overlay.querySelector('.modal-box').focus?.();
  $('#modal-confirm-btn').focus();
}

function closeConfirmModal() {
  $('#modal-confirm').classList.add('hidden');
}

async function confirmSale() {
  const btn = $('#modal-confirm-btn');
  btn.classList.add('btn-loading');
  btn.disabled = true;

  try {
    // Simula chamada à API de processamento
    await new Promise(r => setTimeout(r, 900));

    const subtotal = State.cart.reduce((s, i) => s + i.book.price * i.qty, 0);
    const discount = Math.min(State.discount, subtotal);
    const total    = Math.max(0, subtotal - discount);

    const sale = {
      id:       fmt.saleId(),
      customer: State.customer || '—',
      date:     new Date(),
      total,
      method:   State.paymentMethod,
      status:   'completed',
      items:    State.cart.map(i => ({ title: i.book.title, qty: i.qty, unit: i.book.price })),
    };

    // Actualiza stock em memória
    State.cart.forEach(item => {
      const book = State.books.find(b => b.id === item.book.id);
      if (book) book.stock = Math.max(0, book.stock - item.qty);
    });

    // Regista venda
    State.sales.unshift(sale);

    // Fecha modal de confirmação
    closeConfirmModal();

    // Limpa carrinho
    State.cart     = [];
    State.discount = 0;
    State.customer = '';
    $('#discount-input').value = 0;
    $('#customer-input').value = '';
    renderCart();

    // Re-renderiza catálogo para actualizar stock
    renderBooks(State.filtered.length ? State.filtered : State.books);

    // Mostra modal de sucesso
    $('#modal-success-id').textContent = sale.id;
    $('#modal-success').classList.remove('hidden');
    $('#modal-success-close').focus();

  } catch (err) {
    console.error('[POS] Erro ao processar venda:', err);
    Toast.error('Falha ao registar venda. Tenta novamente.');
  } finally {
    btn.classList.remove('btn-loading');
    btn.disabled = false;
  }
}

function initModals() {
  // Confirmar venda
  $('#btn-checkout').addEventListener('click', openConfirmModal);
  $('#modal-close').addEventListener('click', closeConfirmModal);
  $('#modal-cancel').addEventListener('click', closeConfirmModal);
  $('#modal-confirm-btn').addEventListener('click', confirmSale);

  // Fechar ao clicar no overlay
  $('#modal-confirm').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeConfirmModal();
  });

  // Modal de sucesso
  $('#modal-success-close').addEventListener('click', () => {
    $('#modal-success').classList.add('hidden');
    Toast.success('Pronto para nova venda!');
    $('#search-input').focus();
  });

  $('#modal-success').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      $('#modal-success').classList.add('hidden');
    }
  });
}

/* ─────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────── */
async function loadDashboard() {
  // KPIs
  const totalRevenue = State.sales.reduce((s, sale) => s + sale.total, 0);
  const totalSales   = State.sales.length;
  const totalBooks   = State.sales.reduce((s, sale) =>
    s + sale.items.reduce((ss, item) => ss + item.qty, 0), 0);
  const outOfStock   = State.books.filter(b => b.stock === 0).length;

  animateCounter('#kpi-revenue-val', totalRevenue, v => fmt.aoa(v));
  animateCounter('#kpi-sales-val',   totalSales,   v => String(Math.round(v)));
  animateCounter('#kpi-books-val',   totalBooks,   v => String(Math.round(v)));
  animateCounter('#kpi-stock-val',   outOfStock,   v => String(Math.round(v)));

  // Tabela de vendas
  await renderSalesTable();

  // Mais vendidos
  renderBestsellers();
}

function animateCounter(selector, targetValue, formatFn, duration = 800) {
  const el = $(selector);
  if (!el) return;
  const start     = performance.now();
  const startVal  = 0;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = formatFn(startVal + (targetValue - startVal) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

async function renderSalesTable() {
  const loading = $('#sales-table-loading');
  const empty   = $('#sales-table-empty');
  const table   = $('#sales-table');

  loading.classList.remove('hidden');
  empty.classList.add('hidden');
  table.classList.add('hidden');

  await new Promise(r => setTimeout(r, 400));

  loading.classList.add('hidden');

  if (!State.sales.length) {
    empty.classList.remove('hidden');
    return;
  }

  const tbody  = $('#sales-tbody');
  const STATUS = { completed: { label: 'Concluída', cls: 'status-success' } };

  tbody.innerHTML = State.sales.slice(0, 20).map(sale => {
    const s = STATUS[sale.status] || { label: sale.status, cls: '' };
    return `
      <tr>
        <td><span class="mono" style="color:var(--text-muted);font-size:12px;">${sale.id}</span></td>
        <td>${escapeHtml(sale.customer)}</td>
        <td style="font-size:12px;color:var(--text-muted);">${fmt.datetime(sale.date)}</td>
        <td><span class="mono" style="color:var(--orange);">${fmt.aoa(sale.total)}</span></td>
        <td><span class="status-badge status-badge--${sale.method === 'cash' ? 'success' : sale.method === 'tpa' ? 'info' : 'warning'}">${getPaymentLabel(sale.method)}</span></td>
        <td>
          <button class="btn-outline-sm" data-sale-id="${sale.id}" aria-label="Ver detalhes da venda ${sale.id}">Detalhes</button>
        </td>
      </tr>
    `;
  }).join('');

  // Eventos de detalhe
  tbody.querySelectorAll('[data-sale-id]').forEach(btn => {
    btn.addEventListener('click', () => showSaleDetail(btn.dataset.saleId));
  });

  table.classList.remove('hidden');
}

function renderBestsellers() {
  const loadingEl = $('#bestsellers-loading');
  const listEl    = $('#bestsellers-list');

  loadingEl.classList.remove('hidden');
  listEl.classList.add('hidden');

  // Agrega vendas por título
  const tally = {};
  State.sales.forEach(sale => {
    sale.items.forEach(item => {
      tally[item.title] = (tally[item.title] || 0) + item.qty;
    });
  });

  const ranked = Object.entries(tally)
    .map(([title, qty]) => ({ title, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  setTimeout(() => {
    loadingEl.classList.add('hidden');

    if (!ranked.length) return;

    const maxQty = ranked[0].qty;
    listEl.innerHTML = ranked.map((item, i) => `
      <li class="bestseller-item">
        <span class="bestseller-rank">${i + 1}</span>
        <div class="bestseller-info">
          <span class="bestseller-title">${escapeHtml(item.title)}</span>
          <div class="bestseller-bar-wrap">
            <div class="bestseller-bar" style="width:${(item.qty / maxQty * 100).toFixed(0)}%"></div>
          </div>
        </div>
        <span class="bestseller-qty mono">${item.qty} vend.</span>
      </li>
    `).join('');

    listEl.classList.remove('hidden');
  }, 300);
}

function showSaleDetail(saleId) {
  const sale = State.sales.find(s => s.id === saleId);
  if (!sale) return;

  const itemsHtml = sale.items.map(i =>
    `<div class="modal-summary-item">
      <span class="modal-summary-name">${escapeHtml(i.title)}</span>
      <span class="modal-summary-sub">${i.qty} × ${fmt.aoa(i.unit)}</span>
    </div>`
  ).join('');

  $('#modal-summary').innerHTML = itemsHtml;
  $('#modal-total').textContent  = fmt.aoa(sale.total);
  $('#modal-method').textContent = getPaymentLabel(sale.method);

  const titleEl = document.getElementById('modal-title');
  titleEl.textContent = `Venda ${sale.id}`;

  $('#modal-confirm-btn').style.display = 'none';
  $('#modal-cancel').textContent        = 'Fechar';

  $('#modal-confirm').classList.remove('hidden');

  // Restaura botão ao fechar
  const restore = () => {
    $('#modal-confirm-btn').style.display = '';
    $('#modal-cancel').textContent        = 'Cancelar';
    titleEl.textContent                   = 'Confirmar Venda';
  };
  $('#modal-close').addEventListener('click',  restore, { once: true });
  $('#modal-cancel').addEventListener('click', restore, { once: true });
  $('#modal-confirm').addEventListener('click', e => {
    if (e.target === e.currentTarget) restore();
  }, { once: true });
}

function initDashboard() {
  $('#btn-refresh-dashboard').addEventListener('click', async () => {
    await loadDashboard();
    Toast.info('Dashboard actualizado');
  });
}

/* ─────────────────────────────────────────────────────────
   OPERADOR & SESSÃO
───────────────────────────────────────────────────────── */
function initOperator() {
  // Simula nome do operador (em produção vem da sessão/auth)
  const savedName = sessionStorage.getItem('pos_operator') || 'Ana Paula';
  State.operator = savedName;
  $('#operator-name').textContent = savedName;

  $('#btn-logout').addEventListener('click', () => {
    const confirmed = window.confirm('Terminar sessão e sair do sistema?');
    if (confirmed) {
      sessionStorage.removeItem('pos_operator');
      Toast.info('Sessão terminada. Até logo!');
      setTimeout(() => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s';
        // Em produção: window.location.href = '/login';
        setTimeout(() => { document.body.style.opacity = '1'; }, 800);
      }, 1200);
    }
  });
}

/* ─────────────────────────────────────────────────────────
   ATALHOS DE TECLADO
───────────────────────────────────────────────────────── */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const inInput = ['input', 'textarea', 'select'].includes(tag);

    // Ctrl+K → focar pesquisa
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = $('#search-input');
      searchInput.focus();
      searchInput.select();
    }

    // F8 → finalizar venda
    if (e.key === 'F8') {
      e.preventDefault();
      if (!$('#btn-checkout').disabled) openConfirmModal();
    }

    // Escape → fechar modais
    if (e.key === 'Escape') {
      if (!$('#modal-confirm').classList.contains('hidden')) closeConfirmModal();
      if (!$('#modal-success').classList.contains('hidden')) $('#modal-success').classList.add('hidden');
      if (!inInput) { $('#search-input').value = ''; filterBooks(''); }
    }

    // Enter → confirmar modal aberto
    if (e.key === 'Enter' && !$('#modal-confirm').classList.contains('hidden')) {
      if (document.activeElement?.id === 'modal-confirm-btn') confirmSale();
    }
  });
}

/* ─────────────────────────────────────────────────────────
   UTILITÁRIO ANTI-XSS
───────────────────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─────────────────────────────────────────────────────────
   INJECÇÃO DE ESTILOS DINÂMICOS (componentes JS-only)
───────────────────────────────────────────────────────── */
function injectDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.03em;
    }
    .status-badge--success { background: rgba(16,185,129,0.12); color: var(--status-success); }
    .status-badge--info    { background: rgba(31,86,204,0.15);  color: #5b8ef0; }
    .status-badge--warning { background: rgba(245,158,11,0.12); color: var(--status-warning); }

    .bestseller-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--border);
    }
    .bestseller-item:last-child { border-bottom: none; }

    .bestseller-rank {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      color: var(--orange);
      min-width: 20px;
      text-align: center;
    }

    .bestseller-info {
      flex: 1;
      min-width: 0;
    }

    .bestseller-title {
      display: block;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .bestseller-bar-wrap {
      height: 3px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
    }

    .bestseller-bar {
      height: 100%;
      background: var(--orange);
      border-radius: 2px;
      transition: width 0.6s ease;
    }

    .bestseller-qty {
      font-size: 11px;
      color: var(--text-subtle);
      white-space: nowrap;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────────────────
   PONTO DE ENTRADA
───────────────────────────────────────────────────────── */
function init() {
  injectDynamicStyles();
  initOperator();
  initTabs();
  initCatalog();
  initCart();
  initModals();
  initDashboard();
  initKeyboardShortcuts();

  // Estado inicial da UI
  updateCheckoutButton();

  console.info('[2AM POS] Sistema iniciado com sucesso ✓');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}