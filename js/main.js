/* ==========================================================================
   Neer Safai — Shared application logic
   - API layer for the Python Flask backend + graceful localStorage fallback
   - Complaint store, auth session, validation, UI effects
   ========================================================================== */

(function () {
  "use strict";

  const SESSION_KEY = "ns_session";
  const COMPLAINTS_KEY = "ns_complaints";
  const FEEDBACK_KEY = "ns_feedback";
  const API_KEY = "ns_api_base";

  const API_BASE =
    localStorage.getItem(API_KEY) ||
    new URLSearchParams(location.search).get("api") ||
    "http://127.0.0.1:5000";

  /* ------------------------------------------------------------------ */
  /* Small utilities                                                     */
  /* ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (str) =>
    String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return esc(value);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return esc(value);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      toast("Storage is full. Try removing old complaints.", "error");
      return false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */
  function toast(message, type = "info", timeout = 4200) {
    let stack = document.getElementById("toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toast-stack";
      document.body.appendChild(stack);
    }
    const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info" };
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} mt-0.5 text-[#00f0ff]"></i><div>${esc(message)}</div>`;
    if (type === "success") el.querySelector("i").classList.replace("text-[#00f0ff]", "text-emerald-400");
    if (type === "error") el.querySelector("i").classList.replace("text-[#00f0ff]", "text-red-400");
    stack.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px)";
      el.style.transition = "all .3s ease";
      setTimeout(() => el.remove(), 320);
    }, timeout);
  }

  /* ------------------------------------------------------------------ */
  /* API layer (Flask backend, with automatic fallback)                  */
  /* ------------------------------------------------------------------ */
  const backend = { online: false, checked: false, info: null };

  async function apiFetch(path, options = {}, timeout = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(API_BASE + path, {
        ...options,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.name === "AbortError" ? "Backend timeout" : err.message };
    } finally {
      clearTimeout(timer);
    }
  }

  async function initBackend() {
    if (backend.checked) return backend.online;
    const res = await apiFetch("/api/health", { method: "GET" }, 1800);
    backend.checked = true;
    backend.online = res.ok;
    backend.info = res.ok ? res.data : null;
    document.dispatchEvent(new CustomEvent("ns:backend", { detail: backend }));
    return backend.online;
  }

  /* ------------------------------------------------------------------ */
  /* Complaints store                                                    */
  /* ------------------------------------------------------------------ */
  function seedComplaints() {
    if (localStorage.getItem(COMPLAINTS_KEY) !== null) return;
    const year = new Date().getFullYear();
    const base = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const seeds = [
      { name: "Aarav Sharma", phone: "9876543210", state: "Uttar Pradesh", district: "Varanasi", issueType: "Contaminated / Dirty Water", description: "Brownish water is coming from the main pipeline near Lanka crossing since three days.", status: "Resolved", offset: 26 },
      { name: "Priya Nair", phone: "9822334455", state: "Kerala", district: "Ernakulam", issueType: "Pipeline Leakage", description: "Major leakage near the community tap causing water wastage and low pressure.", status: "Under Review", offset: 19 },
      { name: "Rohit Yadav", phone: "9911223344", state: "Bihar", district: "Patna", issueType: "No Water Supply", description: "No water supply in Rajendra Nagar block for the last four days.", status: "Pending", offset: 12 },
      { name: "Sneha Kulkarni", phone: "9765432109", state: "Maharashtra", district: "Pune", issueType: "High TDS / Hard Water", description: "Water is extremely hard and leaves white deposits on utensils.", status: "Under Review", offset: 8 },
      { name: "Imran Khan", phone: "9700112233", state: "Telangana", district: "Hyderabad", issueType: "Sewage Mixing in Water", description: "Sewage appears to be mixing into the drinking water line in Old City area.", status: "Pending", offset: 5 },
      { name: "Kavya Reddy", phone: "9611223399", state: "Karnataka", district: "Bengaluru", issueType: "Broken Public Tap / Handpump", description: "Public handpump near the school is broken and children have no drinking water.", status: "Resolved", offset: 3 },
      { name: "Manish Gupta", phone: "9555667788", state: "Rajasthan", district: "Jaipur", issueType: "Low Water Pressure", description: "Water pressure is very low in the morning hours for the entire colony.", status: "Pending", offset: 2 },
      { name: "Fatima Sheikh", phone: "9444556677", state: "Gujarat", district: "Ahmedabad", issueType: "Contaminated / Dirty Water", description: "Water has a foul smell and visible particles after supply resumes.", status: "Rejected", offset: 1 }
    ];
    const list = seeds.map((s, i) => {
      const created = new Date(base + s.offset * 24 * 60 * 60 * 1000).toISOString();
      return {
        complaintId: `NS-${year}-${1001 + i}`,
        name: s.name,
        phone: s.phone,
        state: s.state,
        district: s.district,
        issueType: s.issueType,
        description: s.description,
        status: s.status,
        photoName: "",
        createdAt: created,
        updatedAt: created,
        remarks: s.status === "Resolved" ? "Field team inspected and restored supply." : ""
      };
    });
    writeJSON(COMPLAINTS_KEY, list);
  }

  function localComplaints() {
    seedComplaints();
    return readJSON(COMPLAINTS_KEY, []);
  }

  function saveLocalComplaints(list) {
    writeJSON(COMPLAINTS_KEY, list);
  }

  function newComplaintId() {
    const year = new Date().getFullYear();
    const existing = new Set(localComplaints().map((c) => c.complaintId));
    let id;
    do {
      id = `NS-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    } while (existing.has(id));
    return id;
  }

  async function createComplaint(payload) {
    const year = new Date().getFullYear();
    const localRecord = {
      complaintId: payload.complaintId || newComplaintId(),
      name: payload.name,
      phone: payload.phone,
      state: payload.state,
      district: payload.district,
      issueType: payload.issueType,
      description: payload.description,
      photoName: payload.photoName || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remarks: ""
    };

    if (backend.online) {
      const res = await apiFetch("/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          name: localRecord.name,
          phone: localRecord.phone,
          state: localRecord.state,
          district: localRecord.district,
          issueType: localRecord.issueType,
          description: localRecord.description
        })
      });
      if (res.ok && res.data && res.data.complaint) {
        const record = normaliseComplaint(res.data.complaint);
        const list = localComplaints().filter((c) => c.complaintId !== record.complaintId);
        list.unshift(record);
        saveLocalComplaints(list);
        return { record, source: "backend" };
      }
    }

    const list = localComplaints().filter((c) => c.complaintId !== localRecord.complaintId);
    list.unshift(localRecord);
    saveLocalComplaints(list);
    return { record: localRecord, source: "local" };
  }

  function normaliseComplaint(raw) {
    if (!raw) return null;
    return {
      complaintId: raw.complaintId || raw.complaint_id || raw.id,
      name: raw.name || "",
      phone: raw.phone || "",
      state: raw.state || "",
      district: raw.district || "",
      issueType: raw.issueType || raw.issue_type || "",
      description: raw.description || "",
      photoName: raw.photoName || "",
      status: raw.status || "Pending",
      createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
      updatedAt: raw.updatedAt || raw.updated_at || raw.createdAt || raw.created_at || new Date().toISOString(),
      remarks: raw.remarks || ""
    };
  }

  async function getComplaints() {
    if (backend.online) {
      const res = await apiFetch("/api/complaints", { method: "GET" });
      if (res.ok && Array.isArray(res.data.complaints)) {
        const list = res.data.complaints.map(normaliseComplaint);
        const local = localComplaints();
        const map = new Map();
        [...local, ...list].forEach((c) => map.set(c.complaintId, c));
        saveLocalComplaints(Array.from(map.values()));
        return { list, source: "backend" };
      }
    }
    return { list: localComplaints(), source: "local" };
  }

  async function getComplaint(id) {
    const clean = String(id || "").trim().toUpperCase();
    if (!clean) return null;
    if (backend.online) {
      const res = await apiFetch(`/api/complaints/${encodeURIComponent(clean)}`, { method: "GET" });
      if (res.ok && res.data && res.data.complaint) {
        return normaliseComplaint(res.data.complaint);
      }
    }
    const found = localComplaints().find((c) => c.complaintId.toUpperCase() === clean);
    return found || null;
  }

  async function updateComplaintStatus(id, status, remarks) {
    const clean = String(id || "").trim().toUpperCase();
    if (backend.online) {
      const res = await apiFetch(`/api/complaints/${encodeURIComponent(clean)}`, {
        method: "PUT",
        body: JSON.stringify({ status, remarks: remarks || "" })
      });
      if (res.ok && res.data && res.data.complaint) {
        const record = normaliseComplaint(res.data.complaint);
        const list = localComplaints().map((c) => (c.complaintId === clean ? record : c));
        saveLocalComplaints(list);
        return { record, source: "backend" };
      }
    }
    const list = localComplaints();
    const idx = list.findIndex((c) => c.complaintId.toUpperCase() === clean);
    if (idx === -1) return { record: null, source: "local" };
    list[idx].status = status;
    list[idx].updatedAt = new Date().toISOString();
    if (remarks != null) list[idx].remarks = remarks;
    saveLocalComplaints(list);
    return { record: list[idx], source: "local" };
  }

  /* ------------------------------------------------------------------ */
  /* Auth session                                                        */
  /* ------------------------------------------------------------------ */
  function getSession() {
    return readJSON(SESSION_KEY, null);
  }

  function setSession(session) {
    writeJSON(SESSION_KEY, session);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function requireAuth() {
    const s = getSession();
    if (!s) {
      const next = encodeURIComponent(location.pathname.split("/").pop() || "dashboard.html");
      location.replace(`login.html?next=${next}`);
      return false;
    }
    return true;
  }

  async function loginOfficial(email, password) {
    if (backend.online) {
      const res = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (res.ok && res.data && res.data.officer) {
        const officer = res.data.officer;
        setSession({
          email: officer.email,
          name: officer.name,
          role: officer.role || "Official",
          token: res.data.token || "",
          loggedInAt: new Date().toISOString()
        });
        return { ok: true, source: "backend", officer };
      }
      if (res.error && /invalid|password|credential/i.test(res.error)) {
        return { ok: false, error: res.error };
      }
    }
    const emailOk = String(email).trim().toLowerCase() === "admin@gov.in";
    const passOk = String(password) === "admin123";
    if (emailOk && passOk) {
      setSession({
        email: "admin@gov.in",
        name: "Administrator",
        role: "Senior Water Officer",
        token: "demo-session",
        loggedInAt: new Date().toISOString()
      });
      return { ok: true, source: "local" };
    }
    return { ok: false, error: "Invalid email or password. Use admin@gov.in / admin123." };
  }

  /* ------------------------------------------------------------------ */
  /* Quality checker                                                     */
  /* ------------------------------------------------------------------ */
  async function checkQuality(pincode) {
    if (backend.online) {
      const res = await apiFetch(`/api/quality/${encodeURIComponent(pincode)}`, { method: "GET" });
      if (res.ok && res.data && res.data.quality) {
        return { ...res.data.quality, source: "backend" };
      }
    }
    return { ...nsQualityForPincode(pincode), source: "local" };
  }

  /* ------------------------------------------------------------------ */
  /* Feedback                                                            */
  /* ------------------------------------------------------------------ */
  function saveFeedback(payload) {
    const list = readJSON(FEEDBACK_KEY, []);
    list.unshift({ ...payload, createdAt: new Date().toISOString() });
    writeJSON(FEEDBACK_KEY, list.slice(0, 200));
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* Validation helpers                                                  */
  /* ------------------------------------------------------------------ */
  const validate = {
    phone(v) { return /^[6-9]\d{9}$/.test(String(v).trim()); },
    pincode(v) { return /^[1-9]\d{5}$/.test(String(v).trim()); },
    email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()); },
    required(v) { return String(v == null ? "" : v).trim().length > 0; },
    minLen(v, n) { return String(v || "").trim().length >= n; }
  };

  function markField(input, valid, message) {
    if (!input) return valid;
    input.classList.toggle("is-invalid", !valid);
    input.classList.toggle("is-valid", valid && String(input.value || "").trim() !== "");
    const errId = input.getAttribute("data-error");
    const errEl = errId ? document.getElementById(errId) : null;
    if (errEl) {
      errEl.textContent = valid ? "" : message || "Please check this field.";
      errEl.style.color = valid ? "" : "#fca5a5";
    }
    return valid;
  }

  function statusBadge(status) {
    const s = String(status || "Pending");
    const cls =
      s === "Resolved" ? "badge-resolved" :
      s === "Rejected" ? "badge-rejected" :
      s === "Under Review" ? "badge-review" : "badge-pending";
    return `<span class="badge ${cls}">${esc(s)}</span>`;
  }

  /* ------------------------------------------------------------------ */
  /* UI effects                                                          */
  /* ------------------------------------------------------------------ */
  function initParticles() {
    if (document.getElementById("particles")) return;
    const wrap = document.createElement("div");
    wrap.id = "particles";
    wrap.setAttribute("aria-hidden", "true");
    const count = window.innerWidth < 640 ? 16 : 30;
    let html = "";
    for (let i = 0; i < count; i++) {
      const size = 2 + Math.random() * 5;
      const left = Math.random() * 100;
      const dur = 12 + Math.random() * 18;
      const delay = Math.random() * 18;
      const opacity = 0.25 + Math.random() * 0.5;
      html += `<span class="particle" style="left:${left.toFixed(2)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s;opacity:${opacity.toFixed(2)}"></span>`;
    }
    wrap.innerHTML = html;
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    if (!header) return;
    const fn = () => header.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute("data-target") || "0");
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = prefix + value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const els = $$("[data-counter]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(animateCounter);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  function initTilt() {
    if (typeof VanillaTilt === "undefined") return;
    $$("[data-tilt]").forEach((el) => {
      if (el.dataset.tiltInit) return;
      el.dataset.tiltInit = "1";
      VanillaTilt.init(el, {
        max: 8,
        speed: 700,
        glare: true,
        "max-glare": 0.18,
        scale: 1.02
      });
    });
  }

  function initAccordions() {
    $$(".acc-item").forEach((item) => {
      const btn = $(".acc-btn", item);
      const panel = $(".acc-panel", item);
      if (!btn || !panel) return;
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        const group = item.closest("[data-accordion]");
        if (group) {
          $$(".acc-item.open", group).forEach((other) => {
            if (other !== item) {
              other.classList.remove("open");
              const op = $(".acc-panel", other);
              if (op) op.style.maxHeight = "0px";
            }
          });
        }
        item.classList.toggle("open", !isOpen);
        panel.style.maxHeight = isOpen ? "0px" : panel.scrollHeight + "px";
      });
    });
  }

  function initProgressBars() {
    const bars = $$(".bar-fill[data-width]");
    if (!bars.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute("data-width") + "%";
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach((b) => io.observe(b));
  }

  function showRipple() {
    let overlay = document.getElementById("ripple-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "ripple-overlay";
      overlay.innerHTML = `
        <div class="text-center">
          <div class="mx-auto ripple"></div>
          <p data-ripple-text class="mt-16 text-sm font-medium tracking-wide text-[#00f0ff]">Analysing water sample…</p>
        </div>`;
      document.body.appendChild(overlay);
    }
    const label = $("[data-ripple-text]", overlay);
    if (label) label.textContent = "Analysing water sample…";
    overlay.classList.add("active");
  }

  function hideRipple() {
    const overlay = document.getElementById("ripple-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  function initAOS() {
    if (typeof AOS !== "undefined") {
      AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60 });
    }
  }

  function initYear() {
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  function initAll() {
    initParticles();
    initHeaderScroll();
    initCounters();
    initTilt();
    initAccordions();
    initProgressBars();
    initAOS();
    initYear();
    initBackend();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  /* Public API */
  window.NS = {
    API_BASE,
    backend,
    initBackend,
    toast,
    esc,
    formatDate,
    formatDateTime,
    validate,
    markField,
    statusBadge,
    escapeHtml: esc,
    complaints: {
      create: createComplaint,
      all: getComplaints,
      get: getComplaint,
      updateStatus: updateComplaintStatus,
      local: localComplaints,
      newId: newComplaintId
    },
    auth: { getSession, setSession, logout, requireAuth, login: loginOfficial },
    quality: checkQuality,
    feedback: saveFeedback,
    ui: {
      showRipple,
      hideRipple,
      initAccordions,
      initCounters,
      initTilt,
      toast
    }
  };
})();
