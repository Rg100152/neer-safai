/* ==========================================================================
   Neer Safai — Shared layout components
   Injects the modern top bar + navbar and the footer into every page.
   Auth-aware: shows Dashboard/Logout when an official session exists.
   ========================================================================== */

(function () {
  const SESSION_KEY = "ns_session";

  const NAV_LINKS = [
    { label: "Home", href: "index.html" },
    {
      label: "Services",
      children: [
        { label: "Water Quality Check", href: "quality.html", icon: "fa-flask-vial" },
        { label: "Report an Issue", href: "report.html", icon: "fa-triangle-exclamation" },
        { label: "Track Complaint", href: "track.html", icon: "fa-magnifying-glass-location" },
        { label: "Water Saving Tips", href: "water-tips.html", icon: "fa-seedling" },
        { label: "Citizen Feedback", href: "feedback.html", icon: "fa-comment-dots" }
      ]
    },
    { label: "Schemes", href: "schemes.html" },
    { label: "Vacancy", href: "vacancy.html" },
    { label: "About", href: "about.html" },
    { label: "Contact", href: "contact.html" }
  ];

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch (e) { return null; }
  }

  function currentPage() {
    const parts = location.pathname.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function linkClass(href, active) {
    return `nav-link${active ? " active" : ""}`;
  }

  function buildDesktopLinks() {
    const page = currentPage();
    return NAV_LINKS.map((item) => {
      if (item.children) {
        const anyActive = item.children.some((c) => c.href === page);
        return `
          <div class="nav-drop">
            <button type="button" class="${linkClass("#", anyActive)} inline-flex items-center gap-1.5">
              ${item.label} <i class="fa-solid fa-chevron-down text-[10px] opacity-70"></i>
            </button>
            <div class="nav-drop-menu">
              ${item.children.map((c) => `
                <a href="${c.href}"><i class="fa-solid ${c.icon} text-[#00f0ff] w-4"></i>${c.label}</a>
              `).join("")}
            </div>
          </div>`;
      }
      return `<a href="${item.href}" class="${linkClass(item.href, item.href === page)}">${item.label}</a>`;
    }).join("");
  }

  function buildMobileLinks() {
    const page = currentPage();
    let html = "";
    NAV_LINKS.forEach((item) => {
      if (item.children) {
        html += `<div class="px-3 pt-3 pb-1 text-[11px] uppercase tracking-[0.15em] text-slate-500">${item.label}</div>`;
        html += item.children.map((c) => `
          <a href="${c.href}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            <i class="fa-solid ${c.icon} text-[#00f0ff] w-4"></i>${c.label}
          </a>`).join("");
      } else {
        html += `<a href="${item.href}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${item.href === page ? "text-white bg-white/5" : "text-slate-300 hover:bg-white/5 hover:text-white"}">${item.label}</a>`;
      }
    });
    return html;
  }

  function buildAuthButton(session) {
    if (session) {
      return `
        <a href="dashboard.html" class="btn btn-ghost !px-4 !py-2 hidden md:inline-flex">
          <i class="fa-solid fa-gauge-high text-[#00f0ff]"></i> Dashboard
        </a>
        <button type="button" data-ns-logout class="btn btn-aqua !px-4 !py-2 hidden md:inline-flex">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>`;
    }
    return `
      <a href="login.html" class="btn btn-aqua !px-4 !py-2 hidden md:inline-flex">
        <i class="fa-solid fa-shield-halved"></i> Official Login
      </a>`;
  }

  function buildMobileAuth(session) {
    if (session) {
      return `
        <a href="dashboard.html" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
          <i class="fa-solid fa-gauge-high text-[#00f0ff] w-4"></i> Dashboard
        </a>
        <button type="button" data-ns-logout class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10">
          <i class="fa-solid fa-right-from-bracket w-4"></i> Logout
        </button>`;
    }
    return `
      <a href="login.html" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#00f0ff] hover:bg-white/5">
        <i class="fa-solid fa-shield-halved w-4"></i> Official Login
      </a>`;
  }

  function renderHeader() {
    const session = getSession();
    const mount = document.getElementById("navbar-placeholder");
    if (!mount) return;

    mount.innerHTML = `
      <header class="site-header" id="site-header">
        <!-- Modern top bar -->
        <div class="border-b border-white/[0.06] bg-[#070e18]/70 backdrop-blur-md">
          <div class="container-x flex h-9 items-center justify-between gap-3 text-[11px] sm:text-xs">
            <div class="flex items-center gap-2 text-slate-400">
              <span class="inline-flex items-center gap-1.5 text-slate-300">
                <i class="fa-solid fa-landmark-flag text-[#ff9933]"></i>
                <span class="hidden sm:inline">Ministry of Jal Shakti</span>
                <span class="sm:hidden">Jal Shakti</span>
              </span>
              <span class="text-slate-600">•</span>
              <span class="hidden sm:inline">Government of India</span>
              <span class="sm:hidden">GoI</span>
            </div>
            <div class="flex items-center gap-4 text-slate-400">
              <a href="tel:1800119999" class="hover:text-[#00f0ff] transition"><i class="fa-solid fa-phone-volume mr-1 text-[#00f0ff]"></i>1800-11-9999</a>
              <span class="hidden sm:inline-flex items-center gap-1.5"><span class="live-dot"></span> Systems Live</span>
            </div>
          </div>
        </div>

        <!-- Main navbar -->
        <div class="bg-[#08111d]/60 backdrop-blur-xl">
          <div class="container-x flex h-[70px] items-center justify-between gap-4">
            <a href="index.html" class="flex items-center gap-3 group">
              <span class="logo-ring">
                <img src="images/logo.png" alt="Neer Safai logo" class="h-10 w-10 rounded-full object-cover bg-[#0b1320]" />
              </span>
              <span class="leading-tight">
                <span class="block font-display text-lg font-bold text-gradient">Neer Safai</span>
                <span class="block text-[10px] uppercase tracking-[0.22em] text-slate-400">Water Sanitation</span>
              </span>
            </a>

            <nav class="hidden items-center gap-7 lg:flex">
              ${buildDesktopLinks()}
            </nav>

            <div class="flex items-center gap-2">
              ${buildAuthButton(session)}
              <button type="button" id="menu-toggle" class="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200" aria-label="Toggle menu" aria-expanded="false">
                <i class="fa-solid fa-bars"></i>
              </button>
            </div>
          </div>

          <div id="mobile-menu" class="lg:hidden border-t border-white/10 bg-[#08111d]">
            <div class="container-x py-3 space-y-1">
              ${buildMobileLinks()}
              <div class="mt-2 border-t border-white/10 pt-2 space-y-1">
                ${buildMobileAuth(session)}
              </div>
            </div>
          </div>
        </div>
      </header>`;

    const header = document.getElementById("site-header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.innerHTML = `<i class="fa-solid ${open ? "fa-xmark" : "fa-bars"}"></i>`;
      });
    }

    document.querySelectorAll("[data-ns-logout]").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "login.html";
      });
    });
  }

  function renderFooter() {
    const mount = document.getElementById("footer-placeholder");
    if (!mount) return;
    const year = new Date().getFullYear();

    mount.innerHTML = `
      <footer class="site-footer mt-24 border-t border-white/10 bg-[#070e18]/80">
        <div class="container-x py-14">
          <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="index.html" class="flex items-center gap-3">
                <span class="logo-ring">
                  <img src="images/logo.png" alt="Neer Safai logo" class="h-10 w-10 rounded-full object-cover bg-[#0b1320]" />
                </span>
                <span class="font-display text-lg font-bold text-gradient">Neer Safai</span>
              </a>
              <p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                A modern civic-tech platform connecting citizens and government for cleaner, safer, and more accountable water sanitation across India.
              </p>
              <div class="mt-5 flex gap-2">
                <a href="#" aria-label="Twitter" class="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-[#00f0ff] hover:text-[#00f0ff] transition"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="#" aria-label="Facebook" class="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-[#00f0ff] hover:text-[#00f0ff] transition"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="#" aria-label="YouTube" class="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-[#00f0ff] hover:text-[#00f0ff] transition"><i class="fa-brands fa-youtube"></i></a>
                <a href="#" aria-label="Instagram" class="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-[#00f0ff] hover:text-[#00f0ff] transition"><i class="fa-brands fa-instagram"></i></a>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Citizen Services</h4>
              <ul class="mt-4 space-y-2.5">
                <li><a class="footer-link" href="quality.html">Water Quality Check</a></li>
                <li><a class="footer-link" href="report.html">Report an Issue</a></li>
                <li><a class="footer-link" href="track.html">Track Complaint</a></li>
                <li><a class="footer-link" href="water-tips.html">Water Saving Tips</a></li>
                <li><a class="footer-link" href="feedback.html">Give Feedback</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Government</h4>
              <ul class="mt-4 space-y-2.5">
                <li><a class="footer-link" href="about.html">About Ministry</a></li>
                <li><a class="footer-link" href="schemes.html">Schemes & Missions</a></li>
                <li><a class="footer-link" href="vacancy.html">Vacancies</a></li>
                <li><a class="footer-link" href="notices.html">Notices & Orders</a></li>
                <li><a class="footer-link" href="officials.html">Officials Directory</a></li>
                <li><a class="footer-link" href="login.html">Official Login</a></li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Contact</h4>
              <ul class="mt-4 space-y-3 text-sm text-slate-400">
                <li class="flex gap-3"><i class="fa-solid fa-location-dot mt-1 text-[#00f0ff]"></i><span>Ministry of Jal Shakti, Shram Shakti Bhawan, Rafi Marg, New Delhi – 110001</span></li>
                <li class="flex gap-3"><i class="fa-solid fa-phone mt-1 text-[#00f0ff]"></i><a href="tel:1800119999" class="hover:text-white">1800-11-9999 (Toll Free)</a></li>
                <li class="flex gap-3"><i class="fa-solid fa-envelope mt-1 text-[#00f0ff]"></i><a href="mailto:support@neersafai.gov.in" class="hover:text-white">support@neersafai.gov.in</a></li>
              </ul>
            </div>
          </div>

          <div class="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>© ${year} Neer Safai · Ministry of Jal Shakti. Academic demonstration project. Not an official Government of India website.</p>
            <div class="flex flex-wrap gap-x-5 gap-y-2">
              <a href="privacy-policy.html" class="hover:text-[#00f0ff]">Privacy Policy</a>
              <a href="terms.html" class="hover:text-[#00f0ff]">Terms</a>
              <a href="accessibility.html" class="hover:text-[#00f0ff]">Accessibility</a>
              <a href="downloads.html" class="hover:text-[#00f0ff]">Downloads</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  function init() {
    renderHeader();
    renderFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.NeerComponents = { renderHeader, renderFooter, getSession, SESSION_KEY };
})();
