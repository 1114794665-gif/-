/* BYF BOOM front-end: navigation, catalogue filtering, quote list and RFQ submission. */
(function () {
  "use strict";

  var CART_KEY = "byfboom_quote_v2";
  // Pricing is quotation-only, so no price figure is ever computed in the
  // browser. The quote list carries SKUs and quantities only, and the quantity
  // field starts empty of any implied "normal order size".
  var DEFAULT_QTY = 1;
  var catalogPromise = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch("/search-index.json")
        .then(function (r) { return r.json(); })
        .catch(function () { return []; });
    }
    return catalogPromise;
  }

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; }
  }

  function writeCart(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {}
    updateBadges();
  }

  /* Catalogue entries never carry a figure: every SKU is quoted per project. */
  function priceLine() {
    return "<span class='price-on-request'>Price on request</span> <span class='muted'>· quoted per project</span>";
  }

  function addItem(slug, qty) {
    var items = readCart();
    var found = items.filter(function (i) { return i.s === slug; })[0];
    if (found) found.q = Math.max(Number(qty) || DEFAULT_QTY, found.q);
    else items.push({ s: slug, q: Number(qty) || DEFAULT_QTY });
    writeCart(items);
    return items;
  }

  function removeItem(slug) {
    writeCart(readCart().filter(function (i) { return i.s !== slug; }));
  }

  function setQty(slug, qty) {
    var items = readCart();
    items.forEach(function (i) { if (i.s === slug) i.q = Math.max(1, Number(qty) || 1); });
    writeCart(items);
    return items;
  }

  function updateBadges() {
    var items = readCart();
    $$("[data-quote-count]").forEach(function (el) {
      if (items.length) {
        el.hidden = false;
        el.textContent = String(items.length);
      } else {
        el.hidden = true;
      }
    });
  }

  /* ---------- navigation ---------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    $$(".nav-item.has-sub > .nav-link").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        if (window.matchMedia("(max-width: 1000px)").matches) {
          e.preventDefault();
          var li = btn.parentElement;
          var open = li.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
        }
      });
    });
  }

  /* ---------- catalogue filter (shop page) ---------- */
  function initProductFilter() {
    var grid = $("#product-grid");
    if (!grid) return;
    var input = $("#product-filter");
    var cat = $("#category-filter");
    var sort = $("#sort-filter");
    var count = $("#filter-count");
    var empty = $("#empty-state");
    var all = $$(".grid-item", grid);

    function apply() {
      var q = (input && input.value || "").trim().toLowerCase();
      var c = cat && cat.value || "";
      var visible = [];
      all.forEach(function (item) {
        var hay = (item.getAttribute("data-name") || "") + " " + (item.getAttribute("data-sku") || "") + " " + (item.getAttribute("data-material") || "");
        var ok = (!q || hay.indexOf(q) !== -1) && (!c || item.getAttribute("data-cat") === c);
        item.classList.toggle("hidden", !ok);
        if (ok) visible.push(item);
      });
      if (count) count.textContent = visible.length + (visible.length === 1 ? " product" : " products");
      if (empty) empty.hidden = visible.length !== 0;
      if (sort && sort.value) {
        var v = sort.value;
        visible.sort(function (a, b) {
          // No price sort: the catalogue publishes no price figure to sort on.
          var dir = v === "name-desc" ? -1 : 1;
          return dir * (a.getAttribute("data-name") || "").localeCompare(b.getAttribute("data-name") || "");
        });
        visible.forEach(function (item) { grid.appendChild(item); });
      }
    }
    [input, cat, sort].forEach(function (el) { if (el) el.addEventListener("input", apply); });
    if (sort) sort.addEventListener("change", apply);
    apply();
  }

  /* ---------- search page ---------- */
  function initSearch() {
    var box = $("#site-search");
    var results = $("#search-results");
    if (!box || !results) return;
    var counter = $("#search-count");

    function render(items, q) {
      if (!q) {
        results.innerHTML = "";
        if (counter) counter.textContent = "Start typing to search.";
        return;
      }
      var list = items.slice(0, 60);
      if (counter) counter.textContent = list.length + (list.length === 1 ? " match" : " matches") + " for “" + q + "”";
      results.innerHTML = list.map(function (p) {
        return '<article class="card product-card">' +
          '<a class="card-media" href="' + p.u + '"><img src="' + p.i + '" alt="' + p.n.replace(/"/g, "&quot;") + ' — wholesale from BYF BOOM" width="800" height="800" loading="lazy"></a>' +
          '<div class="card-body"><p class="card-sku">' + p.k + " · " + p.m + "</p>" +
          '<h3 class="card-title"><a href="' + p.u + '">' + p.n + "</a></h3>" +
          '<p class="card-meta">' + p.c + "</p>" +
          '<p class="card-price">' + priceLine(p) + "</p>" +
          '<button class="btn btn-outline btn-sm" type="button" data-add-quote data-slug="' + p.s + '">Add to quote list</button>' +
          "</div></article>";
      }).join("");
    }

    loadCatalog().then(function (items) {
      function run() {
        var q = box.value.trim().toLowerCase();
        render(items.filter(function (p) {
          var hay = (p.n + " " + p.k + " " + p.c + " " + p.m).toLowerCase();
          return hay.indexOf(q) !== -1;
        }), q);
      }
      box.addEventListener("input", run);
      var url = new URLSearchParams(location.search).get("q");
      if (url) { box.value = url; }
      run();
    });
  }

  /* ---------- quote list page ---------- */
  function initQuotePage() {
    var mount = $("#quote-items");
    if (!mount) return;
    var emptyMsg = $("#quote-empty");
    var form = $("#quote-form");
    var status = $("#quote-status");
    var clearBtn = $("#quote-clear");
    var csvBtn = $("#quote-csv");
    var countBadge = $("#quote-count");

    function render() {
      var items = readCart();
      loadCatalog().then(function (catalog) {
        var bySlug = {};
        catalog.forEach(function (p) { bySlug[p.s] = p; });
        var rows = [];
        items.forEach(function (item) {
          var p = bySlug[item.s];
          if (!p) return;
          rows.push(
            '<div class="quote-row" data-slug="' + p.s + '">' +
              '<img src="' + p.i + '" alt="" width="76" height="76" loading="lazy">' +
              "<div>" +
                '<h3><a href="' + p.u + '">' + p.n + "</a></h3>" +
                '<p class="row-meta">' + p.k + " · " + p.c + " · " + p.m + " · price on request, quoted per project</p>" +
              "</div>" +
              '<div class="row-controls">' +
                '<label class="sr-only" for="qty-' + p.s + '">Quantity for ' + p.n + "</label>" +
                '<input type="number" id="qty-' + p.s + '" min="1" step="1" value="' + item.q + '" data-qty="' + p.s + '">' +
                '<button class="row-remove" type="button" data-remove="' + p.s + '">Remove</button>' +
              "</div>" +
            "</div>"
          );
        });
        mount.innerHTML = rows.join("");
        if (emptyMsg) emptyMsg.hidden = rows.length !== 0;
        if (clearBtn) clearBtn.disabled = rows.length === 0;
        if (csvBtn) csvBtn.disabled = rows.length === 0;
        if (countBadge) {
          var totalQty = 0;
          items.forEach(function (it) { totalQty += Number(it.q) || 0; });
          countBadge.hidden = rows.length === 0;
          countBadge.textContent = rows.length + (rows.length === 1 ? " model · " : " models · ") + totalQty + " pcs";
        }
      });
    }

    document.addEventListener("change", function (e) {
      var q = e.target.getAttribute && e.target.getAttribute("data-qty");
      if (q) { setQty(q, e.target.value); render(); }
    });
    document.addEventListener("click", function (e) {
      var rm = e.target.getAttribute && e.target.getAttribute("data-remove");
      if (rm) { removeItem(rm); render(); }
    });
    if (clearBtn) clearBtn.addEventListener("click", function () { writeCart([]); render(); });

    function buildSummary(bySlug) {
      var items = readCart();
      var lines = [];
      items.forEach(function (item) {
        var p = bySlug[item.s];
        if (!p) return;
        lines.push(p.k + " — " + p.n + " — qty " + item.q);
      });
      return { text: lines.join("\n"), lines: lines, items: items, count: items.length };
    }

    function toCsv() {
      return loadCatalog().then(function (catalog) {
        var bySlug = {};
        catalog.forEach(function (p) { bySlug[p.s] = p; });
        var rows = [["Model", "Product", "Category", "Material", "Quantity", "Pricing basis", "URL"]];
        readCart().forEach(function (item) {
          var p = bySlug[item.s];
          if (!p) return;
          rows.push([p.k, p.n, p.c, p.m, item.q, "Quotation per SKU", location.origin + p.u]);
        });
        return rows.map(function (r) {
          return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
        }).join("\r\n");
      });
    }

    if (csvBtn) {
      csvBtn.addEventListener("click", function () {
        toCsv().then(function (csv) {
          var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "byfboom-quote-list.csv";
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      });
    }

    if (form) {
      var salesEmail = form.getAttribute("data-sales-email") || "sales@byfboom.com";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var endpoint = form.getAttribute("data-endpoint") || "";
        var fd = new FormData(form);
        if (fd.get("_gotcha")) return;

        loadCatalog().then(function (catalog) {
          var bySlug = {};
          catalog.forEach(function (p) { bySlug[p.s] = p; });
          var summary = buildSummary(bySlug);
          if (!summary.count) {
            if (status) { status.className = "form-status err"; status.textContent = "Add at least one product to your quote list before sending."; }
            return;
          }
          var payload = {
            company: fd.get("company") || "",
            name: fd.get("name") || "",
            email: fd.get("email") || "",
            phone: fd.get("phone") || "",
            country: fd.get("country") || "",
            buyerType: fd.get("buyerType") || "",
            variantSplit: fd.get("variantSplit") || "",
            decoration: fd.get("decoration") || "",
            decorationNotes: fd.get("decorationNotes") || "",
            packaging: fd.get("packaging") || "",
            setContents: fd.get("setContents") || "",
            needs: fd.getAll("needs").join("; "),
            destinationPort: fd.get("destinationPort") || "",
            tradeBasis: fd.get("tradeBasis") || "",
            sample: fd.getAll("sample").join("; "),
            targetDate: fd.get("targetDate") || "",
            dateType: fd.get("dateType") || "",
            qcNotes: fd.get("qcNotes") || "",
            notes: fd.get("notes") || "",
            quoteList: summary.text,
            quotedItems: summary.count,
            pricingBasis: "Quotation per SKU",
            source: location.href
          };

          var mailtoFallback = function () {
            var body = [
              "Company: " + payload.company,
              "Contact: " + payload.name,
              "Email: " + payload.email,
              "Phone / WhatsApp: " + payload.phone,
              "Country: " + payload.country,
              "Buyer type: " + payload.buyerType,
              "",
              "Quantity split per model, colour or logo version: " + payload.variantSplit,
              "Decoration: " + payload.decoration + (payload.decorationNotes ? " (" + payload.decorationNotes + ")" : ""),
              "Packaging: " + payload.packaging,
              "Pieces per set / accessories: " + payload.setContents,
              "Requirements: " + payload.needs,
              "Destination port / city: " + payload.destinationPort,
              "Trade basis: " + payload.tradeBasis,
              "Sample should prove: " + payload.sample,
              "Target date: " + payload.targetDate + " (" + payload.dateType + ")",
              "QC / compliance: " + payload.qcNotes,
              "",
              "Quote list:",
              summary.text,
              "",
              "Pricing: quotation per SKU (no price is published on the website).",
              "",
              "Notes: " + payload.notes
            ].join("\n");
            var href = "mailto:" + salesEmail +
              "?subject=" + encodeURIComponent("Quote request — " + (payload.company || payload.name || "catalogue enquiry")) +
              "&body=" + encodeURIComponent(body);
            window.location.href = href;
            if (status) {
              status.className = "form-status ok";
              status.textContent = "Your email draft is open with the quote list attached as text. Send it and we will reply within one business day.";
            }
          };

          if (!endpoint) {
            mailtoFallback();
            return;
          }

          if (status) { status.className = "form-status"; status.textContent = "Sending…"; }
          var body = new FormData();
          Object.keys(payload).forEach(function (k) { body.append(k, payload[k]); });

          fetch(endpoint, { method: "POST", body: body, headers: { Accept: "application/json" } })
            .then(function (r) {
              if (!r.ok) throw new Error("bad status " + r.status);
              writeCart([]);
              render();
              form.reset();
              if (status) {
                status.className = "form-status ok";
                status.textContent = "Thank you — your quote request has been sent. We reply within one business day.";
              }
            })
            .catch(function () {
              mailtoFallback();
            });
        });
      });
    }

    render();
  }

  /* ---------- quote form: 3-step wizard (progressive enhancement) ---------- */
  function initQuoteSteps() {
    var form = $("#quote-form");
    if (!form) return;
    var steps = Array.prototype.slice.call(form.querySelectorAll(".qstep"));
    if (steps.length < 2) return;
    var navItems = Array.prototype.slice.call(document.querySelectorAll("#qsteps-nav li"));
    var backBtn = $("#qstep-back");
    var nextBtn = $("#qstep-next");
    var hint = $("#qstep-hint");
    var nextLabels = ["Next: Project details", "Next: Sample & timing", ""];
    var hints = [
      "Step 1 of 3 — contact details, about 30 seconds",
      "Step 2 of 3 — project details, all optional",
      "Step 3 of 3 — sample, timing and anything else"
    ];
    var current = 1;
    form.classList.add("qsteps-on");

    function show(n) {
      current = n;
      steps.forEach(function (el) {
        el.hidden = Number(el.getAttribute("data-step")) !== n;
      });
      navItems.forEach(function (li) {
        var v = Number(li.getAttribute("data-step"));
        li.classList.toggle("active", v === n);
        li.classList.toggle("done", v < n);
      });
      if (backBtn) backBtn.hidden = n === 1;
      if (nextBtn) {
        nextBtn.hidden = n === steps.length;
        nextBtn.textContent = nextLabels[n - 1];
      }
      if (hint) hint.textContent = hints[n - 1] || "";
    }

    function validateCurrent() {
      var el = form.querySelector('.qstep[data-step="' + current + '"]');
      if (!el) return true;
      var fields = el.querySelectorAll("input,select,textarea");
      for (var i = 0; i < fields.length; i++) {
        if (!fields[i].checkValidity()) {
          fields[i].reportValidity();
          return false;
        }
      }
      return true;
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!validateCurrent()) return;
        show(current + 1);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        show(current - 1);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    show(1);
  }

  /* ---------- global add-to-quote ---------- */
  function initAddButtons() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-add-quote]");
      if (!btn) return;
      e.preventDefault();
      var slug = btn.getAttribute("data-slug");
      addItem(slug, DEFAULT_QTY);
      var original = btn.textContent;
      btn.textContent = "Added to quote list";
      btn.disabled = true;
      setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 1600);
    });
  }

  function initDeepLinkAdd() {
    var slug = new URLSearchParams(location.search).get("add");
    if (!slug) return;
    addItem(slug, DEFAULT_QTY);
    var box = $("#quote-items");
    if (box) {
      setTimeout(function () { box.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200);
    }
  }

  /* ---------- floating RFQ widget ---------- */
  function initRfqFloat() {
    var box = $("#rfq-float");
    if (!box) return;
    var tab = $("#rfq-float-tab");
    var closeBtn = $("#rfq-float-close");
    var form = $("#rfq-float-form");
    var status = $("#rfq-float-status");
    var KEY = "rfqFloatState";

    function setState(state, persist) {
      box.setAttribute("data-state", state);
      if (tab) tab.setAttribute("aria-expanded", state === "open" ? "true" : "false");
      if (persist) {
        try { sessionStorage.setItem(KEY, state); } catch (e) {}
      }
    }
    var saved = null;
    try { saved = sessionStorage.getItem(KEY); } catch (e) {}
    setState(saved === "closed" ? "closed" : "open", false);

    if (tab) tab.addEventListener("click", function () { setState("open", true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setState("closed", true); });

    if (!form) return;
    var salesEmail = form.getAttribute("data-sales-email") || "sales@byfboom.com";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get("_gotcha")) return;
      var fields = ["name", "buyerType", "email"];
      for (var i = 0; i < fields.length; i++) {
        var el = form.elements[fields[i]];
        if (el && !el.checkValidity()) { el.reportValidity(); return; }
      }
      var payload = {
        name: fd.get("name") || "",
        buyerType: fd.get("buyerType") || "",
        email: fd.get("email") || "",
        company: "",
        quoteList: "",
        quotedItems: 0,
        pricingBasis: "Quotation per SKU",
        source: "Floating pricing widget — " + location.pathname,
        notes: ""
      };
      var finish = function () {
        if (status) { status.className = "form-status ok"; status.textContent = "Thank you — sent. We reply within one business day."; }
        form.reset();
        setTimeout(function () { setState("closed", true); if (status) { status.textContent = ""; status.className = "form-status"; } }, 2200);
      };
      var endpoint = form.getAttribute("data-endpoint") || "";
      if (!endpoint) {
        var body = "Name: " + payload.name + "\nBuyer type: " + payload.buyerType + "\nEmail: " + payload.email +
          "\n\nPage: " + payload.source + "\n\nThe visitor sent this quick enquiry from the floating widget. Reply to ask for the product list, quantities and destination.";
        window.location.href = "mailto:" + salesEmail +
          "?subject=" + encodeURIComponent("Quick pricing enquiry — " + (payload.name || "website visitor")) +
          "&body=" + encodeURIComponent(body);
        finish();
        return;
      }
      if (status) { status.className = "form-status"; status.textContent = "Sending…"; }
      var data = new FormData();
      Object.keys(payload).forEach(function (k) { data.append(k, payload[k]); });
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error("bad status " + r.status); finish(); })
        .catch(function () {
          window.location.href = "mailto:" + salesEmail +
            "?subject=" + encodeURIComponent("Quick pricing enquiry — " + (payload.name || "website visitor")) +
            "&body=" + encodeURIComponent("Name: " + payload.name + "\nBuyer type: " + payload.buyerType + "\nEmail: " + payload.email + "\n\nPage: " + payload.source);
        });
    });
  }

  /* Hot sellers rotator: pages of 4 cards, fade between, pause on hover. */
  function initHotRotator() {
    var rot = document.querySelector("[data-hot-rotator]");
    if (!rot) return;
    var cards = Array.prototype.slice.call(rot.querySelectorAll(".hot-card"));
    var hint = document.querySelector("[data-hot-hint]");
    if (cards.length <= 4) { if (hint) hint.hidden = true; return; }
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { if (hint) hint.hidden = true; return; }
    var PER = 4, i = 0, timer = null;
    function show(page) {
      cards.forEach(function (c, idx) {
        c.style.display = idx >= page * PER && idx < (page + 1) * PER ? "" : "none";
      });
      rot.classList.add("is-fading");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { rot.classList.remove("is-fading"); });
      });
    }
    function next() { i = (i + 1) % Math.ceil(cards.length / PER); show(i); }
    function play() { if (!timer) timer = setInterval(next, 4000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    show(0);
    if (hint) hint.hidden = false;
    var win = rot.closest(".hot-window");
    if (win) {
      win.addEventListener("mouseenter", stop);
      win.addEventListener("mouseleave", play);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else play();
    });
    play();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initProductFilter();
    initSearch();
    initQuotePage();
    initQuoteSteps();
    initRfqFloat();
    initAddButtons();
    initDeepLinkAdd();
    initHotRotator();
    updateBadges();
  });
})();
