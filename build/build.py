#!/usr/bin/env python3
"""IndianConsulate.com static site generator (stdlib only).

Reads page bodies from build/content/**.html (each starts with a <!--meta ... --> block),
wraps them in the shared layout, and writes plain static HTML to the repo root so
GitHub Pages (free plan, main branch, / root) can serve it.

Run:  python3 build/build.py
"""
import json, os, re, html, datetime, math
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "build", "content")
DATA = os.path.join(ROOT, "build", "data")

# ---- Site settings (switch site_url to https://indianconsulate.com once DNS points to GitHub Pages)
CONFIG = json.load(open(os.path.join(DATA, "site.json"), encoding="utf-8"))
SITE_URL = CONFIG["site_url"].rstrip("/")
NAME = CONFIG["name"]
ADSENSE = CONFIG["adsense_client"]
OWNER_LINK = CONFIG["owner_link"]
TODAY = datetime.date.today()
MONTH = TODAY.strftime("%B %Y")

NAV = [
    ("Services", "services/"),
    ("Tools", "tools/"),
    ("Consulate Finder", "directory.html"),
    ("Guides", "guides/"),
    ("News", "news.html"),
    ("Videos", "videos.html"),
]

def esc(s):
    return html.escape(s, quote=True)

def parse(path):
    raw = open(path, encoding="utf-8").read()
    m = re.match(r"\s*<!--meta(.*?)-->", raw, re.S)
    meta = {}
    if m:
        for line in m.group(1).strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        raw = raw[m.end():]
    return meta, raw

def slugify(t):
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:60]

def strip_tags(t):
    return re.sub("<.*?>", "", t)

def add_heading_ids(body):
    toc = []
    def rep(m):
        attrs, text = m.group(1), m.group(2)
        if "id=" in attrs:
            i = re.search(r'id="([^"]+)"', attrs).group(1)
        else:
            i = slugify(strip_tags(text))
            attrs += f' id="{i}"'
        toc.append((i, strip_tags(text)))
        return f"<h2{attrs}>{text}</h2>"
    body = re.sub(r"<h2([^>]*)>(.*?)</h2>", rep, body)
    return body, toc

def words(body):
    return len(re.sub("<.*?>", " ", body).split())

# ------------------------------------------------------------------ data blocks
def load_json(name, default):
    p = os.path.join(DATA, name)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default

MISSIONS = load_json("missions.json", [])
NEWS = load_json("news.json", {"updated": None, "items": []})
VIDEOS = load_json("videos.json", {"embeds": [], "topics": []})

def directory_table(r):
    regions = sorted({m["region"] for m in MISSIONS})
    opts = "".join(f'<option value="{esc(x)}">{esc(x)}</option>' for x in regions)
    rows = []
    for m in sorted(MISSIONS, key=lambda x: (x["country"], x["city"])):
        if m.get("website"):
            label = m["website"].replace("https://", "").rstrip("/")
            site = f'<a href="{esc(m["website"])}" rel="nofollow noopener" target="_blank">{esc(label)} ↗</a>'
        else:
            site = '<a href="https://embassy.passportindia.gov.in/" rel="nofollow noopener" target="_blank">Find via Passport Seva ↗</a>'
        prov = esc(m.get("provider", "")) or "—"
        q = (m["country"] + " " + m["city"] + " " + m["type"] + " " + m.get("covers", "")).lower()
        rows.append(
            f'<tr data-region="{esc(m["region"])}" data-q="{esc(q)}">'
            f'<td><strong>{esc(m["country"])}</strong><br><span class="muted small">{esc(m["region"])}</span></td>'
            f'<td>{esc(m["city"])}</td><td>{esc(m["type"])}</td>'
            f'<td class="small">{esc(m.get("covers", ""))}</td><td>{prov}</td><td>{site}</td></tr>')
    return f'''<div class="dir-controls">
  <label class="sr-only" for="dirq">Search missions</label>
  <input id="dirq" type="search" placeholder="Search a country, city or state…" autocomplete="off">
  <label class="sr-only" for="dirr">Region</label>
  <select id="dirr"><option value="">All regions</option>{opts}</select>
  <span id="dircount" class="muted small" aria-live="polite"></span>
</div>
<div class="table-wrap"><table class="dir-table" id="dirtable">
<thead><tr><th>Country</th><th>City</th><th>Mission type</th><th>Typical jurisdiction</th><th>Application centre*</th><th>Official website</th></tr></thead>
<tbody>{"".join(rows)}</tbody></table></div>'''

def news_list(limit=None, compact=False):
    items = NEWS.get("items", [])[: limit or None]
    if not items:
        return '<p class="muted">The headline feed refreshes automatically every day. Check back shortly.</p>'
    out = []
    for it in items:
        d = it.get("published", "")[:10]
        when = ' · <time datetime="%s">%s</time>' % (d, d) if d else ""
        out.append(f'<li class="news-item"><a href="{esc(it["link"])}" target="_blank" rel="nofollow noopener">{esc(it["title"])}</a>'
                   f'<span class="muted small"> — {esc(it.get("source", ""))}{when}</span></li>')
    upd = (NEWS.get("updated") or "")[:16].replace("T", " ")
    stamp = f'<p class="muted small">Feed last refreshed: {esc(upd)} UTC. Headlines link to the original publishers.</p>' if upd and not compact else ""
    return f'<ul class="news-list">{"".join(out)}</ul>{stamp}'

def video_block(r):
    parts = []
    if VIDEOS.get("embeds"):
        cards = "".join(
            f'<figure class="yt-card"><button class="yt-lite" data-yt="{esc(v["id"])}" aria-label="Play: {esc(v["title"])}" '
            f'style="background-image:url(https://i.ytimg.com/vi/{esc(v["id"])}/hqdefault.jpg)"><span class="yt-play" aria-hidden="true"></span></button>'
            f'<figcaption>{esc(v["title"])}</figcaption></figure>' for v in VIDEOS["embeds"])
        parts.append(f'<div class="grid g3">{cards}</div>')
    topics = "".join(
        f'<a class="card video-topic" href="https://www.youtube.com/results?search_query={esc(t["q"].replace(" ", "+"))}" target="_blank" rel="nofollow noopener">'
        f'<span class="vt-icon" aria-hidden="true">▶</span><strong>{esc(t["title"])}</strong><span class="muted small">{esc(t["desc"])}</span>'
        f'<span class="link-arrow">Watch walkthroughs on YouTube ↗</span></a>' for t in VIDEOS.get("topics", []))
    parts.append(f'<div class="grid g3">{topics}</div>')
    return "".join(parts)

def cta_block(r, service=""):
    q = f"?service={service}" if service else ""
    return f'''<aside class="cta-band" aria-label="Get expert help">
  <div><p class="eyebrow">Free, no-obligation review</p>
  <h3>Stuck on a form, a document or a deadline?</h3>
  <p>Tell us what you need in 60 seconds. An independent consular-documentation specialist reviews your situation and replies with a clear checklist and next steps — usually within one business day.</p></div>
  <a class="btn btn-accent btn-lg" href="{r}get-help.html{q}">Get my free checklist →</a>
</aside>'''

def support_strip(r):
    return f'''<aside class="support-strip"><p><strong>This guide is free and independent.</strong> Reader support pays for research, translations, contests and new tools.</p>
<a class="btn btn-ghost" href="{r}support.html">Support the project</a></aside>'''

# collected after first pass
GUIDES = []
ALL_PAGES = []

def guides_list(r, limit=None, exclude=None):
    items = [g for g in GUIDES if g["url"] != exclude][: limit or None]
    return '<div class="grid g3">' + "".join(
        f'<a class="card guide-card" href="{r}{g["url"]}"><span class="tag">{esc(g.get("tag", "Guide"))}</span>'
        f'<h3>{esc(g["title"])}</h3><p>{esc(g["description"])}</p><span class="link-arrow">Read guide →</span></a>' for g in items) + "</div>"

# ------------------------------------------------------------------ layout
def nav_html(r, current):
    li = []
    for label, href in NAV:
        active = ' aria-current="page"' if current.startswith(href.rstrip("/").replace(".html", "")) else ""
        li.append(f'<li><a href="{r}{href}"{active}>{label}</a></li>')
    return "".join(li)

def layout(meta, body, out_rel, r):
    title = meta.get("title", NAME)
    full_title = title if NAME in title else f"{title} | {NAME}"
    desc = meta.get("description", "")
    canon = f"{SITE_URL}/{out_rel}".replace("/index.html", "/")
    ptype = meta.get("type", "page")
    noindex = '<meta name="robots" content="noindex,follow">' if meta.get("noindex") == "true" else '<meta name="robots" content="index,follow,max-image-preview:large">'
    ads = "" if meta.get("ads") == "no" else f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE}" crossorigin="anonymous"></script>'
    tools_js = f'<script src="{r}assets/js/tools.js" defer></script>' if ptype in ("tool", "toolhub") or meta.get("tools") == "yes" else ""
    ld = [{
        "@context": "https://schema.org", "@type": "WebSite", "name": NAME, "url": SITE_URL + "/",
        "potentialAction": {"@type": "SearchAction", "target": SITE_URL + "/search.html?q={q}", "query-input": "required name=q"}}]
    if ptype == "article":
        ld.append({"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc,
                   "dateModified": TODAY.isoformat(), "datePublished": meta.get("published", "2026-11-12"),
                   "author": {"@type": "Organization", "name": NAME + " Editorial Team"},
                   "publisher": {"@type": "Organization", "name": NAME}, "mainEntityOfPage": canon})
    faq = re.findall(r'<details class="faq"><summary>(.*?)</summary>(.*?)</details>', body, re.S)
    if faq:
        ld.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": strip_tags(q).strip(),
             "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"\s+", " ", strip_tags(a)).strip()}} for q, a in faq]})
    crumbs = ""
    if out_rel != "index.html":
        parts = [("Home", f"{r}index.html")]
        if "/" in out_rel and not out_rel.endswith("/index.html"):
            sec = out_rel.split("/")[0]
            parts.append((sec.capitalize(), f"{r}{sec}/"))
        parts.append((meta.get("crumb", title), None))
        crumbs = '<nav class="crumbs container" aria-label="Breadcrumb"><ol>' + "".join(
            f'<li><a href="{u}">{esc(t)}</a></li>' if u else f'<li aria-current="page">{esc(t)}</li>' for t, u in parts) + "</ol></nav>"
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": t} for i, (t, _) in enumerate(parts)]})
    ld_json = json.dumps(ld if len(ld) > 1 else ld[0], ensure_ascii=False)
    og_type = "article" if ptype == "article" else "website"

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(full_title)}</title>
<meta name="description" content="{esc(desc)}">
{noindex}
<link rel="canonical" href="{canon}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{NAME}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE_URL}/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0e2a47">
<link rel="icon" href="{r}assets/img/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="{r}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{r}assets/css/site.css">
<script>try{{var t=localStorage.getItem("ic-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
{ads}
<script type="application/ld+json">{ld_json}</script>
</head>
<body class="type-{ptype}" data-root="{r}">
<a class="skip" href="#main">Skip to content</a>
<div class="owner-strip"><div class="container"><a href="{OWNER_LINK}" target="_blank" rel="noopener">Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership</a></div></div>
<div class="indep-bar"><div class="container"><span class="indep-dot" aria-hidden="true"></span><span><strong>Independent guide — not a government website.</strong> We are not affiliated with the Government of India, MEA or any Indian Embassy/Consulate. Official applications are made only on <em>.gov.in</em> portals. <a href="{r}disclaimer.html">Details</a></span></div></div>
<header class="site-header">
  <div class="container hdr">
    <a class="brand" href="{r}index.html" aria-label="{NAME} home">
      <svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="10" fill="var(--ink)"/><path d="M13 12h4v16h-4z" fill="var(--saffron)"/><path d="M29.5 15.2A7.5 7.5 0 1 0 29.5 24.8" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></svg>
      <span class="brand-text">IndianConsulate<span class="brand-tld">.com</span><small>Independent consular services guide</small></span>
    </a>
    <nav class="main-nav" id="mainnav" aria-label="Main"><ul>{nav_html(r, out_rel)}</ul></nav>
    <div class="hdr-actions">
      <button class="icon-btn" id="searchBtn" aria-label="Search the site" aria-controls="searchPanel" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
      <button class="icon-btn" id="themeBtn" aria-label="Toggle dark mode"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></button>
      <a class="btn btn-accent hdr-cta" href="{r}get-help.html">Get help</a>
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-controls="mainnav" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>
  </div>
  <div class="search-panel" id="searchPanel" hidden>
    <div class="container"><label class="sr-only" for="siteSearch">Search</label>
      <input id="siteSearch" type="search" placeholder="Search guides, services and tools — e.g. “OCI for minors”" autocomplete="off">
      <ul id="searchResults" class="search-results" role="listbox"></ul></div>
  </div>
</header>
{crumbs}
<main id="main">
{body}
</main>
<footer class="site-footer">
  <div class="container foot-grid">
    <div>
      <a class="brand brand-foot" href="{r}index.html">IndianConsulate<span class="brand-tld">.com</span></a>
      <p class="small">An independent, reader-supported guide to Indian consular services worldwide: passports, OCI, visas, surrender certificates, attestation and emergencies.</p>
      <form class="newsletter" data-form="newsletter" novalidate>
        <label for="nl-email" class="small"><strong>Rule-change alerts</strong> — one short email when fees or processes change.</label>
        <div class="nl-row"><input id="nl-email" type="email" name="email" placeholder="you@example.com" required><button class="btn btn-accent" type="submit">Subscribe</button></div>
      </form>
    </div>
    <div><h4>Services</h4><ul>
      <li><a href="{r}services/oci.html">OCI card</a></li><li><a href="{r}services/passport.html">Passport renewal</a></li>
      <li><a href="{r}services/visa.html">Visa &amp; e-Visa</a></li><li><a href="{r}services/renunciation.html">Surrender certificate</a></li>
      <li><a href="{r}services/attestation.html">Attestation &amp; apostille</a></li><li><a href="{r}services/pcc.html">Police clearance</a></li>
      <li><a href="{r}services/emergency.html">Emergencies</a></li><li><a href="{r}services/nri-services.html">NRI services</a></li></ul></div>
    <div><h4>Free tools</h4><ul>
      <li><a href="{r}tools/service-finder.html">Service finder</a></li><li><a href="{r}tools/oci-eligibility.html">OCI eligibility check</a></li>
      <li><a href="{r}tools/document-checklist.html">Document checklist</a></li><li><a href="{r}tools/photo-checker.html">Photo checker</a></li>
      <li><a href="{r}tools/travel-planner.html">Passport &amp; trip planner</a></li><li><a href="{r}directory.html">Consulate finder</a></li></ul></div>
    <div><h4>Community</h4><ul>
      <li><a href="{r}get-help.html">Get expert help</a></li><li><a href="{r}support.html">Support us / donate</a></li>
      <li><a href="{r}contests.html">Contests &amp; prizes</a></li><li><a href="{r}careers.html">Careers &amp; contributors</a></li>
      <li><a href="{r}advertise.html">Advertise &amp; partner</a></li><li><a href="{r}contact.html">Contact</a></li></ul></div>
    <div><h4>About</h4><ul>
      <li><a href="{r}about.html">About us</a></li><li><a href="{r}editorial-policy.html">Editorial policy</a></li>
      <li><a href="{r}faq.html">FAQ</a></li><li><a href="{r}privacy.html">Privacy policy</a></li>
      <li><a href="{r}terms.html">Terms of use</a></li><li><a href="{r}disclaimer.html">Disclaimer &amp; trademarks</a></li><li><a href="{r}sitemap.html">Sitemap</a></li></ul></div>
  </div>
  <div class="container legal">
    <p><strong>Independent publication.</strong> {NAME} is a privately operated information service. It is <strong>not</strong> an official website of, and is not endorsed by, the Government of India, the Ministry of External Affairs, the Ministry of Home Affairs, any Indian Embassy, High Commission or Consulate, or any outsourced service provider. We do not issue passports, visas, OCI cards or certificates, and we never collect government fees. Government names are used only to describe services factually. All third-party trademarks belong to their respective owners. We do not use the State Emblem of India or any official insignia.</p>
    <p>© <span data-year>{TODAY.year}</span> {NAME}. Original text, graphics and tools are protected by copyright. Information is general guidance, not legal advice — always confirm with the official source before you apply.</p>
  </div>
</footer>
<a class="mobile-cta" href="{r}get-help.html">Get a free document checklist →</a>
<div class="cookie" id="cookie" hidden role="dialog" aria-label="Cookie notice">
  <p>We use cookies for essential functions, analytics and Google AdSense advertising, which may personalise ads. See our <a href="{r}privacy.html">privacy policy</a>.</p>
  <div><button class="btn btn-ghost" data-consent="essential">Essential only</button><button class="btn btn-accent" data-consent="all">Accept all</button></div>
</div>
<script src="{r}assets/js/config.js"></script>
<script src="{r}assets/js/main.js" defer></script>
{tools_js}
</body>
</html>
'''

# ------------------------------------------------------------------ article wrapper
def toc_label(t):
    return re.sub(r"^\d+\.\s*", "", t)

def wrap_article(meta, body, r, out_rel):
    body, toc = add_heading_ids(body)
    mins = max(3, math.ceil(words(body) / 220))
    toc_html = ""
    if len(toc) >= 3:
        toc_html = '<nav class="toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol>' + "".join(
            f'<li><a href="#{i}">{esc(toc_label(t))}</a></li>' for i, t in toc) + "</ol></nav>"
    service = meta.get("service", "")
    svc_q = "?service=" + service if service else ""
    related = guides_list(r, 3, exclude=out_rel)
    tag = esc(meta.get("tag", "Guide"))
    lede = esc(meta.get("lede", meta.get("description", "")))
    return f'''<article class="container article">
<header class="art-head">
  <p class="eyebrow">{tag}</p>
  <h1>{esc(meta["title"])}</h1>
  <p class="lede">{lede}</p>
  <p class="art-meta muted small">By the {NAME} editorial team · Reviewed {MONTH} · {mins} min read · <button class="linkish" data-share>Share</button></p>
</header>
<div class="art-layout">
  <div class="prose">{body}
  <div class="verify-box"><strong>Before you apply:</strong> fees, forms and processing times change often and differ by country. Always confirm the current rules on the official portal or your mission's website. Spotted something out of date? <a href="{r}contact.html?topic=correction">Send a correction</a>.</div>
  {cta_block(r, service)}
  </div>
  <aside class="art-side">{toc_html}
    <div class="side-card"><p class="eyebrow">Free tools</p><ul class="plain">
      <li><a href="{r}tools/service-finder.html">Which service do I need?</a></li>
      <li><a href="{r}tools/document-checklist.html">Build my document checklist</a></li>
      <li><a href="{r}tools/photo-checker.html">Check my photo</a></li>
      <li><a href="{r}directory.html">Find my consulate</a></li></ul></div>
  </aside>
</div>
<section class="related"><h2>Keep reading</h2>{related}</section>
{support_strip(r)}
</article>
<div class="slide-cta" id="slideCta" hidden><button class="slide-x" aria-label="Close">×</button><p><strong>Want a checklist for your exact case?</strong> Free, reply within 1 business day.</p><a class="btn btn-accent" href="{r}get-help.html{svc_q}">Get my checklist</a></div>'''

# ------------------------------------------------------------------ build
def render_tokens(body, r, out_rel, meta):
    body = body.replace("{{root}}", r).replace("{{year}}", str(TODAY.year)).replace("{{month}}", MONTH)
    body = body.replace("{{cta}}", cta_block(r, meta.get("service", "")))
    body = body.replace("{{support}}", support_strip(r))
    body = body.replace("{{directory}}", directory_table(r))
    body = body.replace("{{news}}", news_list())
    body = body.replace("{{news_preview}}", news_list(6, compact=True))
    body = body.replace("{{videos}}", video_block(r))
    body = body.replace("{{guides}}", guides_list(r))
    body = body.replace("{{guides3}}", guides_list(r, 3))
    links = "".join(f'<li><a href="{r}{g["url"]}">{esc(g["title"])}</a></li>' for g in GUIDES)
    body = body.replace("{{guides_links}}", "<ul>" + links + "</ul>")
    body = body.replace("{{mission_count}}", str(len(MISSIONS)))
    body = body.replace("{{country_count}}", str(len({m["country"] for m in MISSIONS})))
    return body

def main():
    files = []
    for d, _, fs in os.walk(SRC):
        for f in sorted(fs):
            if f.endswith(".html"):
                p = os.path.join(d, f)
                rel = os.path.relpath(p, SRC).replace(os.sep, "/")
                meta, body = parse(p)
                files.append((rel, meta, body))
    files.sort(key=lambda x: x[0])
    # guides index data first
    for rel, meta, body in sorted(files, key=lambda x: int(x[1].get("order", 99))):
        if rel.startswith("guides/") and rel != "guides/index.html":
            GUIDES.append({"url": rel, "title": meta["title"], "description": meta.get("description", ""), "tag": meta.get("tag", "Guide")})
    search = []
    for rel, meta, body in files:
        depth = rel.count("/")
        r = "../" * depth
        if meta.get("absolute") == "true":  # 404 can be served at any URL depth
            r = urlparse(SITE_URL).path.rstrip("/") + "/"
        body = render_tokens(body, r, rel, meta)
        if meta.get("type") == "article":
            body = wrap_article(meta, body, r, rel)
        out = layout(meta, body, rel, r)
        op = os.path.join(ROOT, rel)
        os.makedirs(os.path.dirname(op), exist_ok=True)
        open(op, "w", encoding="utf-8").write(out)
        if meta.get("noindex") != "true":
            ALL_PAGES.append((rel, meta))
            search.append({"t": meta.get("title", ""), "u": rel, "d": meta.get("description", ""), "k": meta.get("keywords", "")})
    # sitemap.xml
    urls = "".join(
        f"<url><loc>{SITE_URL}/{rel.replace('index.html', '')}</loc><lastmod>{TODAY.isoformat()}</lastmod>"
        f"<priority>{'1.0' if rel == 'index.html' else '0.8' if rel.count('/') else '0.7'}</priority></url>"
        for rel, _ in sorted(ALL_PAGES))
    open(os.path.join(ROOT, "sitemap.xml"), "w").write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n')
    open(os.path.join(ROOT, "robots.txt"), "w").write(
        f"User-agent: *\nAllow: /\nDisallow: /build/\n\nUser-agent: Mediapartners-Google\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    os.makedirs(os.path.join(ROOT, "assets", "data"), exist_ok=True)
    json.dump(search, open(os.path.join(ROOT, "assets", "data", "search-index.json"), "w"), ensure_ascii=False)
    print(f"Built {len(files)} pages, {len(GUIDES)} guides, {len(MISSIONS)} missions, {len(NEWS.get('items', []))} news items.")

if __name__ == "__main__":
    main()
