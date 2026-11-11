/* Interactive research tree: lab (root) > focus areas > sub-areas > papers (leaves).
   Plain SVG and JS. Click a node to expand, hover for a preview, click a leaf for details.
   Pan with drag, zoom with wheel, buttons or pinch. */
(function () {
  "use strict";
  var svg = document.getElementById("tree-svg");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var ROW = 26, COLX = [0, 200, 580, 900];
  var esc = window.LabData.esc;
  var T = function () { return LabI18n.t.apply(null, arguments); };
  var C = function (n) { return LabI18n.cat(n); };
  var detail = document.getElementById("detail");
  var tip = document.getElementById("tip");

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  Promise.all([LabData.load("categories"), LabData.load("publications")]).then(function (res) {
    build(res[0], res[1]);
  }).catch(function () {
    svg.outerHTML = '<div class="empty" style="margin:1rem">' + T("treeMissing") + "</div>";
    var c = document.querySelector(".tree-ctrl"); if (c) c.hidden = true;
  });

  function build(cats, pubs) {
    var byId = {};
    pubs.forEach(function (p) { byId[p.id] = p; });
    /* colors come from CSS variables so they follow light and dark mode:
       purple for the root and main branches, green for sub-branches and paper leaves */

    /* node model */
    var rootNode = { key: "root", label: cats.root, depth: 0, children: [], kind: "root", color: "var(--tree-root)", count: cats.total };
    cats.branches.forEach(function (b, i) {
      var color = i % 2 ? "var(--tree-branch-b)" : "var(--tree-branch-a)";
      var leafColor = i % 2 ? "var(--tree-leaf-b)" : "var(--tree-leaf-a)";
      var bn = { key: b.name, label: b.name, depth: 1, kind: "branch", color: color, count: b.count, children: [], parent: rootNode };
      b.children.forEach(function (s) {
        var sn = { key: b.name + "/" + s.name, label: s.name, depth: 2, kind: "sub", color: leafColor, count: s.count, children: [], parent: bn };
        s.papers.forEach(function (id) {
          var p = byId[id]; if (!p) return;
          sn.children.push({ key: id, label: p.title, depth: 3, kind: "leaf", color: leafColor, paper: p, children: [], parent: sn });
        });
        sn.children.sort(function (a, b) { return (b.paper.year || 0) - (a.paper.year || 0); });
        bn.children.push(sn);
      });
      rootNode.children.push(bn);
    });

    var expanded = { root: true };
    var gLinks, gNodes, gView;
    gView = el("g", { id: "viewport" }, svg);
    gLinks = el("g", {}, gView);
    gNodes = el("g", {}, gView);
    var view = { x: 40, y: 40, k: 1 };
    var domMap = {}, linkMap = {};

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function applyView(animate) {
      gView.style.transition = animate && !reduceMotion ? "transform .45s cubic-bezier(.2,.8,.2,1)" : "none";
      gView.style.transform = "translate(" + view.x + "px," + view.y + "px) scale(" + view.k + ")";
    }
    gView.style.transformOrigin = "0 0";
    /* after expanding a node, pan so that it and its children are on screen */
    function reveal(n) {
      if (!n.children.length || !expanded[n.key]) return;
      var rect = svg.getBoundingClientRect(), ys = n.children.map(function (c) { return c.y; });
      var top = Math.min.apply(null, ys.concat(n.y)) * view.k + view.y, bot = Math.max.apply(null, ys.concat(n.y)) * view.k + view.y;
      var dy = 0;
      if (bot - top > rect.height - 60 || top < 30) dy = 30 - top; else if (bot > rect.height - 30) dy = rect.height - 30 - bot;
      var right = (n.children[0].x + 430) * view.k + view.x, dx = 0;
      if (right > rect.width) dx = Math.max(rect.width - right - 10, 24 - (n.x * view.k + view.x));
      view.x += dx; view.y += dy; applyView(true);
    }

    /* layout */
    var visible;
    function layout() {
      visible = [];
      var slot = 0;
      (function walk(n) {
        n.x = COLX[n.depth];
        visible.push(n);
        if (expanded[n.key] && n.children.length) {
          n.children.forEach(walk);
          n.y = (n.children[0].y + n.children[n.children.length - 1].y) / 2;
        } else {
          n.y = slot * ROW + ROW / 2; slot += 1;
          if (n.kind === "leaf") return;
        }
      })(rootNode);
    }

    function radius(n) { return n.kind === "root" ? 12 : n.kind === "branch" ? 9 : n.kind === "sub" ? 7 : 5; }
    function labelOf(n) {
      var t = n.kind === "leaf" ? n.label : C(n.label);
      if (n.kind === "leaf") { t = (n.paper.year ? n.paper.year + "  " : "") + (t.length > 62 ? t.slice(0, 60) + "…" : t); }
      else if (n.kind !== "root") t += " (" + n.count + ")";
      return t;
    }
    function shape(n) {
      var open = expanded[n.key];
      if (n.kind === "leaf") return "leaf";
      return open ? "open" : "closed";
    }

    function render(anchor) {
      var before = anchor ? { x: anchor.x, y: anchor.y } : null;
      layout();
      if (before) { view.x += (before.x - anchor.x) * view.k; view.y += (before.y - anchor.y) * view.k; applyView(); }
      if (anchor) reveal(anchor);
      var keep = {};
      visible.forEach(function (n) {
        keep[n.key] = true;
        var g = domMap[n.key];
        if (!g) {
          g = el("g", { "class": "node " + n.kind, tabindex: 0, role: "button" }, gNodes);
          var start = n.parent || n;
          g.style.transform = "translate(" + start.x + "px," + start.y + "px)";
          g.style.opacity = 0;
          var c = el("circle", { r: radius(n), style: "fill:" + n.color }, g);
          if (n.kind !== "leaf") el("path", { "class": "mark", stroke: "#fff", "stroke-width": 2, "stroke-linecap": "round", fill: "none" }, g);
          var t = el("text", { x: radius(n) + 7, y: 4.5 }, g);
          t.textContent = labelOf(n);
          g.__node = n;
          g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(n); } });
          g.addEventListener("mouseenter", function (e) { showTip(n, e); });
          g.addEventListener("mousemove", moveTip);
          g.addEventListener("mouseleave", hideTip);
          g.addEventListener("focus", function () { showTip(n, null, g); });
          g.addEventListener("blur", hideTip);
          domMap[n.key] = g;
          (function (gg, nn) { requestAnimationFrame(function () { requestAnimationFrame(function () {
            gg.style.transform = "translate(" + nn.x + "px," + nn.y + "px)"; gg.style.opacity = 1; }); }); })(g, n);
        } else {
          g.style.transform = "translate(" + n.x + "px," + n.y + "px)";
          g.style.opacity = 1;
        }
        g.setAttribute("aria-label", n.kind === "leaf" ? T("paper") + n.label : C(n.label) + ", " + T(expanded[n.key] ? "expanded" : "collapsed"));
        g.querySelector("text").textContent = labelOf(n);
        if (n.kind !== "leaf") {
          g.setAttribute("aria-expanded", expanded[n.key] ? "true" : "false");
          var m = g.querySelector(".mark");
          var r = radius(n) * 0.5;
          m.setAttribute("d", expanded[n.key] ? "M" + (-r) + " 0H" + r : "M" + (-r) + " 0H" + r + "M0 " + (-r) + "V" + r);
        }
      });
      Object.keys(domMap).forEach(function (k) {
        if (!keep[k]) {
          var g = domMap[k]; delete domMap[k];
          g.style.opacity = 0;
          setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 380);
        }
      });
      drawLinks();
    }

    function drawLinks() {
      while (gLinks.firstChild) gLinks.removeChild(gLinks.firstChild);
      visible.forEach(function (n) {
        if (!n.parent) return;
        var p = n.parent, mx = (p.x + n.x) / 2;
        el("path", { "class": "link", d: "M" + p.x + " " + p.y + "C" + mx + " " + p.y + " " + mx + " " + n.y + " " + n.x + " " + n.y,
          style: "stroke:" + n.color + ";opacity:.45" }, gLinks);
      });
    }

    function collapseDescendants(n) {
      n.children.forEach(function (c) { delete expanded[c.key]; collapseDescendants(c); });
    }

    function activate(n) {
      hideTip();
      if (n.kind === "leaf") { showDetail(n.paper); return; }
      if (expanded[n.key]) { delete expanded[n.key]; collapseDescendants(n); }
      else {
        /* accordion among siblings keeps the picture readable */
        if (n.parent) n.parent.children.forEach(function (s) { if (s !== n) { delete expanded[s.key]; collapseDescendants(s); } });
        expanded[n.key] = true;
      }
      render(n);
    }

    var shownPaper = null;
    function showDetail(p, quiet) {
      shownPaper = p;
      var doi = p.doi ? '<a class="btn btn-solid" href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">' + T("openDoi") + "</a>" :
        (p.url ? '<a class="btn btn-solid" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + T("openLink") + "</a>" : '<span class="muted">' + T("noDoiPaper") + "</span>");
      var authors = (p.authors || []).join(", ");
      detail.innerHTML = '<div class="card"><span class="tag">' + esc(C(p.category)) + "</span> " +
        '<span class="tag accent">' + esc(C(p.subcategory)) + "</span>" +
        '<h3 style="margin-top:.7rem">' + esc(p.title) + "</h3>" +
        '<p class="muted">' + esc(authors) + "</p>" +
        "<p>" + esc(p.venue || T("venueNone")) + " &middot; " + esc(p.year || T("nd")) + "</p>" + doi + "</div>";
      detail.hidden = false;
      if (!quiet) detail.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
    }

    /* tooltip */
    function showTip(n, e, g) {
      if (e && e.pointerType === "touch") return;
      var t = n.kind === "leaf" ? "<strong>" + esc(n.label) + "</strong><br>" + esc(n.paper.year || T("nd"))
        : "<strong>" + esc(C(n.label)) + "</strong>" + (n.count ? "<br>" + T("papers", n.count) : "");
      tip.innerHTML = t; tip.classList.add("show");
      if (e) moveTip(e);
      else { var r = g.getBoundingClientRect(); tip.style.left = r.right + 8 + "px"; tip.style.top = r.top + "px"; }
    }
    function moveTip(e) {
      var x = Math.min(e.clientX + 14, window.innerWidth - 340);
      tip.style.left = x + "px"; tip.style.top = e.clientY + 16 + "px";
    }
    function hideTip() { tip.classList.remove("show"); }

    /* pan and zoom (mouse, touch, pinch) */
    var pointers = {}, dragMoved = false, startView, startPt, pinch0;
    svg.addEventListener("pointerdown", function (e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      dragMoved = false;
      var ids = Object.keys(pointers);
      if (ids.length === 1) { startPt = { x: e.clientX, y: e.clientY }; startView = { x: view.x, y: view.y }; }
      if (ids.length === 2) { pinch0 = { d: dist(), k: view.k, mid: mid(), vx: view.x, vy: view.y }; }
    });
    svg.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 1) {
        var dx = e.clientX - startPt.x, dy = e.clientY - startPt.y;
        if (!dragMoved && Math.abs(dx) + Math.abs(dy) > 6) { dragMoved = true; svg.classList.add("dragging"); hideTip(); }
        if (dragMoved) { view.x = startView.x + dx; view.y = startView.y + dy; applyView(); }
      } else if (ids.length === 2 && pinch0) {
        dragMoved = true;
        var k = clamp(pinch0.k * dist() / pinch0.d), m = mid(), rect = svg.getBoundingClientRect();
        var cx = pinch0.mid.x - rect.left, cy = pinch0.mid.y - rect.top;
        view.x = cx - (cx - pinch0.vx) * (k / pinch0.k) + (m.x - pinch0.mid.x);
        view.y = cy - (cy - pinch0.vy) * (k / pinch0.k) + (m.y - pinch0.mid.y);
        view.k = k; applyView();
      }
    });
    function endPtr(e) {
      /* a tap or click: pointer released without dragging or pinching */
      var wasTap = e.type === "pointerup" && !dragMoved && Object.keys(pointers).length === 1;
      var hit = wasTap && e.target.closest ? e.target.closest(".node") : null;
      delete pointers[e.pointerId];
      if (hit && hit.__node) activate(hit.__node);
      if (!Object.keys(pointers).length) { svg.classList.remove("dragging"); setTimeout(function () { dragMoved = false; }, 0); }
      pinch0 = null;
      var ids = Object.keys(pointers);
      if (ids.length === 1) { var p = pointers[ids[0]]; startPt = { x: p.x, y: p.y }; startView = { x: view.x, y: view.y }; }
    }
    svg.addEventListener("pointerup", endPtr);
    svg.addEventListener("pointercancel", endPtr);
    function dist() { var a = Object.keys(pointers).map(function (i) { return pointers[i]; }); return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1; }
    function mid() { var a = Object.keys(pointers).map(function (i) { return pointers[i]; }); return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 }; }
    function clamp(k) { return Math.max(0.25, Math.min(3, k)); }
    function zoomAt(f, cx, cy) {
      var k = clamp(view.k * f), r = k / view.k;
      view.x = cx - (cx - view.x) * r; view.y = cy - (cy - view.y) * r; view.k = k; applyView();
    }
    svg.addEventListener("wheel", function (e) {
      e.preventDefault();
      var rect = svg.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });
    function fit() {
      var rect = svg.getBoundingClientRect();
      var maxY = 0, maxX = 0;
      visible.forEach(function (n) { maxY = Math.max(maxY, n.y); maxX = Math.max(maxX, n.x + 260); });
      var k = Math.min(1, (rect.width - 60) / maxX, (rect.height - 60) / (maxY + ROW));
      view.k = Math.max(k, 0.3); view.x = 30; view.y = Math.max(20, (rect.height - (maxY + ROW) * view.k) / 2); applyView();
    }
    var ctrl = document.querySelector(".tree-ctrl");
    ctrl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var rect = svg.getBoundingClientRect(), a = b.getAttribute("data-act");
      if (a === "in") zoomAt(1.25, rect.width / 2, rect.height / 2);
      if (a === "out") zoomAt(0.8, rect.width / 2, rect.height / 2);
      if (a === "reset") { expanded = { root: true }; render(); fit(); detail.hidden = true; }
    });

    render();
    fit();
    window.addEventListener("resize", fit);
    document.addEventListener("langchange", function () {
      hideTip();
      render();
      if (shownPaper && !detail.hidden) showDetail(shownPaper, true);
    });
  }
})();
