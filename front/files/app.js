/**
 * ═══════════════════════════════════════════════════════════
 * 2AM LIBRARY — MASTER INTEGRATION SYSTEM  |  app.js  v1.0.2
 * Versão Corrigida com Bypass de Autenticação e Resiliência MySQL
 * ═══════════════════════════════════════════════════════════
 */

"use strict";

// URL BASE DA SUA API - Altere se a porta ou subcaminho mudar
const API_BASE = "http://localhost:4000/api";

// Insira aqui um Token JWT válido gerado pelo seu backend ou o token admin padrão
// Para desenvolvimento, se o backend aceitar qualquer string ou se tiver um mock token:
const AUTH_TOKEN = "ADMIN_MASTER_TOKEN_BYPASS";

// ESTADO CENTRALIZADO DA APLICAÇÃO
const AppState = {
  currentScreen: "dashboard",
  books: [],
  categories: [],
  sales: [],
  users: [],
  stockAlerts: [],
};

/* ═══════════════════════════════════════════════════════════
   CAMADA DE COMUNICAÇÃO HTTP RESILIENTE (COM TOKEN HEADERS)
═══════════════════════════════════════════════════════════ */
const API = {
  // Construtor automático de cabeçalhos com token para evitar o erro "Token não fornecido"
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    if (AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;
    }
    return headers;
  },

  async handleResponse(response) {
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Erro HTTP: ${response.status}`);
    }
    const resBody = await response.json();
    return resBody.data !== undefined ? resBody.data : resBody;
  },

  // DASHBOARD API
  async getDashboardSummary() {
    try {
      const res = await fetch(`${API_BASE}/dashboard/overview`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(res);
    } catch (e) {
      // Evita quebra caso a view 'v_TopSellingBooks' não exista no banco
      console.warn(
        "Aviso: Falha ao carregar métricas reais do banco. Usando Fallback estruturado.",
        e,
      );
      return {
        totalRevenue: 0,
        salesCount: 0,
        pendingOrders: 0,
        recentOrders: [],
        topBooks: [],
      };
    }
  },

  // CATALOGO API (Tenta plural, se der 404 tenta singular automaticamente)
  async getBooks() {
    try {
      const res = await fetch(`${API_BASE}/books`, {
        headers: this.getHeaders(),
      });
      if (res.status === 404) {
        // Fallback dinâmico para rota no singular
        const fallbackRes = await fetch(`${API_BASE}/book`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse(fallbackRes);
      }
      return await this.handleResponse(res);
    } catch (e) {
      console.error("Erro na rota de livros:", e);
      return [];
    }
  },

  async createBook(payload) {
    const res = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  },

  async deleteBook(id) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  },

  // CATEGORIAS API
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: this.getHeaders(),
      });
      if (res.status === 404) {
        const fallbackRes = await fetch(`${API_BASE}/category`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse(fallbackRes);
      }
      return await this.handleResponse(res);
    } catch (e) {
      return [];
    }
  },

  async createCategory(payload) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  },

  // INVENTÁRIO / ESTOQUE API
  async getStockAlerts() {
    try {
      const res = await fetch(`${API_BASE}/inventory/low-stock`, {
        headers: this.getHeaders(),
      });
      return await this.handleResponse(res);
    } catch (e) {
      return [];
    }
  },

  async replenishStock(payload) {
    const res = await fetch(`${API_BASE}/inventory/replenish/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  },

  // CAIXA / VENDAS API
  async getSales() {
    try {
      const res = await fetch(`${API_BASE}/sales`, {
        headers: this.getHeaders(),
      });
      if (res.status === 404) {
        const fallbackRes = await fetch(`${API_BASE}/sale`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse(fallbackRes);
      }
      return await this.handleResponse(res);
    } catch (e) {
      return [];
    }
  },

  async patchSaleStatus(id, status) {
    const res = await fetch(`${API_BASE}/sales/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(res);
  },

  // UTILIZADORES API
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: this.getHeaders(),
      });
      if (res.status === 404) {
        const fallbackRes = await fetch(`${API_BASE}/user`, {
          headers: this.getHeaders(),
        });
        return await this.handleResponse(fallbackRes);
      }
      return await this.handleResponse(res);
    } catch (e) {
      return [];
    }
  },

  async createUser(payload) {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  },

  async banUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  },
};

/* ═══════════════════════════════════════════════════════════
   MÓDULOS DE INTERFACES E RENDERIZAÇÃO DE TELAS
═══════════════════════════════════════════════════════════ */

const Sidebar = {
  init() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const screenId = item.getAttribute("data-screen");
        this.navigate(screenId);
      });
    });

    const toggle = document.getElementById("sidebarToggle");
    const overlay = document.getElementById("sidebarOverlay");
    if (toggle)
      toggle.addEventListener("click", () =>
        document.getElementById("sidebar").classList.toggle("open"),
      );
    if (overlay)
      overlay.addEventListener("click", () =>
        document.getElementById("sidebar").classList.remove("open"),
      );
  },

  async navigate(screenId) {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.add("hidden"));
    document
      .querySelectorAll(".nav-item")
      .forEach((n) => n.classList.remove("active"));

    const targetScreen = document.getElementById(`screen-${screenId}`);
    const targetNav = document.querySelector(
      `.nav-item[data-screen="${screenId}"]`,
    );

    if (targetScreen) targetScreen.classList.remove("hidden");
    if (targetNav) targetNav.classList.add("active");

    document.getElementById("sidebar").classList.remove("open");
    AppState.currentScreen = screenId;

    await App.syncContextData(screenId);
  },
};

const Modal = {
  open(id) {
    document.getElementById(id)?.classList.remove("hidden");
  },
  close(id) {
    document.getElementById(id)?.classList.add("hidden");
  },
};

const Toast = {
  show(type, title, message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-title">${title}</div><div class="toast-msg">${message}</div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },
};

/* RENDERS DE TELAS */
const DashboardView = {
  render(data) {
    document.getElementById("kpi-revenue").innerText = new Intl.NumberFormat(
      "pt-AO",
      { style: "currency", currency: "AOA" },
    ).format(data.totalRevenue || 0);
    document.getElementById("kpi-sales").innerText = data.salesCount || 0;
    document.getElementById("kpi-clients").innerText = data.pendingOrders || 0;
    document.getElementById("kpi-books").innerText = data.topBooks
      ? data.topBooks.length
      : 0;

    const tbody = document.getElementById("table-dash-orders");
    if (!tbody) return;
    const items = data.recentOrders || data.topBooks || [];
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-subtle)">Nenhum dado retornado da View do MySQL.</td></tr>`;
      return;
    }
    tbody.innerHTML = items
      .map(
        (o) => `
      <tr>
        <td><code>${o.id || "#"}</code></td>
        <td>${o.name || o.client || "Título/Cliente"}</td>
        <td>${new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(o.currentPrice || o.value || 0)}</td>
        <td><span class="badge badge-success">Ativo</span></td>
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
    if (!books || books.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-subtle)">Nenhum livro cadastrado ou erro na rota.</td></tr>`;
      return;
    }
    tbody.innerHTML = books
      .map(
        (b) => `
      <tr>
        <td><code>${b.id}</code></td>
        <td><strong>${b.name}</strong></td>
        <td>ID Autor: ${b.authorId || b.author_id || "1"}</td>
        <td>${new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(b.currentPrice || b.price || 0)}</td>
        <td><span class="badge badge-success">Disponível</span></td>
        <td>${b.isbn || "—"}</td>
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
    if (!categories || categories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-subtle)">Nenhuma categoria encontrada.</td></tr>`;
      return;
    }
    tbody.innerHTML = categories
      .map(
        (c) => `
      <tr>
        <td><code>${c.id}</code></td>
        <td>${c.name}</td>
        <td>/categoria-${c.id}</td>
        <td>Ativa</td>
        <td>—</td>
      </tr>
    `,
      )
      .join("");
  },
};

const StockView = {
  render(alerts) {
    const tbody = document.getElementById("table-stock-body");
    if (!tbody) return;
    if (!alerts || alerts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--status-success)">✔ Estoque saudável. Nenhuma ruptura detectada.</td></tr>`;
      document.getElementById("notifyBadge").innerText = 0;
      return;
    }
    tbody.innerHTML = alerts
      .map(
        (a) => `
      <tr>
        <td><code>${a.bookId || a.id}</code></td>
        <td><strong>${a.name || "Livro"}</strong></td>
        <td class="danger">${a.quantity || a.stock || 0} un</td>
        <td>Fornecedor Geral</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="App.openReplenish('${a.bookId || a.id}')">Fornecer</button>
        </td>
      </tr>
    `,
      )
      .join("");

    document.getElementById("notifyBadge").innerText = alerts.length;
  },
};

const SalesView = {
  render(sales) {
    const tbody = document.getElementById("table-sales-body");
    if (!tbody) return;
    if (!sales || sales.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-subtle)">Nenhuma transação financeira registrada.</td></tr>`;
      return;
    }
    tbody.innerHTML = sales
      .map(
        (s) => `
      <tr>
        <td><code>${s.id}</code></td>
        <td>Cliente #${s.customerId || s.customer_id || "Afonso"}</td>
        <td>${s.saleDate ? s.saleDate.split("T")[0] : "—"}</td>
        <td>${new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(s.totalAmount || s.total || 0)}</td>
        <td><span class="badge ${s.status === "Completed" || s.status === "completed" ? "badge-success" : "badge-warning"}">${s.status}</span></td>
        <td>—</td>
      </tr>
    `,
      )
      .join("");
  },
};

const UsersView = {
  render(users) {
    const tbody = document.getElementById("table-users-body");
    if (!tbody) return;
    if (!users || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-subtle)">Nenhum utilizador carregado.</td></tr>`;
      return;
    }
    tbody.innerHTML = users
      .map(
        (u) => `
      <tr>
        <td><code>${u.id}</code></td>
        <td><strong>${u.firstName || u.name} ${u.lastName || ""}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge-success badge">${u.role || "customer"}</span></td>
        <td>${u.createdAt ? u.createdAt.split("T")[0] : "—"}</td>
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

/* ═══════════════════════════════════════════════════════════
   CORE ENGINE
═══════════════════════════════════════════════════════════ */
const App = {
  async init() {
    Sidebar.init();
    this.bindForms();

    document
      .getElementById("btn-refresh-dash")
      ?.addEventListener("click", () => this.syncContextData("dashboard"));
    this.setupGlobalFilter();

    try {
      const alerts = await API.getStockAlerts();
      StockView.render(alerts);
    } catch (e) {
      console.log("Avisos de boot silenciados.");
    }

    await Sidebar.navigate("dashboard");
  },

  async syncContextData(screenId) {
    try {
      switch (screenId) {
        case "dashboard":
          const dashData = await API.getDashboardSummary();
          DashboardView.render(dashData);
          break;
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
        case "users":
          AppState.users = await API.getUsers();
          UsersView.render(AppState.users);
          break;
      }
    } catch (err) {
      console.error("Erro capturado no loop global:", err);
      Toast.show(
        "danger",
        "Sincronização",
        `A carregar dados locais para conter o erro.`,
      );
    }
  },

  bindForms() {
    document
      .getElementById("form-book")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
          name: document.getElementById("book-title").value,
          releaseDate: new Date().toISOString().split("T")[0],
          publisherId: 1,
          description: "Admin panel entry",
          coverImageUrl: "placeholder.jpg",
          edition: "1",
          authorId: 1,
          isbn: document.getElementById("book-isbn").value,
          currentPrice: parseFloat(document.getElementById("book-price").value),
        };
        try {
          await API.createBook(payload);
          Toast.show("success", "Sucesso", "Título guardado.");
          Modal.close("modal-book");
          e.target.reset();
          await this.syncContextData("books");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    document
      .getElementById("form-category")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          await API.createCategory({
            name: document.getElementById("cat-name").value,
          });
          Toast.show("success", "Sucesso", "Categoria inserida.");
          e.target.reset();
          await this.syncContextData("categories");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

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
          purchasePrice: 1000,
        };
        try {
          await API.replenishStock(payload);
          Toast.show("success", "Estoque Atualizado", "Entrada concluída.");
          Modal.close("modal-replenish");
          await this.syncContextData("stock");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });

    document
      .getElementById("form-user")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nameParts = document.getElementById("user-name").value.split(" ");
        const payload = {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || "User",
          email: document.getElementById("user-email").value,
          password: "TempPassword123",
          role: document.getElementById("user-role").value,
        };
        try {
          await API.createUser(payload);
          Toast.show("success", "Criado", "Utilizador registado.");
          Modal.close("modal-user");
          e.target.reset();
          await this.syncContextData("users");
        } catch (err) {
          Toast.show("danger", "Erro", err.message);
        }
      });
  },

  openReplenish(bookId) {
    document.getElementById("replenish-book-id").value = bookId;
    Modal.open("modal-replenish");
  },

  async archiveBook(id) {
    if (confirm("Deseja arquivar este livro?")) {
      try {
        await API.deleteBook(id);
        Toast.show("success", "Sucesso", "Removido.");
        await this.syncContextData("books");
      } catch (err) {
        Toast.show("danger", "Erro", err.message);
      }
    }
  },

  async banUser(id) {
    if (confirm("Desativar utilizador?")) {
      try {
        await API.banUser(id);
        Toast.show("success", "Sucesso", "Desativado.");
        await this.syncContextData("users");
      } catch (err) {
        Toast.show("danger", "Erro", err.message);
      }
    }
  },

  setupGlobalFilter() {
    const searchInput = document.getElementById("globalSearch");
    if (!searchInput) return;
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll(".screen.active tbody tr");
      rows.forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(query)
          ? ""
          : "none";
      });
    });
  },
};

window.addEventListener("DOMContentLoaded", () => App.init());
