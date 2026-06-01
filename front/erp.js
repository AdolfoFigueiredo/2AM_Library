/**
 * ═══════════════════════════════════════════════════════════
 * 2AM LIBRARY — PAINEL ADMINISTRATIVO  |  erp.js  v2.1.0
 * Integração 100% real com API (http://localhost:4000/api).
 * Token JWT obrigatório (sessionStorage). Sem mocks.
 * ═══════════════════════════════════════════════════════════
 */
"use strict";

const API_BASE = "http://localhost:4000/api";
const TOKEN_KEY = "2am_jwt_token";
const USER_KEY = "2am_user";

/* ─────────────── GUARDA DE ACESSO ─────────────── */
(function authGuard() {
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    window.location.replace("auth.html");
  }
})();

/* ─────────────── ESTADO GLOBAL ─────────────── */
const AppState = {
  get token() {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  get user() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  currentScreen: "dashboard",
  books: [],
  categories: [],
  sales: [],
  users: [],
  suppliers: [],
  stockAlerts: [],
};

/* ─────────────── CAMADA HTTP ─────────────── */
/* ─────────────── CAMADA HTTP ─────────────── */
const API = {
  getHeaders(extra = {}) {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const h = { "Content-Type": "application/json", ...extra };
    if (token) {
      h["Authorization"] = `Bearer ${token}`;
    }
    return h;
  },

  // Centralizador real de requests que substitui o teu fetch problemático
  async request(url, method = "GET", body = null) {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) {
        sessionStorage.clear();
        window.location.replace("auth.html");
        throw new Error("Sessão expirada. Redirecionando...");
      }

      let data = null;
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `Erro HTTP ${res.status}`,
        );
      }

      // Retorna a propriedade .data se o teu backend encapsular nela, caso contrário o objeto completo
      return data?.data !== undefined ? data.data : data;
    } catch (err) {
      console.error(`[API FAILED] ${method} ${url}:`, err.message);
      throw err;
    }
  },

  // Métodos semânticos originais que o teu erp.js inteiro invoca:
  async get(url) {
    return this.request(url, "GET");
  },
  async post(url, body) {
    return this.request(url, "POST", body);
  },
  async put(url, body) {
    return this.request(url, "PUT", body);
  },
  async delete(url) {
    return this.request(url, "DELETE");
  },
  async patch(url, body) {
    return this.request(url, "PATCH", body);
  },

  /* ── MÉTODOS DE ROTAS DOMÉSTICAS (Originais do teu erp.js) ── */
  getDashboardOverview() {
    return this.get("/dashboard/overview");
  },
  getSalesReport() {
    return this.get("/dashboard/sales-report");
  },

  getBooks() {
    return this.get("/books");
  },
  createBook(b) {
    return this.post("/books", b);
  },
  updateBook(id, b) {
    return this.put(`/books/${id}`, b);
  },
  deleteBook(id) {
    return this.delete(`/books/${id}`);
  },

  getCategories() {
    return this.get("/categories");
  },
  createCategory(c) {
    return this.post("/categories", c);
  },

  getStockAlerts() {
    return this.get("/inventory/low-stock");
  },
  replenishStock(p) {
    return this.post("/inventory/replenish", p);
  },

  getSales() {
    return this.get("/sales");
  },
  updateSaleStatus(id, s) {
    return this.patch(`/sales/${id}/status`, { status: s });
  },

  getUsers() {
    return this.get("/users");
  },
  createUser(u) {
    return this.post("/users", u);
  },
  deleteUser(id) {
    return this.delete(`/users/${id}`);
  },

  getSuppliers() {
    return this.get("/suppliers");
  },
  createSupplier(s) {
    return this.post("/suppliers", s);
  },
  deleteSupplier(id) {
    return this.delete(`/suppliers/${id}`);
  },
  addSupplierPhone(id, p) {
    return this.post(`/${id}/phones`, { phone: p });
  },
};

/* ─────────────── FORMATADORES ─────────────── */
const fmtAOA = (n) =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(
    Number(n) || 0,
  );
const fmtDate = (d) => (d ? String(d).split("T")[0] : "—");

/* ─────────────── TOAST ─────────────── */
const Toast = {
  show(type, title, message) {
    const container = document.getElementById("toastContainer");
    if (!container) {
      console.log(`[${type}] ${title}: ${message}`);
      return;
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-title">${title}</div><div class="toast-msg">${message}</div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },
};

/* ─────────────── MODAL ─────────────── */
const Modal = {
  open(id) {
    document.getElementById(id)?.classList.remove("hidden");
  },
  close(id) {
    document.getElementById(id)?.classList.add("hidden");
  },
};

/* ─────────────── SIDEBAR ─────────────── */
const Sidebar = {
  init() {
    /* Preenche utilizador autenticado */
    const u = AppState.user;
    if (u) {
      const fullName =
        `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
        u.email ||
        "Operador";
      const initials =
        ((u.firstName?.[0] || "") + (u.lastName?.[0] || "")).toUpperCase() ||
        "OP";
      const roleLabel =
        u.role === "admin"
          ? "Administrador"
          : u.role === "employee"
            ? "Funcionário"
            : "Operador";

      const setAll = (selector, value) =>
        document
          .querySelectorAll(selector)
          .forEach((el) => (el.textContent = value));

      setAll("#sidebar-name, #topbar-name", fullName);
      setAll("#sidebar-role", roleLabel);
      setAll("#sidebar-avatar, #topbar-avatar", initials);
    }

    /* Navegação */
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const screen = item.getAttribute("data-screen");
        if (screen) Sidebar.navigate(screen);
      });
    });

    /* Mobile toggle */
    document
      .getElementById("sidebarToggle")
      ?.addEventListener("click", () =>
        document.getElementById("sidebar")?.classList.toggle("open"),
      );
    document
      .getElementById("sidebarOverlay")
      ?.addEventListener("click", () =>
        document.getElementById("sidebar")?.classList.remove("open"),
      );

    /* Clique nas notificações: vai para estoque */
    document
      .getElementById("notifyBtn")
      ?.addEventListener("click", () => Sidebar.navigate("stock"));
  },

  async navigate(screenId) {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.add("hidden"));
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("active"));
    document.getElementById(`screen-${screenId}`)?.classList.remove("hidden");
    document
      .querySelector(`.nav-item[data-screen="${screenId}"]`)
      ?.classList.add("active");
    document.getElementById("sidebar")?.classList.remove("open");
    AppState.currentScreen = screenId;
    await App.syncContextData(screenId);
  },
};

/* ═══════════════════════════════════════════════
   VIEWS — Renderização dinâmica das tabelas
═══════════════════════════════════════════════ */

const DashboardView = {
  render(data) {
    const d = data || {};
    const setText = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.innerText = v;
    };

    setText("kpi-revenue", fmtAOA(d.totalRevenue));
    setText("kpi-sales", d.totalSalesCount ?? 0);
    setText("kpi-clients", d.pendingOrdersCount ?? 0);
    setText(
      "kpi-books",
      Array.isArray(d.topBooks || d.topSellingBooks)
        ? (d.topBooks || d.topSellingBooks).length
        : 0,
    );

    const tbody = document.getElementById("table-dash-orders");
    if (!tbody) return;
    const rows = Array.isArray(d.topBooks)
      ? d.topBooks
      : Array.isArray(d.topSellingBooks)
        ? d.topSellingBooks
        : [];

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-subtle)">Sem registos.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows
      .map(
        (o) => `
      <tr>
        <td><code>${o.id ?? o.bookId ?? "—"}</code></td>
        <td>${o.name ?? o.title ?? "—"}</td>
        <td>${fmtAOA(o.totalRevenue ?? o.currentPrice ?? 0)}</td>
        <td><span class="badge badge-success">${o.unitsSold ?? o.quantity ?? 0} un</span></td>
      </tr>
    `,
      )
      .join("");
  },
};

const BooksView = {
  render(books) {
    const tbody = document.getElementById("table-books-body");
    if (!tbody) return;
    if (!books?.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-subtle)">Nenhum livro no catálogo.</td></tr>`;
      return;
    }
    tbody.innerHTML = books
      .map(
        (b) => `
      <tr>
        <td><code>${b.id}</code></td>
        <td><strong>${b.name ?? b.title ?? "—"}</strong></td>
        <td>${b.authorName ?? (b.author ? `${b.author.firstName ?? ""} ${b.author.lastName ?? ""}`.trim() : `ID ${b.authorId ?? "—"}`)}</td>
        <td>${fmtAOA(b.currentPrice)}</td>
        <td>${b.stockQuantity ?? b.stock ?? 0} un</td>
        <td><code>${b.isbn ?? "—"}</code></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="App.archiveBook('${b.id}')">Arquivar</button>
        </td>
      </tr>
    `,
      )
      .join("");
  },
};

const CategoriesView = {
  render(categories) {
    const tbody = document.getElementById("table-categories-body");
    if (!tbody) return;
    if (!categories?.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-subtle)">Nenhuma categoria registada.</td></tr>`;
      return;
    }
    tbody.innerHTML = categories
      .map(
        (c) => `
      <tr>
        <td><code>${c.id}</code></td>
        <td>${c.name}</td>
        <td>${c.booksCount ?? 0}</td>
        <td>—</td>
      </tr>
    `,
      )
      .join("");
  },
};

const StockView = {
  render(alerts) {
    const badge = document.getElementById("notifyBadge");
    if (badge) badge.innerText = alerts?.length || 0;

    const tbody = document.getElementById("table-stock-body");
    if (!tbody) return;
    if (!alerts?.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--status-success)">✔ Estoque saudável — sem rupturas.</td></tr>`;
      return;
    }
    tbody.innerHTML = alerts
      .map(
        (a) => `
      <tr>
        <td><code>${a.bookId ?? a.id}</code></td>
        <td><strong>${a.name ?? a.title ?? "Livro"}</strong></td>
        <td style="color:var(--status-danger)">${a.stockQuantity ?? a.quantity ?? 0} un</td>
        <td>${a.supplierName ?? "Fornecedor Geral"}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="App.openReplenish('${a.bookId ?? a.id}')">Repor Estoque</button>
        </td>
      </tr>
    `,
      )
      .join("");
  },
};

const SalesView = {
  statusBadge(s) {
    const t = (s || "").toLowerCase();
    if (t === "completed") return "badge-success";
    if (t === "cancelled") return "badge-danger";
    return "badge-warning";
  },

  render(sales) {
    const tbody = document.getElementById("table-sales-body");
    if (!tbody) return;
    if (!sales?.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-subtle)">Sem transações registadas.</td></tr>`;
      return;
    }
    tbody.innerHTML = sales
      .map(
        (s) => `
      <tr>
        <td><code>${s.id}</code></td>
        <td>${s.customerName ?? `Cliente #${s.customerId ?? "—"}`}</td>
        <td>${fmtDate(s.saleDate ?? s.createdAt)}</td>
        <td>${fmtAOA(s.totalAmount)}</td>
        <td><span class="badge ${this.statusBadge(s.status)}">${s.status}</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="App.openSaleStatusModal('${s.id}', '${s.status}')">
            Alterar Estado
          </button>
        </td>
      </tr>
    `,
      )
      .join("");
  },
};

const SuppliersView = {
  render(suppliers) {
    const tbody = document.getElementById("table-suppliers-body");
    if (!tbody) return;
    if (!suppliers?.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-subtle)">Nenhum fornecedor registado.</td></tr>`;
      return;
    }
    const isAdmin = AppState.user?.role === "admin";
    tbody.innerHTML = suppliers
      .map((s) => {
        const phones = Array.isArray(s.phones)
          ? s.phones
              .map((p) => p.phone ?? p)
              .filter(Boolean)
              .join(", ") || "—"
          : "—";
        return `
        <tr>
          <td><code>${s.id}</code></td>
          <td><strong>${s.name}</strong></td>
          <td>${s.taxId ?? "—"}</td>
          <td>${phones}</td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" onclick="App.addSupplierPhonePrompt('${s.id}')">+ Telefone</button>
            ${isAdmin ? `<button class="btn btn-ghost btn-sm" style="color:var(--status-danger)" onclick="App.deleteSupplier('${s.id}')">Excluir</button>` : ""}
          </td>
        </tr>`;
      })
      .join("");
  },
};

const UsersView = {
  roleLabel(r) {
    const map = {
      admin: "Administrador",
      employee: "Funcionário",
      client: "Cliente",
    };
    return map[r] || r || "Operador";
  },
  roleBadge(r) {
    if (r === "admin") return "badge-danger";
    if (r === "employee") return "badge-warning";
    return "badge-success";
  },
  render(users) {
    const tbody = document.getElementById("table-users-body");
    if (!tbody) return;
    if (!users?.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-subtle)">Nenhum utilizador.</td></tr>`;
      return;
    }
    tbody.innerHTML = users
      .map(
        (u) => `
      <tr>
        <td><code>${u.id}</code></td>
        <td><strong>${u.firstName ?? ""} ${u.lastName ?? ""}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge ${this.roleBadge(u.role)}">${this.roleLabel(u.role)}</span></td>
        <td>${fmtDate(u.createdAt)}</td>
        <td><span class="badge badge-success">Ativo</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="App.banUser('${u.id}')">Desativar</button>
        </td>
      </tr>
    `,
      )
      .join("");
  },
};

/* ═══════════════════════════════════════════════
   APP — Motor central do ERP
═══════════════════════════════════════════════ */
const App = {
  async init() {
    Sidebar.init();
    this.bindForms();
    this.bindGlobal();
    this.setupGlobalFilter();

    console.log("Inicializando ERP para o utilizador:", AppState.user);

    // Forçar renderização inicial do perfil na sidebar
    this.renderSidebarProfile();

    // Proteção preventiva: Se for um cliente (customer), o ERP barra ou redireciona
    if (AppState.user?.role === "customer") {
      alert(
        "Contas de clientes não têm acesso ao painel de administração ERP.",
      );
      sessionStorage.clear();
      window.location.replace("auth.html");
      return;
    }

    // Se for admin ou employee, carrega os dados normalmente
    try {
      await this.syncContextData("dashboard");
      this.setupGlobalFilter();
      this.setupNavigation();
    } catch (err) {
      console.error("Erro crítico na inicialização do ERP:", err.message);
      Toast.show(
        "danger",
        "Erro de Conexão",
        "Não foi possível sincronizar os dados com o servidor.",
      );
    }

    /* Pré-carrega alertas para o badge de notificação */
    try {
      AppState.stockAlerts = await API.getStockAlerts();
      StockView.render(AppState.stockAlerts);
    } catch (e) {
      console.warn("Alertas de estoque indisponíveis:", e.message);
    }

    await Sidebar.navigate("dashboard");
  },

  /* ── Sync de dados por tela ── */
  async syncContextData(screenId) {
    try {
      switch (screenId) {
        case "dashboard": {
          const [overview] = await Promise.allSettled([
            API.getDashboardOverview(),
          ]);
          if (overview.status === "fulfilled")
            DashboardView.render(overview.value);
          else Toast.show("danger", "Dashboard", overview.reason.message);
          break;
        }
        case "books":
          AppState.books = await API.getBooks();
          BooksView.render(AppState.books);
          break;
        case "categories":
          AppState.categories = await API.getCategories();
          CategoriesView.render(AppState.categories);
          break;
        case "stock":
          AppState.stockAlerts = await API.getStockAlerts();
          StockView.render(AppState.stockAlerts);
          break;
        case "sales":
          AppState.sales = await API.getSales();
          SalesView.render(AppState.sales);
          break;
        case "suppliers":
          AppState.suppliers = await API.getSuppliers();
          SuppliersView.render(AppState.suppliers);
          break;
        case "users":
          AppState.users = await API.getUsers();
          UsersView.render(AppState.users);
          break;
      }
    } catch (err) {
      console.error("Sync error:", err);
      Toast.show("danger", "Erro de Sincronização", err.message);
    }
  },

  /* ── Bind de todos os formulários ── */
  bindForms() {
    /* Livro */
    document
      .getElementById("form-book")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const priceVal = parseFloat(
          document.getElementById("book-price").value,
        );
        const bookId = document.getElementById("book-id").value;
        const payload = {
          name: document.getElementById("book-title").value.trim(),
          isbn: document.getElementById("book-isbn").value.trim(),
          currentPrice: Number.isFinite(priceVal) ? priceVal : 0,
          releaseDate: new Date().toISOString().split("T")[0],
          publisherId: 1,
          authorId: 1,
          edition: "1",
          description: "Registo via painel administrativo.",
          coverImageUrl: "placeholder.jpg",
        };
        try {
          if (bookId) {
            await API.updateBook(bookId, payload);
            Toast.show("success", "Catálogo", "Livro actualizado.");
          } else {
            await API.createBook(payload);
            Toast.show("success", "Catálogo", "Livro adicionado ao catálogo.");
          }
          Modal.close("modal-book");
          e.target.reset();
          document.getElementById("book-id").value = "";
          document.getElementById("book-modal-title").textContent =
            "Adicionar Título ao Catálogo";
          await this.syncContextData("books");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    /* Categoria */
    document
      .getElementById("form-category")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await API.createCategory({
            name: document.getElementById("cat-name").value.trim(),
          });
          Toast.show("success", "Categoria", "Categoria inserida com sucesso.");
          e.target.reset();
          await this.syncContextData("categories");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    /* Reposição de estoque */
    document
      .getElementById("form-replenish")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          bookId: parseInt(
            document.getElementById("replenish-book-id").value,
            10,
          ),
          supplierId: 1,
          quantity: parseInt(
            document.getElementById("replenish-qty").value,
            10,
          ),
          purchasePrice: 0,
        };
        try {
          await API.replenishStock(payload);
          Toast.show("success", "Estoque", "Entrada registada com sucesso.");
          Modal.close("modal-replenish");
          e.target.reset();
          await this.syncContextData("stock");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    /* Fornecedor */
    document
      .getElementById("form-supplier")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById("supplier-name").value.trim(),
          taxId: document.getElementById("supplier-taxid").value.trim(),
        };
        try {
          await API.createSupplier(payload);
          Toast.show("success", "Fornecedor", "Fornecedor registado.");
          Modal.close("modal-supplier");
          e.target.reset();
          await this.syncContextData("suppliers");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    /* Estado de Venda (modal dedicado) */
    document
      .getElementById("form-sale-status")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("sale-status-id").value;
        const status = document.getElementById("sale-status-value").value;
        try {
          await API.patchSaleStatus(id, status);
          Toast.show(
            "success",
            "Vendas",
            `Estado actualizado para "${status}".`,
          );
          Modal.close("modal-sale-status");
          await this.syncContextData("sales");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    /* Utilizador */
    document
      .getElementById("form-user")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          firstName: document.getElementById("user-firstname").value.trim(),
          lastName: document.getElementById("user-lastname").value.trim(),
          email: document.getElementById("user-email").value.trim(),
          password: document.getElementById("user-password").value,
          role: document.getElementById("user-role").value,
          taxId: "N/A",
          municipality: "N/A",
          neighborhood: "N/A",
          gender: "O",
          birthDate: "2000-01-01",
        };
        try {
          await API.createUser(payload);
          Toast.show("success", "Utilizadores", "Cadastro criado.");
          Modal.close("modal-user");
          e.target.reset();
          await this.syncContextData("users");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });
  },

  /* ── Listeners globais (logout, refresh, fechar modais com ESC) ── */
  bindGlobal() {
    document
      .getElementById("btn-refresh-dash")
      ?.addEventListener("click", () => this.syncContextData("dashboard"));

    /* Logout — qualquer elemento com data-action="logout" ou #btn-logout */
    document.addEventListener("click", (e) => {
      if (e.target.closest('[data-action="logout"], #btn-logout')) {
        e.preventDefault();
        this.logout();
      }
    });

    /* Fechar modal clicando no overlay */
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.add("hidden");
      });
    });

    /* Fechar modal com ESC */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document
          .querySelectorAll(".modal-overlay:not(.hidden)")
          .forEach((m) => m.classList.add("hidden"));
      }
    });
  },

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    Toast.show("success", "Sessão terminada", "Até breve!");
    setTimeout(() => window.location.replace("auth.html"), 300);
  },

  /* ── Acções inline invocadas pelos botões nas tabelas ── */

  openReplenish(bookId) {
    document.getElementById("replenish-book-id").value = bookId;
    document.getElementById("replenish-qty").value = "";
    Modal.open("modal-replenish");
  },

  openSaleStatusModal(saleId, currentStatus) {
    document.getElementById("sale-status-id").value = saleId;
    document.getElementById("sale-status-display-id").value = saleId;
    const sel = document.getElementById("sale-status-value");
    if (sel) sel.value = currentStatus || "Pending";
    Modal.open("modal-sale-status");
  },

  async archiveBook(id) {
    if (
      !confirm(
        "Arquivar este livro? (Soft delete — pode ser restaurado pela API)",
      )
    )
      return;
    try {
      await API.deleteBook(id);
      Toast.show("success", "Catálogo", "Livro arquivado.");
      await this.syncContextData("books");
    } catch (err) {
      Toast.show("danger", "Erro", err.message);
    }
  },

  async banUser(id) {
    if (!confirm("Desativar este utilizador permanentemente?")) return;
    try {
      await API.banUser(id);
      Toast.show("success", "Utilizadores", "Utilizador desactivado.");
      await this.syncContextData("users");
    } catch (err) {
      Toast.show("danger", "Erro", err.message);
    }
  },

  async deleteSupplier(id) {
    if (AppState.user?.role !== "admin") {
      Toast.show(
        "danger",
        "Permissão Negada",
        "Apenas administradores podem excluir fornecedores.",
      );
      return;
    }
    if (
      !confirm(
        "Excluir fornecedor permanentemente? Esta ação não pode ser desfeita.",
      )
    )
      return;
    try {
      await API.deleteSupplier(id);
      Toast.show("success", "Fornecedor", "Fornecedor excluído.");
      await this.syncContextData("suppliers");
    } catch (err) {
      Toast.show("danger", "Erro", err.message);
    }
  },

  async addSupplierPhonePrompt(id) {
    const phone = prompt(
      "Insira o número de telefone a vincular ao fornecedor:",
    );
    if (!phone?.trim()) return;
    try {
      await API.addSupplierPhone(id, phone.trim());
      Toast.show("success", "Fornecedor", "Telefone vinculado com sucesso.");
      await this.syncContextData("suppliers");
    } catch (err) {
      Toast.show("danger", "Erro", err.message);
    }
  },

  /* ── Filtro global de tabelas ── */
  setupGlobalFilter() {
    const input = document.getElementById("globalSearch");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.toLowerCase();
      const scope = document.querySelector(
        `#screen-${AppState.currentScreen} .data-table tbody`,
      );
      if (!scope) return;
      scope.querySelectorAll("tr").forEach((tr) => {
        tr.style.display = tr.innerText.toLowerCase().includes(q) ? "" : "none";
      });
    });
  },
};

/* ─── Exposição global para handlers inline (onclick="App.xxx" / Modal.xxx) ─── */
window.App = App;
window.Modal = Modal;
window.Toast = Toast;

window.addEventListener("DOMContentLoaded", () => App.init());
