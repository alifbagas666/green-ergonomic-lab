/* Green Ergonomic Lab: shared behaviour (nav, reveal, data pages) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menu-toggle");
  var links = document.getElementById("nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- page transitions ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || reduce || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(function () { window.location.href = href; }, 230);
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.body.classList.remove("leaving");
  });

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduce) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  /* ---------- count up ---------- */
  function countUp(el, target) {
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- data loading with placeholder fallback ---------- */
  var cache = {};
  window.LabData = {
    load: function (name) {
      if (!cache[name]) {
        cache[name] = fetch("data/" + name + ".json").then(function (r) {
          if (!r.ok) throw new Error(name + " " + r.status);
          return r.json();
        });
      }
      return cache[name];
    }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  window.LabData.esc = esc;

  var T = function () { return LabI18n.t.apply(null, arguments); };
  var C = function (n) { return LabI18n.cat(n); };

  /* ---------- home page ---------- */
  function initHome() {
    var stats = document.getElementById("stats");
    var hl = document.getElementById("highlights");
    var catsData = null;
    function drawHighlights() {
      if (!hl || !catsData) return;
      hl.innerHTML = catsData.branches.slice(0, 6).map(function (b) {
        var subs = b.children.filter(function (c) { return c.name !== "General"; }).slice(0, 3).map(function (c) { return esc(C(c.name)); }).join(LabI18n.lang === "zh" ? "\u3001" : ", ");
        return '<article class="card reveal visible"><span class="tag">' + T("papers", b.count) + "</span>" +
          "<h3>" + esc(C(b.name)) + '</h3><p class="muted">' + subs + "</p></article>";
      }).join("");
    }
    if (hl) hl.innerHTML = '<p class="muted">' + T("loadingHl") + "</p>";
    Promise.all([LabData.load("publications"), LabData.load("categories")]).then(function (res) {
      var pubs = res[0]; catsData = res[1];
      var years = pubs.map(function (p) { return p.year; }).filter(Boolean);
      var span = Math.max.apply(null, years) - Math.min.apply(null, years) + 1;
      var vals = { papers: pubs.length, years: span, categories: catsData.branches.length };
      document.querySelectorAll("[data-count]").forEach(function (el) {
        var v = vals[el.getAttribute("data-count")];
        if (v != null) countUp(el, v);
      });
      drawHighlights();
      document.addEventListener("langchange", drawHighlights);
    }).catch(function () {
      document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = "\u2013"; });
      function miss() { if (hl) hl.innerHTML = '<p class="empty">' + T("hlMissing") + "</p>"; }
      miss(); document.addEventListener("langchange", miss);
      if (stats) stats.setAttribute("data-missing", "true");
    });
  }

  /* ---------- publications page ---------- */
  function initPublications() {
    var list = document.getElementById("pub-list");
    var q = document.getElementById("q"), cat = document.getElementById("cat"),
        yr = document.getElementById("year"), sort = document.getElementById("sort"),
        count = document.getElementById("pub-count"), more = document.getElementById("more");
    var PAGE = 40, shown = PAGE, pubs = [], filtered = [], catCounts = {};
    list.innerHTML = '<li class="empty">' + T("loadingPubs") + "</li>";
    count.textContent = T("loading");

    function render() {
      var slice = filtered.slice(0, shown);
      if (!filtered.length) {
        list.innerHTML = '<li class="empty">' + T("noMatch") + "</li>";
      } else {
        list.innerHTML = slice.map(function (p) {
          var doi = p.doi ? '<a href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">' + T("doi") + esc(p.doi) + "</a>" :
            (p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + T("link") + "</a>" : '<span class="muted">' + T("noDoi") + "</span>");
          var authors = (p.authors || []).slice(0, 6).join(", ") + ((p.authors || []).length > 6 ? T("etal") : "");
          return '<li class="pub"><h3>' + esc(p.title) + '</h3><div class="meta">' + esc(authors) + "</div>" +
            '<div class="meta">' + esc(p.venue || T("venueNone")) + " &middot; " + esc(p.year || T("nd")) + "</div>" +
            '<div class="row"><span class="tag">' + esc(C(p.category)) + "</span>" + doi + "</div></li>";
        }).join("");
      }
      count.textContent = T("count", filtered.length, pubs.length);
      more.hidden = filtered.length <= shown;
    }

    function fillCategories() {
      var cur = cat.value;
      Array.prototype.slice.call(cat.querySelectorAll("option[data-dyn]")).forEach(function (o) { o.remove(); });
      Object.keys(catCounts).sort().forEach(function (c) {
        cat.insertAdjacentHTML("beforeend", '<option data-dyn value="' + esc(c) + '">' + esc(C(c)) + " (" + catCounts[c] + ")</option>");
      });
      cat.value = cur;
    }

    function apply() {
      var term = q.value.trim().toLowerCase();
      filtered = pubs.filter(function (p) {
        if (cat.value && p.category !== cat.value) return false;
        if (yr.value && String(p.year) !== yr.value) return false;
        if (!term) return true;
        return (p.title + " " + (p.authors || []).join(" ") + " " + (p.venue || "") + " " + (p.keywords || []).join(" ")).toLowerCase().indexOf(term) !== -1;
      });
      var s = sort.value;
      filtered.sort(function (a, b) {
        if (s === "year-asc") return (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title);
        if (s === "title") return a.title.localeCompare(b.title);
        return (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title);
      });
      shown = PAGE;
      render();
    }

    LabData.load("publications").then(function (data) {
      pubs = data;
      var years = {};
      pubs.forEach(function (p) { catCounts[p.category] = (catCounts[p.category] || 0) + 1; if (p.year) years[p.year] = 1; });
      fillCategories();
      Object.keys(years).sort(function (a, b) { return b - a; }).forEach(function (y) {
        yr.insertAdjacentHTML("beforeend", '<option data-dyn value="' + y + '">' + y + "</option>");
      });
      [q, cat, yr, sort].forEach(function (el) { el.addEventListener("input", apply); });
      more.addEventListener("click", function () { shown += PAGE; render(); });
      document.addEventListener("langchange", function () { fillCategories(); render(); });
      apply();
    }).catch(function () {
      function miss() { count.textContent = ""; list.innerHTML = '<li class="empty">' + T("pubMissing") + "</li>"; }
      miss(); document.addEventListener("langchange", miss);
      more.hidden = true;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    var page = document.body.getAttribute("data-page");
    if (page === "home") initHome();
    if (page === "publications") initPublications();
    function setYear() { var y = document.getElementById("year-now"); if (y) y.textContent = new Date().getFullYear(); }
    setYear(); document.addEventListener("langchange", setYear);
  });
})();
