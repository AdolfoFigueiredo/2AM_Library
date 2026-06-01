/**
 * ═══════════════════════════════════════════════════════════
 * 2AM LIBRARY — PAINEL ADMINISTRATIVO  |  erp.js  v2.0.0
 * Integração 100% real com API (http://localhost:4000/api).
 * Token JWT obrigatório (sessionStorage). Sem mocks, sem bypass.
 * ═══════════════════════════════════════════════════════════
 */
'use strict';

const API_BASE = 'http://localhost:4000/api';
const TOKEN_KEY = '2am_jwt_token';
const USER_KEY  = '2am_user';

/* ─────────────── GUARDA DE ACESSO ─────────────── */
(function authGuard() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.replace('index.html');
  }
})();

/* ─────────────── ESTADO ─────────────── */
const AppState = {
  get token() { return sessionStorage.getItem(TOKEN_KEY); },
  get user()  { try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; } },
  currentScreen: 'dashboard',
  books: [],
  categories: [],
  sales: [],
  users: [],
  suppliers: [],
  stockAlerts: []
};

/* ─────────────── HTTP LAYER ─────────────── */
const API = {
  getHeaders(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (AppState.token) h['Authorization'] = `Bearer ${AppState.token}`;
    return h;
  },

  async handle(res) {
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      Toast.show('danger', 'Sessão expirada', 'Faça login novamente.');
      setTimeout(() => window.location.replace('index.html'), 800);
      throw new Error('Não autorizado.');
    }
    let body = null;
    try { body = await res.json(); } catch (_) {}
    if (!res.ok) {
      const msg = body?.message
        || (Array.isArray(body?.errors) ? body.errors.map(e => e.message).join(' • ') : null)
        || `Erro HTTP ${res.status}`;
      throw new Error(msg);
    }
    return body?.data !== undefined ? body.data : body;
  },

  async req(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: this.getHeaders(options.headers || {})
    });
    return this.handle(res);
  },

  // DASHBOARD
  getDashboardOverview()    { return this.req('/dashboard/overview'); },
  getDashboardSalesReport() { return this.req('/dashboard/sales-report'); },

  // BOOKS
  getBooks()         { return this.req('/books'); },
  createBook(p)      { return this.req('/books', { method: 'POST', body: JSON.stringify(p) }); },
  deleteBook(id)     { return this.req(`/books/${id}`, { method: 'DELETE' }); },

  // CATEGORIES
  getCategories()    { return this.req('/categories'); },
  createCategory(p)  { return this.req('/categories', { method: 'POST', body: JSON.stringify(p) }); },

  // STOCK
  getStockAlerts()   { return this.req('/inventory/low-stock'); },
  replenishStock(p)  { return this.req('/inventory/replenish', { method: 'POST', body: JSON.stringify(p) }); },

  // SALES
  getSales(query = {}) {
    const qs = new URLSearchParams(query).toString();
    return this.req(`/sales${qs ? `?${qs}` : ''}`);
  },
  patchSaleStatus(id, status) {
    return this.req(`/sales/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },

  // USERS
  getUsers()         { return this.req('/users'); },
  createUser(p)      { return this.req('/users', { method: 'POST', body: JSON.stringify(p) }); },
  banUser(id)        { return this.req(`/users/${id}`, { method: 'DELETE' }); },

  // SUPPLIERS
  getSuppliers()                 { return this.req('/suppliers'); },
  createSupplier(p)              { return this.req('/suppliers', { method: 'POST', body: JSON.stringify(p) }); },
  deleteSupplier(id)             { return this.req(`/suppliers/${id}`, { method: 'DELETE' }); },
  addSupplierPhone(id, phone)    { return this.req(`/suppliers/${id}/phones`, { method: 'POST', body: JSON.stringify({ phone }) }); }
};

/* ─────────────── UI HELPERS ─────────────── */
const fmtAOA = (n) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(n) || 0);
const fmtDate = (d) => d ? String(d).split('T')[0] : '—';

const Toast = {
  show(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) { console.log(`[${type}] ${title}: ${message}`); return; }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-title">${title}</div><div class="toast-msg">${message}</div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
};

const Modal = {
  open(id)  { document.getElementById(id)?.classList.remove('hidden'); },
  close(id) { document.getElementById(id)?.classList.add('hidden'); }
};

/* ─────────────── SIDEBAR ─────────────── */
const Sidebar = {
  init() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const screen = item.getAttribute('data-screen');
        if (screen) this.navigate(screen);
      });
    });

    document.getElementById('sidebarToggle')?.addEventListener('click',
      () => document.getElementById('sidebar')?.classList.toggle('open'));
    document.getElementById('sidebarOverlay')?.addEventListener('click',
      () => document.getElementById('sidebar')?.classList.remove('open'));

    // Reflete o utilizador autenticado na sidebar/topbar (sem alterar markup)
    const u = AppState.user;
    if (u) {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Operador';
      const initials = (u.firstName?.[0] || '') + (u.lastName?.[0] || '');
      document.querySelectorAll('.profile-name, .topbar-name').forEach(n => n.textContent = fullName);
      document.querySelectorAll('.profile-role').forEach(n => n.textContent = u.role === 'admin' ? 'Administrador' : 'Operador');
      if (initials) document.querySelectorAll('.profile-avatar, .topbar-avatar').forEach(n => n.textContent = initials.toUpperCase());
    }
  },

  async navigate(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`screen-${screenId}`)?.classList.remove('hidden');
    document.querySelector(`.nav-item[data-screen="${screenId}"]`)?.classList.add('active');
    document.getElementById('sidebar')?.classList.remove('open');
    AppState.currentScreen = screenId;
    await App.syncContextData(screenId);
  }
};

/* ─────────────── VIEWS ─────────────── */
const DashboardView = {
  render(data) {
    const d = data || {};
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };

    setText('kpi-revenue', fmtAOA(d.totalRevenue));
    setText('kpi-sales',   d.totalSalesCount ?? 0);
    setText('kpi-clients', d.pendingOrdersCount ?? 0);
    setText('kpi-books',   Array.isArray(d.topSellingBooks) ? d.topSellingBooks.length : 0);

    const tbody = document.getElementById('table-dash-orders');
    if (!tbody) return;
    const rows = Array.isArray(d.topSellingBooks) ? d.topSellingBooks : [];
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-subtle)">Sem registos no período.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(o => `
      <tr>
        <td><code>${o.id ?? o.bookId ?? '—'}</code></td>
        <td>${o.name ?? o.title ?? '—'}</td>
        <td>${fmtAOA(o.totalRevenue ?? o.currentPrice ?? 0)}</td>
        <td><span class="badge badge-success">${o.unitsSold ?? o.quantity ?? 0} un</span></td>
      </tr>
    `).join('');
  },

  // Motor gráfico minimalista (SVG inline) — não cria elementos novos no DOM se o container não existir.
  renderChart(series) {
    const host = document.getElementById('chart-sales');
    if (!host || !Array.isArray(series) || series.length === 0) return;
    const w = host.clientWidth || 600;
    const h = host.clientHeight || 200;
    const max = Math.max(1, ...series.map(p => Number(p.dailyRevenue) || 0));
    const step = series.length > 1 ? w / (series.length - 1) : w;
    const pts = series.map((p, i) => {
      const x = i * step;
      const y = h - ((Number(p.dailyRevenue) || 0) / max) * (h - 10) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    host.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">
        <polyline fill="none" stroke="var(--orange)" stroke-width="2" points="${pts}" />
      </svg>`;
  }
};

const BooksView = {
  render(books) {
    const tbody = document.getElementById('table-books-body');
    if (!tbody) return;
    if (!books?.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-subtle)">Nenhum livro no catálogo.</td></tr>`;
      return;
    }
    tbody.innerHTML = books.map(b => `
      <tr>
        <td><code>${b.id}</code></td>
        <td><strong>${b.name ?? '—'}</strong></td>
        <td>${b.authorName ?? `ID ${b.authorId ?? '—'}`}</td>
        <td>${fmtAOA(b.currentPrice)}</td>
        <td>${b.stockQuantity ?? b.stock ?? 0} un</td>
        <td>${b.isbn ?? '—'}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="App.archiveBook('${b.id}')">Arquivar</button></td>
      </tr>
    `).join('');
  }
};

const CategoriesView = {
  render(categories) {
    const tbody = document.getElementById('table-categories-body');
    if (!tbody) return;
    if (!categories?.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-subtle)">Nenhuma categoria registada.</td></tr>`;
      return;
    }
    tbody.innerHTML = categories.map(c => `
      <tr>
        <td><code>${c.id}</code></td>
        <td>${c.name}</td>
        <td>${c.slug ?? `categoria-${c.id}`}</td>
        <td>${c.booksCount ?? 0}</td>
        <td>—</td>
      </tr>
    `).join('');
  }
};

const StockView = {
  render(alerts) {
    const tbody = document.getElementById('table-stock-body');
    const badge = document.getElementById('notifyBadge');
    if (badge) badge.innerText = alerts?.length || 0;
    if (!tbody) return;
    if (!alerts?.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--status-success)">✔ Estoque saudável.</td></tr>`;
      return;
    }
    tbody.innerHTML = alerts.map(a => `
      <tr>
        <td><code>${a.bookId ?? a.id}</code></td>
        <td><strong>${a.name ?? a.title ?? 'Livro'}</strong></td>
        <td class="danger">${a.stockQuantity ?? a.quantity ?? 0} un</td>
        <td>${a.supplierName ?? 'Fornecedor Geral'}</td>
        <td><button class="btn btn-primary btn-sm" onclick="App.openReplenish('${a.bookId ?? a.id}')">Repor</button></td>
      </tr>
    `).join('');
  }
};

const SalesView = {
  render(sales) {
    const tbody = document.getElementById('table-sales-body');
    if (!tbody) return;
    if (!sales?.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-subtle)">Sem transações registadas.</td></tr>`;
      return;
    }
    const statusBadge = (s) => {
      const t = (s || '').toLowerCase();
      if (t === 'completed') return 'badge-success';
      if (t === 'cancelled') return 'badge-danger';
      return 'badge-warning';
    };
    tbody.innerHTML = sales.map(s => `
      <tr>
        <td><code>${s.id}</code></td>
        <td>${s.customerName ?? `Cliente #${s.customerId ?? '—'}`}</td>
        <td>${fmtDate(s.saleDate)}</td>
        <td>${fmtAOA(s.totalAmount)}</td>
        <td><span class="badge ${statusBadge(s.status)}">${s.status}</span></td>
        <td>
          <select class="form-input" style="padding:4px 8px;font-size:12px" onchange="App.changeSaleStatus('${s.id}', this.value)">
            <option ${s.status==='Pending'?'selected':''}>Pending</option>
            <option ${s.status==='Completed'?'selected':''}>Completed</option>
            <option ${s.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');
  }
};

const UsersView = {
  render(users) {
    const tbody = document.getElementById('table-users-body');
    if (!tbody) return;
    if (!users?.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-subtle)">Nenhum utilizador.</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td><code>${u.id}</code></td>
        <td><strong>${u.firstName ?? ''} ${u.lastName ?? ''}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge badge-success">${u.role ?? 'employee'}</span></td>
        <td>${fmtDate(u.createdAt)}</td>
        <td><span class="badge badge-success">Ativo</span></td>
        <td><button class="btn btn-ghost btn-sm" onclick="App.banUser('${u.id}')">Desativar</button></td>
      </tr>
    `).join('');
  }
};

const SuppliersView = {
  render(suppliers) {
    const tbody = document.getElementById('table-suppliers-body');
    if (!tbody) return;
    if (!suppliers?.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-subtle)">Nenhum fornecedor registado.</td></tr>`;
      return;
    }
    const isAdmin = AppState.user?.role === 'admin';
    tbody.innerHTML = suppliers.map(s => {
      const phones = Array.isArray(s.phones) ? s.phones.map(p => p.phone ?? p).join(', ') : '—';
      return `
        <tr>
          <td><code>${s.id}</code></td>
          <td><strong>${s.name}</strong></td>
          <td>${s.taxId ?? '—'}</td>
          <td>${phones || '—'}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="App.addSupplierPhonePrompt('${s.id}')">+ Telefone</button>
            ${isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="App.deleteSupplier('${s.id}')">Excluir</button>` : ''}
          </td>
        </tr>`;
    }).join('');
  }
};

/* ─────────────── CORE APP ─────────────── */
const App = {
  async init() {
    Sidebar.init();
    this.bindForms();
    this.bindGlobal();
    this.setupGlobalFilter();

    // Pré-carrega alertas críticos para alimentar o badge
    try {
      AppState.stockAlerts = await API.getStockAlerts();
      StockView.render(AppState.stockAlerts);
    } catch (e) {
      console.warn('Alertas indisponíveis:', e.message);
    }

    await Sidebar.navigate('dashboard');
  },

  bindGlobal() {
    document.getElementById('btn-refresh-dash')?.addEventListener('click', () => this.syncContextData('dashboard'));

    // Logout: aceita qualquer elemento com [data-action="logout"] ou #btn-logout (não altera HTML — apenas listener delegado)
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-action="logout"], #btn-logout');
      if (t) {
        e.preventDefault();
        this.logout();
      }
    });
  },

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    Toast.show('success', 'Sessão terminada', 'Até breve.');
    setTimeout(() => window.location.replace('index.html'), 300);
  },

  async syncContextData(screenId) {
    try {
      switch (screenId) {
        case 'dashboard': {
          const [overview, salesReport] = await Promise.allSettled([
            API.getDashboardOverview(),
            API.getDashboardSalesReport()
          ]);
          if (overview.status === 'fulfilled') DashboardView.render(overview.value);
          else Toast.show('danger', 'Dashboard', overview.reason.message);
          if (salesReport.status === 'fulfilled') DashboardView.renderChart(salesReport.value);
          break;
        }
        case 'books':
          AppState.books = await API.getBooks();
          BooksView.render(AppState.books);
          break;
        case 'categories':
          AppState.categories = await API.getCategories();
          CategoriesView.render(AppState.categories);
          break;
        case 'stock':
          AppState.stockAlerts = await API.getStockAlerts();
          StockView.render(AppState.stockAlerts);
          break;
        case 'sales':
          AppState.sales = await API.getSales();
          SalesView.render(AppState.sales);
          break;
        case 'users':
          AppState.users = await API.getUsers();
          UsersView.render(AppState.users);
          break;
        case 'suppliers':
          AppState.suppliers = await API.getSuppliers();
          SuppliersView.render(AppState.suppliers);
          break;
      }
    } catch (err) {
      console.error('Sync error:', err);
      Toast.show('danger', 'Erro de Sincronização', err.message);
    }
  },

  bindForms() {
    // BOOK
    document.getElementById('form-book')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const priceVal = parseFloat(document.getElementById('book-price').value);
      const payload = {
        name: document.getElementById('book-title').value.trim(),
        releaseDate: new Date().toISOString().split('T')[0],
        publisherId: 1,
        description: 'Registo via painel administrativo',
        coverImageUrl: 'placeholder.jpg',
        edition: '1',
        authorId: 1,
        isbn: document.getElementById('book-isbn').value.trim(),
        currentPrice: Number.isFinite(priceVal) ? priceVal : 0
      };
      try {
        await API.createBook(payload);
        Toast.show('success', 'Catálogo', 'Livro registado.');
        Modal.close('modal-book');
        e.target.reset();
        await this.syncContextData('books');
      } catch (err) { Toast.show('danger', 'Erro', err.message); }
    });

    // CATEGORY
    document.getElementById('form-category')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await API.createCategory({ name: document.getElementById('cat-name').value.trim() });
        Toast.show('success', 'Categoria', 'Inserida com sucesso.');
        e.target.reset();
        await this.syncContextData('categories');
      } catch (err) { Toast.show('danger', 'Erro', err.message); }
    });

    // REPLENISH
    document.getElementById('form-replenish')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        bookId: parseInt(document.getElementById('replenish-book-id').value, 10),
        supplierId: 1,
        quantity: parseInt(document.getElementById('replenish-qty').value, 10),
        purchasePrice: 0
      };
      try {
        await API.replenishStock(payload);
        Toast.show('success', 'Estoque', 'Entrada registada.');
        Modal.close('modal-replenish');
        await this.syncContextData('stock');
      } catch (err) { Toast.show('danger', 'Erro', err.message); }
    });

    // USER
    document.getElementById('form-user')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const parts = document.getElementById('user-name').value.trim().split(' ');
      const payload = {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ') || '—',
        email: document.getElementById('user-email').value.trim(),
        password: 'TempPassword123',
        role: document.getElementById('user-role').value
      };
      try {
        await API.createUser(payload);
        Toast.show('success', 'Utilizadores', 'Cadastro criado.');
        Modal.close('modal-user');
        e.target.reset();
        await this.syncContextData('users');
      } catch (err) { Toast.show('danger', 'Erro', err.message); }
    });

    // SUPPLIER (opcional — se o HTML expuser o formulário)
    document.getElementById('form-supplier')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('supplier-name')?.value.trim(),
        taxId: document.getElementById('supplier-taxid')?.value.trim()
      };
      try {
        await API.createSupplier(payload);
        Toast.show('success', 'Fornecedor', 'Registado.');
        Modal.close('modal-supplier');
        e.target.reset();
        await this.syncContextData('suppliers');
      } catch (err) { Toast.show('danger', 'Erro', err.message); }
    });
  },

  openReplenish(bookId) {
    document.getElementById('replenish-book-id').value = bookId;
    Modal.open('modal-replenish');
  },

  async archiveBook(id) {
    if (!confirm('Arquivar este livro? Esta ação é um soft delete.')) return;
    try {
      await API.deleteBook(id);
      Toast.show('success', 'Catálogo', 'Livro arquivado.');
      await this.syncContextData('books');
    } catch (err) { Toast.show('danger', 'Erro', err.message); }
  },

  async banUser(id) {
    if (!confirm('Desativar este utilizador?')) return;
    try {
      await API.banUser(id);
      Toast.show('success', 'Utilizadores', 'Utilizador desativado.');
      await this.syncContextData('users');
    } catch (err) { Toast.show('danger', 'Erro', err.message); }
  },

  async changeSaleStatus(id, status) {
    try {
      await API.patchSaleStatus(id, status);
      Toast.show('success', 'Vendas', `Estado actualizado para ${status}.`);
      await this.syncContextData('sales');
    } catch (err) { Toast.show('danger', 'Erro', err.message); }
  },

  async deleteSupplier(id) {
    if (AppState.user?.role !== 'admin') {
      Toast.show('danger', 'Permissão', 'Apenas administradores podem excluir fornecedores.');
      return;
    }
    if (!confirm('Excluir fornecedor permanentemente?')) return;
    try {
      await API.deleteSupplier(id);
      Toast.show('success', 'Fornecedor', 'Excluído.');
      await this.syncContextData('suppliers');
    } catch (err) { Toast.show('danger', 'Erro', err.message); }
  },

  async addSupplierPhonePrompt(id) {
    const phone = prompt('Número de telefone a vincular:');
    if (!phone) return;
    try {
      await API.addSupplierPhone(id, phone.trim());
      Toast.show('success', 'Fornecedor', 'Telefone vinculado.');
      await this.syncContextData('suppliers');
    } catch (err) { Toast.show('danger', 'Erro', err.message); }
  },

  setupGlobalFilter() {
    const input = document.getElementById('globalSearch');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      const scope = document.querySelector(`#screen-${AppState.currentScreen} .data-table tbody`);
      if (!scope) return;
      scope.querySelectorAll('tr').forEach(tr => {
        tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
};

// Exposição global para handlers inline (onclick="App.xxx" / Modal.xxx)
window.App = App;
window.Modal = Modal;
window.Toast = Toast;

window.addEventListener('DOMContentLoaded', () => App.init());
