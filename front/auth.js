/**
 * ═══════════════════════════════════════════════════════════
 * 2AM LIBRARY — AUTENTICAÇÃO  |  auth.js  v1.0.0
 * Integração com API REST (http://localhost:4000/api).
 * Sem mocks. Tokens guardados no sessionStorage.
 * ═══════════════════════════════════════════════════════════
 */
"use strict";

const API_BASE = "http://localhost:4000/api";
const TOKEN_KEY = "2am_jwt_token";
const USER_KEY = "2am_user";

/* ─── Tab switcher ─── */
function switchTab(tab) {
  ["login", "register"].forEach((t) => {
    document.getElementById(`tab-${t}`)?.classList.toggle("active", t === tab);
    document
      .getElementById(`panel-${t}`)
      ?.classList.toggle("active", t === tab);
  });
  hideAlert("login-alert");
  hideAlert("register-alert");
  hideAlert("register-success");
}

/* ─── Alert helpers ─── */
function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const msgEl = el.querySelector("span:last-child");
  if (msgEl && msg) msgEl.textContent = msg;
  el.classList.add("show");
}
function hideAlert(id) {
  document.getElementById(id)?.classList.remove("show");
}

/* ─── Toast ─── */
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

/* ─── Loading state ─── */
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  const span = btn.querySelector("span");
  const spinner = btn.querySelector(".spinner");

  if (loading) {
    if (span) span.textContent = "Aguarde...";
    if (!spinner) {
      const s = document.createElement("div");
      s.className = "spinner";
      btn.prepend(s);
    }
  } else {
    if (spinner) spinner.remove();
    if (btnId === "btn-login" && span) span.textContent = "Entrar no Painel";
    if (btnId === "btn-register" && span) span.textContent = "Criar Cadastro";
  }
}

/* ─── Field validation ─── */
function validateField(wrapId, inputEl) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return inputEl.validity.valid;
  const valid = inputEl.checkValidity();
  wrap.classList.toggle("has-error", !valid);
  return valid;
}

function clearErrors(formEl) {
  formEl
    .querySelectorAll(".form-group.has-error")
    .forEach((el) => el.classList.remove("has-error"));
}

/* ─── HTTP POST helper ─── */
async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg =
      body?.message ||
      (Array.isArray(body?.errors)
        ? body.errors.map((e) => e.message).join(" • ")
        : null) ||
      `Erro ${res.status}`;
    throw new Error(msg);
  }

  return body?.data !== undefined ? body.data : body;
}

/* ══════════════════════════════════════
   LOGIN HANDLER
══════════════════════════════════════ */
document.getElementById("form-login")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert("login-alert");
  clearErrors(e.target);

  const emailEl = document.getElementById("login-email");
  const passwordEl = document.getElementById("login-password");

  const emailOk = validateField("fg-login-email", emailEl);
  const passwordOk = validateField("fg-login-password", passwordEl);
  if (!emailOk || !passwordOk) return;

  setLoading("btn-login", true);

  try {
    const data = await apiPost("/auth/login", {
      email: emailEl.value.trim(),
      password: passwordEl.value,
    });

    const token = data?.token;
    const user = data?.user;

    if (!token)
      throw new Error("Resposta inválida do servidor. Token não recebido.");

    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}));

    Toast.show(
      "success",
      "Autenticado",
      `Bem-vindo, ${user?.firstName || "Operador"}!`,
    );
    setTimeout(() => window.location.replace("erp.html"), 500);
  } catch (err) {
    showAlert("login-alert", err.message);
    setLoading("btn-login", false);
  }
});

/* ══════════════════════════════════════
   REGISTER HANDLER
══════════════════════════════════════ */
document
  .getElementById("form-register")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert("register-alert");
    hideAlert("register-success");
    clearErrors(e.target);

    const fields = [
      { id: "reg-firstName", wrapId: "fg-firstName" },
      { id: "reg-lastName", wrapId: "fg-lastName" },
      { id: "reg-email", wrapId: "fg-reg-email" },
      { id: "reg-password", wrapId: "fg-reg-password" },
      { id: "reg-taxId", wrapId: "fg-taxId" },
      { id: "reg-birthDate", wrapId: "fg-birthDate" },
      { id: "reg-municipality", wrapId: "fg-municipality" },
      { id: "reg-neighborhood", wrapId: "fg-neighborhood" },
      { id: "reg-gender", wrapId: "fg-gender" },
    ];

    let allValid = true;
    const values = {};

    fields.forEach(({ id, wrapId }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const ok = validateField(wrapId, el);
      if (!ok) allValid = false;
      values[id] = el.value.trim();
    });

    if (!allValid) return;

    setLoading("btn-register", true);

    const payload = {
      firstName: values["reg-firstName"],
      lastName: values["reg-lastName"],
      email: values["reg-email"],
      password: values["reg-password"],
      taxId: values["reg-taxId"],
      birthDate: values["reg-birthDate"],
      municipality: values["reg-municipality"],
      neighborhood: values["reg-neighborhood"],
      gender: values["reg-gender"],
    };

    try {
      await apiPost("/auth/register", payload);
      showAlert("register-success");
      e.target.reset();
      Toast.show("success", "Conta Criada", "Faça login para continuar.");
      setTimeout(() => switchTab("login"), 1800);
    } catch (err) {
      // Tenta também o endpoint alternativo /api/users
      try {
        await apiPost("/users", payload);
        showAlert("register-success");
        e.target.reset();
        Toast.show("success", "Conta Criada", "Faça login para continuar.");
        setTimeout(() => switchTab("login"), 1800);
      } catch (_) {
        showAlert("register-alert", err.message);
      }
    } finally {
      setLoading("btn-register", false);
    }
  });
