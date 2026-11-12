/* IndianConsulate.com — core UI (no dependencies) */
(function () {
  "use strict";
  var C = window.IC_CONFIG || {};
  var ROOT = document.body.getAttribute("data-root") || "";
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var store = {
    get: function (k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };

  /* relay address, assembled only at runtime */
  function relay() {
    try { return atob(C.relay || "").split("").reverse().join(""); } catch (e) { return ""; }
  }

  /* year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* theme */
  var themeBtn = $("#themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = document.documentElement.dataset.theme;
    if (!cur) cur = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next; store.set("ic-theme", next);
  });
  if (!document.documentElement.dataset.theme && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.dataset.theme = "dark";
  }

  /* menu */
  var menuBtn = $("#menuBtn"), nav = $("#mainnav");
  if (menuBtn && nav) menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", open);
  });

  /* search */
  var sBtn = $("#searchBtn"), sPanel = $("#searchPanel"), sInput = $("#siteSearch"), sRes = $("#searchResults"), index = null;
  function loadIndex(cb) {
    if (index) return cb(index);
    fetch(ROOT + "assets/data/search-index.json").then(function (r) { return r.json(); }).then(function (d) { index = d; cb(d); }).catch(function () { cb([]); });
  }
  function runSearch(q, out) {
    q = (q || "").toLowerCase().trim();
    if (q.length < 2) { out.innerHTML = ""; return; }
    loadIndex(function (d) {
      var terms = q.split(/\s+/);
      var hits = d.map(function (p) {
        var hay = (p.t + " " + p.d + " " + p.k).toLowerCase(), score = 0;
        terms.forEach(function (t) { if (hay.indexOf(t) > -1) score += 1; if (p.t.toLowerCase().indexOf(t) > -1) score += 2; });
        return { p: p, s: score };
      }).filter(function (x) { return x.s >= terms.length; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 8);
      out.innerHTML = hits.length ? hits.map(function (h) {
        return '<li><a href="' + ROOT + h.p.u + '"><strong>' + esc(h.p.t) + '</strong><span class="small muted">' + esc(h.p.d) + "</span></a></li>";
      }).join("") : '<li class="muted small" style="padding:10px 12px">No matches. Try “OCI”, “passport”, “visa” or “apostille”.</li>';
    });
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  if (sBtn) sBtn.addEventListener("click", function () {
    var open = sPanel.hidden; sPanel.hidden = !open; sBtn.setAttribute("aria-expanded", open);
    if (open) { sInput.focus(); loadIndex(function () {}); }
  });
  if (sInput) sInput.addEventListener("input", function () { runSearch(sInput.value, sRes); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && sPanel && sPanel.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); sBtn.click(); }
    if (e.key === "Escape" && sPanel && !sPanel.hidden) { sPanel.hidden = true; sBtn.setAttribute("aria-expanded", false); }
  });
  var pageQ = $("#pageSearch"), pageRes = $("#pageResults");
  if (pageQ) {
    var q0 = new URLSearchParams(location.search).get("q") || "";
    pageQ.value = q0; runSearch(q0, pageRes);
    pageQ.addEventListener("input", function () { runSearch(pageQ.value, pageRes); });
  }

  /* cookie consent */
  var ck = $("#cookie");
  if (ck && !store.get("ic-consent")) {
    ck.hidden = false;
    $$("[data-consent]", ck).forEach(function (b) {
      b.addEventListener("click", function () {
        store.set("ic-consent", b.getAttribute("data-consent")); ck.hidden = true;
        if (b.getAttribute("data-consent") === "essential") { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }
      });
    });
  }
  if (store.get("ic-consent") === "essential") { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }

  /* attribution capture (first touch) */
  (function () {
    if (store.get("ic-src", true)) return;
    var p = new URLSearchParams(location.search), src = {
      landing: location.pathname, referrer: document.referrer || "direct",
      utm: ["utm_source", "utm_medium", "utm_campaign"].map(function (k) { return p.get(k) || ""; }).join("|")
    };
    store.set("ic-src", JSON.stringify(src), true);
  })();

  /* hidden mail links */
  $$("[data-mail]").forEach(function (a) {
    function set() { a.href = "mailto:" + relay() + "?subject=" + encodeURIComponent(a.getAttribute("data-mail") || "Enquiry via IndianConsulate.com"); }
    a.addEventListener("mouseenter", set); a.addEventListener("focus", set); a.addEventListener("click", set);
  });

  /* ---------------- forms ---------------- */
  var LABELS = { lead: "Lead", contact: "Contact", pledge: "Donation pledge", contest: "Contest entry", career: "Job application",
    partner: "Partnership / advertising enquiry", newsletter: "Newsletter signup", correction: "Correction" };

  function fieldError(input, msg) {
    var box = input.closest(".field") || input.parentNode, e = box.querySelector(".err");
    if (!e) { e = document.createElement("div"); e.className = "err"; e.setAttribute("role", "alert"); box.appendChild(e); }
    e.textContent = msg || ""; input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function validate(scope) {
    var ok = true, first = null;
    $$("input,select,textarea", scope).forEach(function (i) {
      if (i.type === "hidden" || i.closest(".hp")) return;
      var msg = "";
      if (i.type === "radio") {
        if (i.required && !scope.querySelector('input[name="' + i.name + '"]:checked')) msg = "Please choose one option.";
        if (i !== scope.querySelector('input[name="' + i.name + '"]')) return;
      } else if (!i.checkValidity()) {
        msg = i.validity.valueMissing ? (i.type === "checkbox" ? "Please tick this box to continue." : "This field is required.")
          : i.validity.typeMismatch ? "Please enter a valid " + (i.type === "email" ? "email address." : "value.") : i.validationMessage;
      }
      fieldError(i, msg);
      if (msg) { ok = false; if (!first) first = i; }
    });
    if (first) first.focus();
    return ok;
  }

  function leadScore(form) {
    var s = 0, u = form.querySelector('[name="urgency"]:checked');
    if (u) s += { "Under 2 weeks": 40, "2–6 weeks": 25, "6+ weeks": 10, "Just researching": 0 }[u.value] || 0;
    if (form.elements["phone"] && form.elements["phone"].value) s += 15;
    var n = parseInt((form.elements["applicants"] || {}).value || "1", 10); if (n > 1) s += 10;
    var sv = form.querySelector('[name="service"]:checked'); if (sv && /OCI|Passport|Surrender/.test(sv.value)) s += 15;
    if (form.elements["message"] && form.elements["message"].value.length > 40) s += 10;
    return Math.min(100, s + 10);
  }

  function submitForm(form) {
    var type = form.getAttribute("data-form"), fd = new FormData(form), to = relay();
    if (fd.get("_honey")) return;
    var svc = fd.get("service") || fd.get("topic") || fd.get("role") || "";
    fd.set("_subject", "[IndianConsulate.com] " + (LABELS[type] || "Form") + (svc ? " — " + svc : ""));
    fd.set("_template", "table"); fd.set("_captcha", "false");
    fd.set("form_type", LABELS[type] || type); fd.set("page", location.href);
    try { var src = JSON.parse(store.get("ic-src", true) || "{}"); fd.set("first_landing", src.landing || ""); fd.set("referrer", src.referrer || ""); fd.set("utm", src.utm || ""); } catch (e) {}
    if (type === "lead") fd.set("lead_score", leadScore(form) + "/100");
    var btn = form.querySelector('[type="submit"]'), status = form.querySelector(".form-status");
    if (!status) { status = document.createElement("p"); status.className = "form-status"; status.setAttribute("aria-live", "polite"); form.appendChild(status); }
    if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
    var thanks = ROOT + "thank-you.html?f=" + encodeURIComponent(type);
    fetch("https://formsubmit.co/ajax/" + to, { method: "POST", headers: { Accept: "application/json" }, body: fd })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function () {
        if (type === "newsletter") { status.textContent = "You’re subscribed — thank you!"; status.style.color = "var(--ok)"; form.reset(); if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; } return; }
        location.href = thanks;
      })
      .catch(function () {
        /* fallback: classic POST */
        form.setAttribute("action", "https://formsubmit.co/" + to); form.setAttribute("method", "POST");
        var add = function (n, v) { var h = document.createElement("input"); h.type = "hidden"; h.name = n; h.value = v; form.appendChild(h); };
        add("_next", new URL(thanks, location.href).href);
        fd.forEach(function (v, k) { if (!form.elements[k]) add(k, v); });
        HTMLFormElement.prototype.submit.call(form);
      });
  }

  $$("form[data-form]").forEach(function (form) {
    form.setAttribute("novalidate", "");
    if (!form.querySelector('[name="_honey"]')) {
      var hp = document.createElement("div"); hp.className = "hp"; hp.setAttribute("aria-hidden", "true");
      hp.innerHTML = '<label>Leave empty<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label>'; form.appendChild(hp);
    }
    var steps = $$(".form-step", form);
    if (steps.length) {
      var cur = 0, bar = form.querySelector(".progress i"), lbl = form.querySelector(".step-label");
      var show = function (i) {
        steps.forEach(function (s, k) { s.hidden = k !== i; });
        cur = i; if (bar) bar.style.width = ((i + 1) / steps.length * 100) + "%";
        if (lbl) lbl.textContent = "Step " + (i + 1) + " of " + steps.length + " — " + (steps[i].getAttribute("data-title") || "");
        var h = steps[i].querySelector("legend, h3"); if (h && i > 0) { h.setAttribute("tabindex", "-1"); h.focus(); }
      };
      $$("[data-next]", form).forEach(function (b) { b.addEventListener("click", function () { if (validate(steps[cur])) show(cur + 1); }); });
      $$("[data-back]", form).forEach(function (b) { b.addEventListener("click", function () { show(cur - 1); }); });
      /* auto-advance on choosing a service card */
      $$('input[type="radio"]', steps[0]).forEach(function (r) { r.addEventListener("change", function () { setTimeout(function () { if (cur === 0) show(1); }, 220); }); });
      var pre = new URLSearchParams(location.search).get("service");
      show(0);
      if (pre) { var m = form.querySelector('input[name="service"][data-key="' + pre + '"]'); if (m) { m.checked = true; show(1); } }
    }
    var topic = new URLSearchParams(location.search).get("topic");
    if (topic && form.elements["topic"]) { form.elements["topic"].value = topic; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(steps.length ? steps[steps.length - 1] : form)) return;
      submitForm(form);
    });
  });

  /* thank-you personalisation */
  var ty = $("#tyMsg");
  if (ty) {
    var f = new URLSearchParams(location.search).get("f");
    var msgs = { lead: "Your request is in. A specialist will reply within " + (C.replyTime || "1 business day") + ". Check your spam folder if you don’t see it.",
      pledge: "Thank you for pledging support! We’ll email you a secure payment link shortly.", contest: "Your contest entry is received. Winners are announced in the first week of next month.",
      career: "Thanks for applying. If your profile fits an open brief, we’ll be in touch within two weeks.", partner: "Thanks — our partnerships desk will reply with a media kit and rates." };
    if (msgs[f]) ty.textContent = msgs[f];
  }

  /* share */
  $$("[data-share]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = { title: document.title, url: location.href };
      if (navigator.share) navigator.share(d).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { b.textContent = "Link copied!"; });
    });
  });

  /* slide-in CTA on long reads */
  var slide = $("#slideCta");
  if (slide && !store.get("ic-slide", true)) {
    var shown = false;
    window.addEventListener("scroll", function () {
      if (shown) return;
      var p = (window.scrollY + innerHeight) / document.documentElement.scrollHeight;
      if (p > 0.55) { shown = true; slide.hidden = false; }
    }, { passive: true });
    slide.querySelector(".slide-x").addEventListener("click", function () { slide.hidden = true; store.set("ic-slide", "1", true); });
  }

  /* directory filter */
  var dq = $("#dirq"), dr = $("#dirr"), dt = $("#dirtable"), dc = $("#dircount");
  if (dt) {
    var rows = $$("tbody tr", dt);
    var filter = function () {
      var q = (dq.value || "").toLowerCase().trim(), r = dr.value, n = 0;
      rows.forEach(function (tr) {
        var ok = (!q || tr.getAttribute("data-q").indexOf(q) > -1) && (!r || tr.getAttribute("data-region") === r);
        tr.hidden = !ok; if (ok) n++;
      });
      dc.textContent = n + " of " + rows.length + " missions shown";
    };
    dq.addEventListener("input", filter); dr.addEventListener("change", filter);
    var q1 = new URLSearchParams(location.search).get("country"); if (q1) dq.value = q1;
    filter();
  }

  /* lite YouTube */
  $$(".yt-lite").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + b.getAttribute("data-yt") + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label"); f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"; f.allowFullscreen = true;
      b.replaceWith(f);
    });
  });

  /* month-end countdown */
  $$("[data-countdown]").forEach(function (el) {
    function tick() {
      var now = new Date(), end = new Date(now.getFullYear(), now.getMonth() + 1, 1) - 1000, d = Math.max(0, end - now);
      var parts = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
      el.innerHTML = ["Days", "Hours", "Mins", "Secs"].map(function (l, i) { return "<div><b>" + parts[i] + "</b><span>" + l + "</span></div>"; }).join("");
    }
    tick(); setInterval(tick, 1000);
  });
  $$("[data-month]").forEach(function (el) { el.textContent = new Date().toLocaleString("en", { month: "long", year: "numeric" }); });
  var prizes = $$("[data-prize]");
  prizes.forEach(function (el) { var i = +el.getAttribute("data-prize"); if (C.prizes && C.prizes[i]) el.textContent = C.prizes[i]; });

  /* tip of the day (rotates daily, self-updating) */
  var TIPS = [
    "Book your appointment only on the official mission site or its named service provider — never through a link in an unsolicited message.",
    "Indian government portals end in .gov.in. Fake “e-visa” sites often look official but charge several times the fee.",
    "Got a new foreign passport? Update your OCI record within three months to avoid a late fee.",
    "Scan every document as a separate, clearly named PDF before you start an online form — it halves the time it takes.",
    "Self-attest copies (sign and date them) unless the checklist says otherwise.",
    "Check your mission’s holiday list before booking — consulates close for both Indian and local holidays.",
    "Keep a copy of every receipt and your application reference number until the process is fully closed.",
    "Name mismatches across documents are the #1 cause of delays. Fix them before you apply.",
    "A surrender certificate is usually required before an OCI if you held an Indian passport and later took foreign citizenship.",
    "Travelling soon? Renew your passport early — many countries require 6 months’ validity on arrival."
  ];
  $$("[data-tip]").forEach(function (el) { var d = Math.floor(Date.now() / 864e5); el.textContent = TIPS[d % TIPS.length]; });

  /* home quick finder */
  var fopts = $$(".finder-opts button"), fout = $("#finderOut");
  var FIND = {
    visit: ["Visiting India as a foreign national?", "Most travellers need an e-Visa or a regular visa — or an OCI if you are of Indian origin.", "services/visa.html", "visa"],
    citizen: ["Took another citizenship?", "You usually need a surrender certificate first, then an OCI for lifelong visa-free travel.", "services/renunciation.html", "surrender"],
    renew: ["Indian passport expiring abroad?", "Apply through the global Passport Seva portal and your mission’s application centre.", "services/passport.html", "passport"],
    oci: ["Want an OCI card?", "Check eligibility, the 2026 digital e-OCI rules and the document list.", "services/oci.html", "oci"],
    docs: ["Need documents accepted abroad?", "Indian documents use the MEA apostille; foreign documents may need mission attestation.", "services/attestation.html", "attestation"],
    lost: ["Lost passport or emergency?", "File a police report, contact the nearest mission and ask about an Emergency Certificate.", "services/emergency.html", "emergency"]
  };
  fopts.forEach(function (b) {
    b.addEventListener("click", function () {
      fopts.forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
      var f = FIND[b.getAttribute("data-k")];
      fout.innerHTML = "<strong>" + f[0] + "</strong> " + f[1] + '<div class="tool-actions"><a class="btn btn-primary" href="' + ROOT + f[2] + '">Read the guide</a><a class="btn btn-accent" href="' + ROOT + "get-help.html?service=" + f[3] + '">Get a free checklist</a></div>';
    });
  });

  /* donations */
  var pay = C.payments || {}, anyPay = Object.keys(pay).some(function (k) { return pay[k]; });
  $$("[data-amount]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      var amt = b.getAttribute("data-amount");
      var url = pay.stripe || pay.paypal || pay.buymeacoffee || pay.razorpay;
      if (url) { b.href = pay.paypal && !pay.stripe ? pay.paypal.replace(/\/$/, "") + "/" + amt : url; b.target = "_blank"; b.rel = "noopener"; return; }
      e.preventDefault();
      var f = $("#pledgeForm"); if (f) { f.elements["amount"].value = amt; f.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { f.elements["name"].focus(); }, 500); }
    });
  });
  var pm = $("#payMethods");
  if (pm) {
    var names = { paypal: "PayPal", stripe: "Card (Stripe)", buymeacoffee: "Buy Me a Coffee", razorpay: "Razorpay (India)", upi: "UPI" };
    pm.innerHTML = anyPay ? Object.keys(pay).filter(function (k) { return pay[k]; }).map(function (k) {
      return '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + esc(pay[k]) + '">' + names[k] + "</a>";
    }).join(" ") : '<p class="muted small">Instant checkout is being set up. Use the pledge form below and we’ll email you a secure payment link — no card details are ever collected on this site.</p>';
  }
})();
