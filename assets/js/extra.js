/* IndianConsulate.com — article table of contents + live news enhancement */
(function () {
  "use strict";
  /* Table of contents for guides: ids on h2s, list in the sidebar */
  var toc = document.getElementById("toc");
  var heads = Array.prototype.slice.call(document.querySelectorAll(".prose h2"));
  if (toc && heads.length >= 3) {
    var ol = toc.querySelector("ol"), used = {};
    heads.forEach(function (h) {
      var text = h.textContent.trim();
      var id = h.id || text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
      while (used[id]) id += "-x"; used[id] = 1; h.id = id;
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + id; a.textContent = text.replace(/^\d+\.\s*/, "");
      li.appendChild(a); ol.appendChild(li);
    });
    toc.hidden = false;
  }

  /* Live headlines on the News page (progressive enhancement; the static list is refreshed by the daily job) */
  var list = document.getElementById("newsList");
  if (list && window.fetch) {
    var feed = "https://news.google.com/rss/search?q=%22OCI+card%22+OR+%22Indian+consulate%22+OR+%22Indian+passport%22+when:14d&hl=en-IN&gl=IN&ceid=IN:en";
    fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || d.status !== "ok" || !d.items) return;
        var have = {}, add = [];
        Array.prototype.forEach.call(list.querySelectorAll("a"), function (a) { have[a.textContent.trim().toLowerCase()] = 1; });
        d.items.slice(0, 10).forEach(function (it) {
          var src = (it.author || "").trim(), title = (it.title || "").replace(new RegExp(" - " + src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"), "").trim();
          if (!title || have[title.toLowerCase()]) return;
          var li = document.createElement("li"); li.className = "news-item";
          var a = document.createElement("a"); a.href = it.link; a.target = "_blank"; a.rel = "nofollow noopener"; a.textContent = title;
          var s = document.createElement("span"); s.className = "muted small"; s.textContent = " — " + (src || "News") + " · " + String(it.pubDate || "").slice(0, 10) + " · live";
          li.appendChild(a); li.appendChild(s); add.push(li);
        });
        add.reverse().forEach(function (li) { list.insertBefore(li, list.firstChild); });
      })
      .catch(function () {});
  }
})();
