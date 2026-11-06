(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // year
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  // mobile menu
  var toggle = $(".nav-toggle"), nav = $(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  // toast
  var toast = document.createElement("div"); toast.className = "toast"; toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  var tt;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  // cart (saved in localStorage)
  var count = 0;
  try { count = parseInt(localStorage.getItem("orgoCart") || "0", 10) || 0; } catch (e) {}
  var badge = $("#cartCount");
  function renderCart() { if (badge) badge.textContent = count; }
  renderCart();
  $$(".add-cart").forEach(function (b) {
    b.addEventListener("click", function () {
      count++; renderCart();
      try { localStorage.setItem("orgoCart", count); } catch (e) {}
      showToast(b.dataset.name + " added to cart");
    });
  });

  // product filter + search
  var cards = $$(".product-card"), filter = "all", term = "";
  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (filter === "all" || c.dataset.cat === filter) && c.dataset.name.indexOf(term) !== -1;
      c.hidden = !ok; if (ok) shown++;
    });
    var empty = $("#emptyMsg"); if (empty) empty.hidden = shown !== 0;
  }
  if ($("#productGrid")) {
    $$(".filter").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".filter").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active"); filter = b.dataset.filter; apply();
      });
    });
    var s = $("#productSearch");
    if (s) s.addEventListener("input", function () { term = s.value.trim().toLowerCase(); apply(); });
  }

  // counters
  var counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseInt(el.dataset.count, 10), n = 0, step = Math.max(1, Math.ceil(end / 50));
        var t = setInterval(function () {
          n = Math.min(end, n + step); el.textContent = n + "+";
          if (n >= end) clearInterval(t);
        }, 28);
        io.unobserve(el);
      });
    }, { threshold: .4 });
    counters.forEach(function (c) { io.observe(c); });
  }

  // forms (front-end validation only - connect to a backend to actually send)
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function handle(form, okMsg) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $(".form-msg", form), bad = false;
      $$("[required]", form).forEach(function (f) {
        if (!f.value.trim() || (f.type === "email" && !validEmail(f.value.trim()))) bad = true;
      });
      msg.className = "form-msg " + (bad ? "err" : "ok");
      msg.textContent = bad ? "Please fill in all required fields with valid information." : okMsg;
      if (!bad) form.reset();
    });
  }
  var cf = $("#contactForm"); if (cf) handle(cf, "Thank you! Your message has been received.");
  var nl = $(".newsletter"); if (nl) handle(nl, "Thanks for subscribing!");
})();
