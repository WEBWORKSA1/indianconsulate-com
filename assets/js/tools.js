/* IndianConsulate.com — interactive tools */
(function () {
  "use strict";
  var ROOT = document.body.getAttribute("data-root") || "";
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var val = function (form, name) { var c = form.querySelector('[name="' + name + '"]:checked'); return c ? c.value : (form.elements[name] ? form.elements[name].value : ""); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function cta(service, text) {
    return '<div class="tool-actions"><a class="btn btn-accent" href="' + ROOT + "get-help.html?service=" + service + '">' + (text || "Get a free expert checklist") + '</a><a class="btn btn-ghost" href="' + ROOT + 'tools/document-checklist.html?s=' + service + '">Build my document list</a></div>';
  }

  /* ---------- 1. Service finder ---------- */
  var sf = $("#serviceFinder");
  if (sf) sf.addEventListener("submit", function (e) {
    e.preventDefault();
    var who = val(sf, "who"), goal = val(sf, "goal"), out = $("#sfOut");
    if (!who || !goal) { out.innerHTML = '<p class="err">Please answer both questions.</p>'; return; }
    var R = [];
    if (goal === "travel") {
      if (who === "indian") R.push(["You don’t need a visa for India", "Indian citizens enter on a valid Indian passport. If yours expires within a year, renew it before you travel.", "services/passport.html", "passport"]);
      if (who === "origin") R.push(["Consider an OCI card", "As a foreign citizen of Indian origin you may qualify for lifelong, multiple-entry travel. New applicants now receive a digital e-OCI.", "services/oci.html", "oci"],
        ["Short on time? Use an e-Visa", "An OCI takes weeks. For a trip soon, an e-Visa is usually faster if your nationality is eligible.", "services/visa.html", "visa"]);
      if (who === "foreign") R.push(["Apply for an e-Visa or regular visa", "Check whether your nationality qualifies for e-Visa; otherwise apply through your Indian mission’s visa centre.", "services/visa.html", "visa"]);
      if (who === "oci") R.push(["Travel on your OCI + current passport", "Make sure your OCI record shows your current passport. Updates are free within three months of a new passport.", "services/oci.html", "oci"]);
      if (who === "origin" || who === "foreign" || who === "oci") R.push(["Complete the e-Arrival card", "India’s official e-Arrival card is submitted online shortly before arrival. It is free and is not a visa.", "services/visa.html", "visa"]);
    }
    if (goal === "renew") {
      if (who === "indian") R.push(["Renew / re-issue your Indian passport", "Apply via the global Passport Seva portal for Indian missions, then submit at your mission’s application centre.", "services/passport.html", "passport"]);
      else R.push(["You can’t renew an Indian passport", "Once you acquire foreign citizenship, Indian citizenship ends. Surrender the old passport and consider an OCI.", "services/renunciation.html", "surrender"]);
    }
    if (goal === "citizenship") {
      if (who === "indian") R.push(["Renunciation / surrender", "Renouncing before acquiring another citizenship and surrendering after acquiring it are different processes. Pick the right one.", "services/renunciation.html", "surrender"]);
      else R.push(["Surrender certificate, then OCI", "If you held an Indian passport, a surrender certificate is normally required before an OCI application.", "services/renunciation.html", "surrender"]);
    }
    if (goal === "docs") R.push(["Attestation or apostille", "Indian documents for use abroad are apostilled by MEA; foreign documents for use in India may need attestation.", "services/attestation.html", "attestation"],
      ["Police Clearance Certificate", "Needed for many work, residency and immigration applications.", "services/pcc.html", "pcc"]);
    if (goal === "emergency") R.push(["Emergency help", "Lost passport, urgent travel, a death abroad or a family emergency — act in this order.", "services/emergency.html", "emergency"]);
    if (goal === "nri") R.push(["NRI services from abroad", "Life certificates, PAN/Aadhaar guidance, birth registration and driving-licence verification.", "services/nri-services.html", "nri"]);
    if (!R.length) R.push(["Talk to a specialist", "Your combination is unusual. Describe it and we’ll point you to the exact process.", "get-help.html", "other"]);
    out.innerHTML = R.map(function (r) {
      return '<div class="result good"><h3>' + r[0] + "</h3><p>" + r[1] + '</p><div class="tool-actions"><a class="btn btn-primary" href="' + ROOT + r[2] + '">Open the guide</a><a class="btn btn-accent" href="' + ROOT + "get-help.html?service=" + r[3] + '">Get a free checklist</a></div></div>';
    }).join("");
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* ---------- 2. OCI eligibility ---------- */
  var oe = $("#ociElig");
  if (oe) oe.addEventListener("submit", function (e) {
    e.preventDefault();
    var a = {}; ["foreign", "root", "spouse", "pakbd", "military", "prevIndian"].forEach(function (k) { a[k] = val(oe, k); });
    var out = $("#oeOut"), cls = "good", title, body = [];
    if (Object.keys(a).some(function (k) { return !a[k]; })) { out.innerHTML = '<p class="err">Please answer every question.</p>'; return; }
    if (a.foreign === "no") { cls = "bad"; title = "OCI is only for foreign citizens"; body.push("An Indian citizen cannot hold an OCI. If you plan to acquire another citizenship, read about renunciation and surrender first."); }
    else if (a.pakbd === "yes") { cls = "bad"; title = "Likely not eligible"; body.push("Applicants who, or whose parents, grandparents or great-grandparents, are or were citizens of Pakistan or Bangladesh are generally excluded, as are others the Government notifies."); }
    else if (a.root === "no" && a.spouse === "no") { cls = "bad"; title = "No qualifying link found"; body.push("OCI eligibility needs Indian origin (you or an ancestor up to great-grandparent) or marriage of 2+ years to an Indian citizen or OCI cardholder."); }
    else {
      title = "You appear to be eligible"; body.push(a.root === "yes" ? "Your Indian-origin link is a qualifying ground." : "Your spousal link is a qualifying ground — the marriage must be registered and have lasted at least two years, and spouse-based OCIs undergo security clearance.");
    }
    if (cls !== "bad" && a.military === "yes") { cls = "mid"; title = "Possibly eligible — extra scrutiny"; body.push("Foreign military personnel (serving or retired) face restrictions. Check your mission’s current guidance before applying."); }
    if (cls !== "bad" && a.prevIndian === "yes") body.push("Because you held an Indian passport, you will normally need a <a href=\"" + ROOT + "services/renunciation.html\">surrender certificate</a> before or with the OCI application.");
    if (cls !== "bad") body.push("New applicants now receive a digital e-OCI. Applications are filed online at ociservices.gov.in, followed by your mission’s centre process.");
    out.innerHTML = '<div class="result ' + cls + '"><h3>' + title + "</h3>" + body.map(function (b) { return "<p>" + b + "</p>"; }).join("") +
      '<p class="small muted">This is an informal screening, not a legal determination. Final decisions rest with the Government of India.</p>' + cta("oci", "Get my OCI checklist reviewed") + "</div>";
  });

  /* ---------- 3. Document checklist ---------- */
  var DOCS = {
    "oci": { t: "OCI — fresh application (adult)", d: ["Online application printout from ociservices.gov.in (signed where indicated)", "Current foreign passport (original + copy)", "Proof of Indian origin: your / parent’s / grandparent’s old Indian passport, birth certificate or other accepted proof", "Surrender certificate (if you previously held an Indian passport)", "Recent square photo meeting OCI specifications", "Signature image for upload", "Proof of current address in your country of residence", "Name-change evidence if names differ across documents (marriage certificate, deed poll, court order)", "Fee payment receipt from the application centre"] },
    "oci-minor": { t: "OCI — minor child", d: ["Online application printout signed by both parents", "Child’s current foreign passport", "Child’s birth certificate showing both parents", "Parents’ passports / OCI cards / proof of Indian origin", "Parental authorisation / consent form signed by both parents", "Parents’ marriage certificate (or custody order, if applicable)", "Surrender certificate if the child ever held an Indian passport", "Recent square photo of the child", "Proof of address"] },
    "oci-update": { t: "OCI — new passport update", d: ["New foreign passport (copy)", "Old passport details", "Existing OCI number / card", "Recent photo and signature image", "Update filed on ociservices.gov.in within 3 months of the new passport (free); later updates attract a late fee"] },
    "passport": { t: "Indian passport — renewal / re-issue abroad", d: ["Online application from the Passport Seva portal for Indian missions (printout)", "Current Indian passport (original + copies of first/last pages and observation pages)", "Proof of legal status / residence in your country (visa, residence permit, PR card)", "Proof of local address (utility bill, lease, bank statement)", "Recent photographs to mission specifications", "Name or address change documents, if applicable", "Application centre form and fee receipt", "Self-addressed prepaid return envelope / courier label where required"] },
    "passport-minor": { t: "Indian passport — minor", d: ["Online application signed by both parents", "Birth certificate", "Both parents’ passports and status documents", "Parental consent declaration (Annexure) signed by both parents", "Child’s photographs", "Declaration that the child does not hold a foreign passport (2026 rules prohibit minors holding both)"] },
    "surrender": { t: "Surrender / renunciation certificate", d: ["Online application from the Indian mission portal", "Last held Indian passport (original — it will be cancelled)", "Current foreign passport", "Naturalisation / citizenship certificate showing the date foreign citizenship was acquired", "Proof of address", "Photographs", "Fee + any penalty if the Indian passport was used after acquiring foreign citizenship"] },
    "pcc": { t: "Police Clearance Certificate (PCC)", d: ["Online PCC application via Passport Seva for Indian missions", "Current Indian passport (original + copy)", "Proof of local address and legal status", "Photographs", "Purpose letter (employer / immigration authority), if available", "Fee receipt"] },
    "visa": { t: "Indian e-Visa", d: ["Passport valid for at least 6 months from arrival with 2 blank pages", "Digital photo with plain light background (square)", "Scan of passport bio page", "Category documents: business card / invitation (e-Business), hospital letter (e-Medical), conference invitation & clearances (e-Conference)", "Return or onward ticket details", "Card for the government fee — pay only on indianvisaonline.gov.in", "Complete the free e-Arrival card online before arrival"] },
    "emergency": { t: "Emergency Certificate / lost passport", d: ["Police report for the lost or stolen passport", "Copy of the lost passport, if available (or passport number and issue details)", "Any identity proof: Aadhaar, driving licence, voter ID, PAN", "Travel ticket / proof of urgent travel", "Photographs", "Local status document (visa / residence permit) or its copy"] },
    "attestation": { t: "Document attestation / apostille", d: ["Original document to be attested", "Photocopies of the document", "Applicant’s passport copy (and visa / residence page)", "Authorisation letter if someone submits on your behalf", "Translation into English by an approved translator, if the document is in another language", "Prior state-level or notarial verification where required"] }
  };
  var dc = $("#docForm");
  if (dc) {
    var sel = dc.elements["svc"], outD = $("#docOut");
    Object.keys(DOCS).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = DOCS[k].t; sel.appendChild(o); });
    var pre = new URLSearchParams(location.search).get("s"); if (pre && DOCS[pre]) sel.value = pre;
    var render = function () {
      var k = sel.value, D = DOCS[k], extra = [];
      if (!D) { outD.innerHTML = ""; return; }
      if (dc.elements["namechg"].checked) extra.push("Name-change proof linking every version of your name (marriage certificate, deed poll, gazette notification or court order)");
      if (dc.elements["lostold"].checked) extra.push("Police report or affidavit for the lost/old document, plus any copy you have");
      if (dc.elements["proxy"].checked) extra.push("Authorisation letter and the representative’s ID");
      if (dc.elements["translate"].checked) extra.push("Certified English translations of non-English documents");
      var saved = {}; try { saved = JSON.parse(localStorage.getItem("ic-check-" + k) || "{}"); } catch (e) {}
      var items = D.d.concat(extra);
      outD.innerHTML = '<div class="result"><h3>' + esc(D.t) + ' — your checklist</h3><ul class="checklist">' + items.map(function (it, i) {
        return '<li><input type="checkbox" id="ck' + i + '" data-i="' + i + '"' + (saved[i] ? " checked" : "") + '><label for="ck' + i + '">' + esc(it) + "</label></li>";
      }).join("") + '</ul><p class="small muted" id="ckProg"></p><p class="small muted">Typical requirements compiled from mission checklists. Requirements vary by country and change frequently — confirm with your mission before submitting.</p>' +
        '<div class="tool-actions no-print"><button class="btn btn-primary" type="button" id="ckPrint">Print / save PDF</button><button class="btn btn-ghost" type="button" id="ckCopy">Copy list</button><a class="btn btn-accent" href="' + ROOT + "get-help.html?service=" + k.split("-")[0] + '">Have an expert check my documents</a></div></div>';
      var prog = function () { var n = $$(".checklist input:checked", outD).length; $("#ckProg").textContent = n + " of " + items.length + " ready" + (n === items.length ? " — you’re set! ✓" : ""); };
      $$(".checklist input", outD).forEach(function (c) {
        c.addEventListener("change", function () { saved[c.getAttribute("data-i")] = c.checked; try { localStorage.setItem("ic-check-" + k, JSON.stringify(saved)); } catch (e) {} prog(); });
      });
      prog();
      $("#ckPrint").onclick = function () { window.print(); };
      $("#ckCopy").onclick = function () { navigator.clipboard && navigator.clipboard.writeText(D.t + "\n- " + items.join("\n- ")).then(function () { $("#ckCopy").textContent = "Copied ✓"; }); };
    };
    dc.addEventListener("change", render); render();
  }

  /* ---------- 4. Photo checker ---------- */
  var PRESETS = {
    oci: { t: "OCI online upload", min: 200, max: 1500, kb: 500, square: true, fmt: /jpe?g/ },
    evisa: { t: "Indian e-Visa upload", min: 350, max: 4000, kb: 1024, minkb: 10, square: true, fmt: /jpe?g/ },
    print: { t: "Printed 2×2 in (51×51 mm) at 300 dpi", min: 600, max: 6000, kb: 10240, square: true, fmt: /jpe?g|png/ }
  };
  var pf = $("#photoForm");
  if (pf) pf.addEventListener("change", function () {
    var file = pf.elements["photo"].files[0], P = PRESETS[val(pf, "preset") || "oci"], out = $("#photoOut");
    if (!file) return;
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight, kb = file.size / 1024, rows = [], pass = 0, total = 0;
      var row = function (ok, txt, warn) { total++; if (ok) pass++; rows.push('<div class="meter"><i class="' + (ok ? "g" : warn ? "y" : "r") + '"></i>' + txt + "</div>"); };
      row(P.fmt.test(file.type), "Format: " + (file.type || "unknown") + (P.fmt.test(file.type) ? "" : " — convert to JPEG"));
      row(!P.square || Math.abs(w - h) <= Math.max(2, w * 0.01), "Shape: " + w + " × " + h + " px " + (Math.abs(w - h) <= Math.max(2, w * 0.01) ? "(square ✓)" : "— must be square (equal width and height)"));
      row(w >= P.min && w <= P.max, "Dimensions within " + P.min + "–" + P.max + " px");
      row(kb <= P.kb && kb >= (P.minkb || 0), "File size: " + kb.toFixed(0) + " KB (allowed " + (P.minkb || 0) + "–" + P.kb + " KB)");
      /* background estimate: sample the outer border */
      var cv = document.createElement("canvas"), s = 120; cv.width = s; cv.height = s; var cx = cv.getContext("2d"); cx.drawImage(img, 0, 0, s, s);
      var d = cx.getImageData(0, 0, s, s).data, sum = 0, sat = 0, n = 0;
      for (var y = 0; y < s; y++) for (var x = 0; x < s; x++) {
        if (x > 8 && x < s - 8 && y > 8) continue;
        var i = (y * s + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        sum += (0.299 * r + 0.587 * g + 0.114 * b); sat += mx ? (mx - mn) / mx : 0; n++;
      }
      var lum = sum / n, sv = sat / n, bgOk = lum > 200 && sv < 0.12;
      row(bgOk, "Background: " + (bgOk ? "plain and light ✓" : lum > 170 ? "slightly dark or tinted — use a plain white/off-white wall" : "too dark or busy — retake against a plain white background"), lum > 170);
      out.innerHTML = '<div class="result ' + (pass === total ? "good" : pass >= total - 1 ? "mid" : "bad") + '"><h3>' + P.t + ": " + pass + "/" + total + " checks passed</h3>" + rows.join("") +
        '<img class="photo-preview" alt="Your uploaded photo" src="' + url + '">' +
        '<p class="small muted">Your photo never leaves your device — all checks run in your browser. Also confirm: face centred and covering about 70–80% of height, neutral expression, eyes open, no glasses glare, no shadows, no headwear except for religious reasons.</p></div>';
    };
    img.src = url;
  });

  /* ---------- 5. Passport & trip planner ---------- */
  var tp = $("#tripForm");
  if (tp) tp.addEventListener("submit", function (e) {
    e.preventDefault();
    var exp = new Date(tp.elements["expiry"].value), dep = new Date(tp.elements["depart"].value), len = parseInt(tp.elements["days"].value || "14", 10), svc = val(tp, "need"), out = $("#tripOut");
    if (isNaN(exp) || isNaN(dep)) { out.innerHTML = '<p class="err">Please enter both dates.</p>'; return; }
    var day = 864e5, ret = new Date(dep.getTime() + len * day), today = new Date();
    var monthsLeftAtArrival = (exp - dep) / (day * 30.44), monthsLeftNow = (exp - today) / (day * 30.44);
    var lead = { none: 0, evisa: 14, oci: 84, passport: 56, surrender: 70, pcc: 35 }[svc] || 0;
    var startBy = new Date(dep.getTime() - lead * day), items = [], cls = "good";
    if (exp < ret) { cls = "bad"; items.push("<strong>Your passport expires before you return.</strong> Renew before travelling."); }
    else if (monthsLeftAtArrival < 6) { cls = "mid"; items.push("Your passport has under 6 months’ validity on arrival (" + monthsLeftAtArrival.toFixed(1) + " months). India’s e-Visa and many airlines require 6 months."); }
    else items.push("Passport validity on arrival: " + monthsLeftAtArrival.toFixed(1) + " months ✓");
    if (monthsLeftNow <= 12) items.push("Your passport expires within 12 months — you can usually apply for renewal now.");
    if (lead) {
      var late = startBy < today;
      if (late) cls = cls === "good" ? "mid" : cls;
      items.push((late ? "<strong>You’re behind schedule.</strong> " : "") + "Recommended latest start for your " + tp.querySelector('[name="need"]:checked').parentNode.textContent.trim() + ": <strong>" + startBy.toDateString() + "</strong> (" + lead / 7 + "-week planning buffer)." + (late ? " Consider urgent options or a faster route — ask a specialist." : ""));
    }
    var ics = function () {
      var f = function (d) { return d.toISOString().slice(0, 10).replace(/-/g, ""); };
      var ev = [["Start consular application (IndianConsulate.com planner)", startBy], ["Trip departure", dep], ["Passport expiry", exp]];
      if (monthsLeftNow > 12) ev.push(["Passport renewal window opens", new Date(exp.getTime() - 365 * day)]);
      return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//IndianConsulate.com//Planner//EN\r\n" + ev.filter(function (x) { return x[1] > today; }).map(function (x, i) {
        return "BEGIN:VEVENT\r\nUID:ic-" + Date.now() + "-" + i + "@indianconsulate.com\r\nDTSTAMP:" + f(today) + "T000000Z\r\nDTSTART;VALUE=DATE:" + f(x[1]) + "\r\nSUMMARY:" + x[0] + "\r\nBEGIN:VALARM\r\nTRIGGER:-P7D\r\nACTION:DISPLAY\r\nDESCRIPTION:" + x[0] + "\r\nEND:VALARM\r\nEND:VEVENT\r\n";
      }).join("") + "END:VCALENDAR\r\n";
    };
    out.innerHTML = '<div class="result ' + cls + '"><h3>Your plan</h3>' + items.map(function (i) { return "<p>" + i + "</p>"; }).join("") +
      '<div class="tool-actions"><button class="btn btn-primary" type="button" id="icsBtn">Add reminders to my calendar (.ics)</button><a class="btn btn-accent" href="' + ROOT + "get-help.html?service=" + (svc === "none" ? "passport" : svc) + '">Get help meeting this deadline</a></div>' +
      '<p class="small muted">Buffers are conservative planning estimates, not official processing times.</p></div>';
    $("#icsBtn").onclick = function () {
      var b = new Blob([ics()], { type: "text/calendar" }), a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = "consular-plan.ics"; document.body.appendChild(a); a.click(); a.remove();
    };
  });
})();
