/*
 Copyright (c) 2026 Ashraf Morningstar
 These are personal recreations of existing projects, developed by Ashraf Morningstar
 for learning and skill development.
 Original project concepts remain the intellectual property of their respective creators.
 Repository: https://github.com/AshrafMorningstar
*/

"use strict";

// Main JavaScript for Tag Master
// Uses ES modules syntax (type=module in index.html)

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  tags: [],
  quiz: [],
  favorites: new Set(JSON.parse(localStorage.getItem("tm_favs") || "[]")),
  currentModalTag: null, // To track the tag in the modal
  progress: JSON.parse(localStorage.getItem("tm_progress") || "{}"),
};

// Additional state for CSS properties demos
state.cssprops = [];

async function fetchJSON(path) {
  try {
    const r = await fetch(path);
    if (!r.ok)
      throw new Error(`Failed to fetch ${path}: ${r.status} ${r.statusText}`);
    return r.json();
  } catch (err) {
    console.error(err);
    throw new Error(`Network error while fetching ${path}`);
  }
}

/* ---------- Render Tags ---------- */
function renderTagCard(tag) {
  const el = document.createElement("article");
  el.className = "card tag-card";
  el.innerHTML = `
    <div class="meta"><div class="icon">${escapeHtml(
      tag.icon || "<"
    )}</div><div><strong>${escapeHtml(
    tag.name
  )}</strong><div class="muted small">${escapeHtml(
    tag.category
  )}</div></div></div>
    <h3>${escapeHtml(tag.title)}</h3>
    <p class="muted">${escapeHtml(tag.desc)}</p>
    <pre><code class="language-html code-block">${escapeHtml(
      tag.example
    )}</code></pre>
    <div class="actions">
      <div class="action-group">
        <button class="btn small" data-action="copy" aria-label="Copy code for ${escapeHtml(
          tag.name
        )}">Copy</button>
        <button class="btn small" data-action="preview" aria-label="Show live preview for ${escapeHtml(
          tag.name
        )}">Live</button>
      </div>
      <button class="btn small" data-action="fav" aria-label="Add ${escapeHtml(
        tag.name
      )} to favorites">${state.favorites.has(tag.name) ? "★" : "☆"}</button>
    </div>
  `;

  el.querySelector("[data-action=copy]").addEventListener("click", () => {
    navigator.clipboard.writeText(tag.example);
    flash(el, "Copied!");
  });
  el.querySelector("[data-action=preview]").addEventListener("click", () => {
    openTagModal(tag);
  });
  el.querySelector("[data-action=fav]").addEventListener("click", (ev) => {
    toggleFav(tag.name, ev.target);
  });

  return el;
}

function escapeHtml(s) {
  if (!s && s !== 0) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;")
    .replace(/\//g, "&#x2F;");
}

/* ---------- Modal / Detail panel ---------- */
function openTagModal(tag) {
  const modal = $("#tagModal");
  modal.setAttribute("aria-hidden", "false");
  $("#modalTitle").textContent = `${tag.name} — ${tag.title}`;
  $("#modalHtml").value = tag.example;
  state.currentModalTag = tag; // Store the current tag
  $("#modalFav").textContent = state.favorites.has(tag.name) ? "★" : "☆";
  runModalPreview();
}

function closeTagModal() {
  const modal = $("#tagModal");
  modal.setAttribute("aria-hidden", "true");
}

function renderPreview(frame, html, css, js) {
  const doc = frame.contentDocument || frame.contentWindow.document;
  const full = `<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui;padding:1rem}${css}</style><body class="preview-body">${html}<script>\n    try{ (async ()=>{ ${js.replace(
    /<\/?script>/g,
    ""
  )} })(); }catch(e){console.error(e);} \n    </script></body>`;
  doc.open();
  doc.write(full);
  doc.close();
}

function runModalPreview() {
  const html = $("#modalHtml").value;
  const frame = $("#modalPreview");
  renderPreview(frame, html, "", "");
}

function runPlayground() {
  const html = $("#editorHtml").value;
  const css = $("#editorCss").value;
  const js = $("#editorJs") ? $("#editorJs").value : "";
  const frame = $("#playframe");
  renderPreview(frame, html, css, js);
}

/* ---------- Quiz ---------- */
function renderQuiz() {
  const qArea = $("#quizArea");
  qArea.innerHTML = "";
  state.quiz.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "card";
    let choices = q.choices
      .map(
        (c, idx) =>
          `<label><input type="radio" name="q${i}" value="${idx}"> ${c}</label>`
      )
      .join("<br>");
    card.innerHTML = `<h4>${q.q}</h4><div>${choices}</div><div style="margin-top:.6rem"><button class="btn small" data-i="${i}">Check</button><span class="muted" data-feedback></span></div>`;
    card.querySelector("button").addEventListener("click", (ev) => {
      ev.target.disabled = true;
      const i = ev.target.dataset.i;
      const selected = card.querySelector("input[type=radio]:checked");
      const fb = card.querySelector("[data-feedback]");
      if (!selected) {
        fb.textContent = " Select an answer.";
        return;
      }
      const got = parseInt(selected.value, 10);
      if (got === state.quiz[i].answer) {
        fb.textContent = " Correct!";
        fb.style.color = "lightgreen";
        saveProgress("quiz-" + i, true);
      } else {
        fb.textContent = " Incorrect — try again.";
        fb.style.color = "salmon";
        saveProgress("quiz-" + i, false);
      }
      updateQuizProgress();
    });
    qArea.appendChild(card);
  });
  updateQuizProgress();
}

function saveProgress(key, val) {
  state.progress[key] = val;
  localStorage.setItem("tm_progress", JSON.stringify(state.progress));
}

function updateQuizProgress() {
  const correctAnswers = Object.keys(state.progress).filter(
    (k) => k.startsWith("quiz-") && state.progress[k]
  ).length;
  const totalQuestions = state.quiz.length;
  const percentage =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const progressBar = $("#quizProgressBar");
  if (progressBar) progressBar.style.width = `${percentage}%`;
  localStorage.setItem("tm_progress", JSON.stringify(state.progress));
}

/* ---------- Cheat sheet generation ---------- */
function setupCheatDownload() {
  const doDownload = () => {
    const lines = state.tags.map(
      (t) => `${t.name} - ${t.title}\n${t.desc}\nExample:\n${t.example}\n\n`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tag-master-cheatsheet.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  const btn = document.getElementById("downloadCheat");
  if (btn) btn.addEventListener("click", doDownload);
  const anchor = document.getElementById("cheatDownload");
  if (anchor)
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      doDownload();
    });
}

/* Ensure Prism highlights code blocks after dynamic updates */
function highlightAllIn(container = document) {
  if (window.Prism) {
    const codes = container.querySelectorAll('code[class*="language-"]');
    codes.forEach((c) => {
      try {
        Prism.highlightElement(c);
      } catch (e) {}
    });
  }
}

/* ---------- Theme, nav and misc ---------- */
function setupThemeToggle() {
  const btn = $("#themeToggle");
  const current = localStorage.getItem("tm_theme") || "dark";
  document.body.setAttribute("data-theme", current);
  btn.textContent = current === "dark" ? "🌙" : "☀️";
  btn.addEventListener("click", () => {
    const now =
      document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", now);
    btn.textContent = now === "dark" ? "🌙" : "☀️";
    localStorage.setItem("tm_theme", now);
  });
}

function setupMobileMenu() {
  const menuToggle = $("#menuToggle");
  const closeMenu = $("#closeMenu");
  const mobileMenu = $("#mobile-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active");
    });
  }

  if (closeMenu) {
    closeMenu.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  }

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  });
}

// Smooth scroll for internal nav links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) {
        console.warn(`Element with id ${href} not found`);
        return;
      }
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------- Init ---------- */

function flash(el, msg, duration = 1000) {
  const originalText = el.innerHTML;
  if (msg) {
    el.innerHTML = msg;
  }
  el.classList.add("flash");
  setTimeout(() => {
    if (msg) {
      el.innerHTML = originalText;
    }
    el.classList.remove("flash");
  }, duration);
}

function toggleFav(tagName, btn) {
  if (state.favorites.has(tagName)) {
    state.favorites.delete(tagName);
    if (btn) btn.textContent = "☆";
  } else {
    state.favorites.add(tagName);
    if (btn) btn.textContent = "★";
  }
  localStorage.setItem("tm_favs", JSON.stringify(Array.from(state.favorites)));
}

function populateCategories() {
  const filter = $("#filterCategory");
  if (!filter) return;
  const categories = new Set(state.tags.map((t) => t.category));
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filter.appendChild(opt);
  });
}

function renderTags(filter = "") {
  const grid = $("#tagsGrid");
  const loading = $("#tagsLoading");
  if (!grid || !loading) return;

  loading.style.display = "block";
  grid.innerHTML = "";

  setTimeout(() => {
    const searchFilter = filter.toLowerCase();
    const categoryFilter = $("#filterCategory").value;

    const filteredTags = state.tags.filter((tag) => {
      const matchesCategory =
        categoryFilter === "all" ||
        tag.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSearch =
        !searchFilter ||
        tag.name.toLowerCase().includes(searchFilter) ||
        tag.desc.toLowerCase().includes(searchFilter) ||
        tag.category.toLowerCase().includes(searchFilter);
      return matchesCategory && matchesSearch;
    });

    const fragment = document.createDocumentFragment();
    filteredTags.forEach((tag) => {
      const card = renderTagCard(tag);
      card.id = tag.name;
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);
    highlightAllIn(grid);
    loading.style.display = "none";
  }, 200); // Simulate a short delay for user feedback
}

function setupSearch() {
  const searchInput = $("#searchInput");
  const categoryFilter = $("#filterCategory");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderTags(searchInput.value);
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      renderTags(searchInput.value);
    });
  }
}

function setupPlayground() {
  const runBtn = $("#runBtn");
  const copyAllBtn = $("#copyAll");
  if (runBtn) {
    runBtn.addEventListener("click", runPlayground);
  }
  if (copyAllBtn) {
    copyAllBtn.addEventListener("click", () => {
      const html = $("#editorHtml").value;
      const css = $("#editorCss").value;
      const js = $("#editorJs").value;
      const allCode = `<!-- HTML -->\n${html}\n\n<!-- CSS -->\n<style>\n${css}\n</style>\n\n<!-- JS -->\n<script>\n${js}\n</script>`;
      navigator.clipboard.writeText(allCode).then(() => {
        flash(copyAllBtn, "Copied!");
      });
    });
  }
}

function setupModalEvents() {
  const modal = $("#tagModal");
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (
      e.target.dataset.action === "close" ||
      e.target.classList.contains("modal-backdrop")
    ) {
      closeTagModal();
    }
  });

  const runBtn = $("#modalRun");
  if (runBtn) {
    runBtn.addEventListener("click", runModalPreview);
  }

  const copyBtn = $("#modalCopy");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const html = $("#modalHtml").value;
      navigator.clipboard.writeText(html);
      flash(copyBtn, "Copied!");
    });
  }

  const favBtn = $("#modalFav");
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      if (!state.currentModalTag) return;
      toggleFav(state.currentModalTag.name, favBtn);
    });
  }
}

function setupBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("visible");
    } else {
      backToTopButton.classList.remove("visible");
    }
  });

  backToTopButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function setupCardHover() {
  const cards = $$(".card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      card.classList.add("hover");
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("hover");
    });
  });
}

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<div style="background:crimson;padding:8px;color:white">An unexpected error occurred. Please try again later.</div>'
  );
});

async function init() {
  const [tags, quiz] = await Promise.all([
    fetchJSON("data/tags.json"),
    fetchJSON("data/quiz.json"),
  ]);

  state.tags = tags;
  state.quiz = quiz;

  populateCategories();

  renderTags();

  setupSearch();

  setupPlayground();

  setupModalEvents();

  renderQuiz();

  setupCheatDownload();

  setupThemeToggle();
  setupMobileMenu();

  setupSmoothScroll();

  setupBackToTop();

  setupCardHover();

  // load JS lessons, CSS lessons and UI/UX guides

  try {
    state.jsLessons = await fetchJSON("data/js_topics.json");
    renderJSLessons();
  } catch (e) {
    console.warn("js lessons not loaded", e);
  }

  try {
    state.cssLessons = await fetchJSON("data/css_topics.json");
    renderCSSLessons();
  } catch (e) {
    console.warn("css lessons not loaded", e);
  }

  try {
    state.ux = await fetchJSON("data/uiux.json");
    renderUX();
  } catch (e) {
    console.warn("ux guides not loaded", e);
  }

  document.getElementById("year").textContent = new Date().getFullYear();
}

function openLessonModal(lesson) {
  const modal = $("#tagModal");
  modal.setAttribute("aria-hidden", "false");
  $("#modalTitle").textContent = `${lesson.title}`;
  $("#modalHtml").value = '<div class="exercise-output"></div>';
  $("#editorJs").value = lesson.example;
  runModalPreview();
}

/* Render JavaScript lessons */
function renderJSLessons() {
  const grid = $("#jsLessons");
  if (!grid) return;
  grid.innerHTML = "";
  (state.jsLessons || []).forEach((l) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h4>${l.title}</h4><div class="muted small">${
      l.category
    }</div><p class="muted">${
      l.desc
    }</p><pre><code class="language-js">${escapeHtml(
      l.example
    )}</code></pre><div class="actions"><button class="btn small" data-action="run">Run</button><button class="btn small" data-action="exercise">Exercise</button></div>`;
    card.querySelector("[data-action=run]").addEventListener("click", () => {
      // copy example into playground and run
      if ($("#editorHtml"))
        $("#editorHtml").value = '<div class="lesson-output"></div>';
      if ($("#editorCss")) $("#editorCss").value = "";
      if ($("#editorJs")) $("#editorJs").value = l.example;
      runPlayground();
    });
    card
      .querySelector("[data-action=exercise]")
      .addEventListener("click", () => {
        // open modal with exercise; reuse modal UI
        openLessonModal(l);
      });
    grid.appendChild(card);
  });
  highlightAllIn(grid);
}

/* Render CSS lessons */
function renderCSSLessons() {
  const grid = $("#cssTopicsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  (state.cssLessons || []).forEach((l) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h4>${l.title}</h4><div class="muted small">${
      l.category
    }</div><p class="muted">${
      l.desc
    }</p><pre><code class="language-css">${escapeHtml(
      l.example
    )}</code></pre><div class="actions"><button class="btn small" data-action="try">Try it</button></div>`;
    card.querySelector("[data-action=try]").addEventListener("click", () => {
      // copy example into playground
      if ($("#editorHtml"))
        $("#editorHtml").value = '<div class="box">Styled with CSS</div>';
      if ($("#editorCss"))
        $(
          "#editorCss"
        ).value = `${l.example}\n\n.box { padding: 1rem; border: 1px solid; }`;
      if ($("#editorJs")) $("#editorJs").value = "";
      runPlayground();
      $("#playground").scrollIntoView({ behavior: "smooth" });
    });
    grid.appendChild(card);
  });
  highlightAllIn(grid);
}

/* Render UI/UX cards */
function renderUX() {
  const grid = $("#uxGrid");
  if (!grid) return;
  grid.innerHTML = "";
  (state.ux || []).forEach((u) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h4>${u.title}</h4><div class="muted small">${
      u.category
    }</div><p>${u.desc}</p><ul>${(u.tips || [])
      .map((t) => `<li>${t}</li>`)
      .join("")}</ul>`;
    grid.appendChild(card);
  });
}

/* ---------- CSS Properties demos (fetch + render) ---------- */
async function fetchCSSProps() {
  try {
    const props = await fetchJSON("data/cssprops.json");
    state.cssprops = props || [];
    renderCSSProps();
  } catch (e) {
    // silently continue if file missing
    console.warn("cssprops not available", e);
  }
}

function renderCSSProps() {
  const grid = $("#cssPropsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  (state.cssprops || []).forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    const demoId = `demo-${p.prop}-${Math.random().toString(36).slice(2, 9)}`;
    card.innerHTML = `
      <h4>${p.name}</h4>
      <div class="muted small">${p.desc}</div>
      <div class="prop-demo" id="${demoId}">${p.sample}</div>
      <div style="margin-top:.6rem" class="prop-controls">
        <input class="prop-input" type="text" value="${
          p.value || ""
        }" aria-label="Value for ${p.prop}" />
        <button class="btn small" data-action="apply">Apply</button>
      </div>
    `;

    const input = card.querySelector(".prop-input");
    const btn = card.querySelector("[data-action=apply]");
    btn.addEventListener("click", () => {
      const val = input.value.trim();
      const demo = document.getElementById(demoId);
      if (!demo) return;
      try {
        // apply style using setProperty so kebab-case names like 'font-size' work
        demo.style.setProperty(p.prop, val);
      } catch (err) {
        console.warn(err);
      }
      flash(card);
    });

    grid.appendChild(card);
  });
}

init();
