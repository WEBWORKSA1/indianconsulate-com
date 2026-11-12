#!/usr/bin/env python3
"""Refresh build/data/news.json from public Google News RSS searches (headlines + links only).
Runs daily in GitHub Actions (.github/workflows/auto-update.yml). Stdlib only."""
import json, os, urllib.request, urllib.parse, xml.etree.ElementTree as ET, datetime, email.utils, re

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "news.json")
QUERIES = ['"OCI card"', '"e-OCI"', '"Indian consulate"', '"Indian embassy" passport', '"Indian passport" NRI', '"India e-visa"', '"surrender certificate" Indian']
BLOCK = re.compile(r"(casino|betting|crypto|horoscope)", re.I)

def fetch(q):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q + " when:30d", "hl": "en-IN", "gl": "IN", "ceid": "IN:en"})
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (IndianConsulate.com news bot)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        root = ET.fromstring(r.read())
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        src = it.find("source")
        source = (src.text or "").strip() if src is not None else ""
        if source and title.endswith(" - " + source):
            title = title[: -len(source) - 3]
        try:
            pub = email.utils.parsedate_to_datetime(it.findtext("pubDate")).astimezone(datetime.timezone.utc)
        except Exception:
            pub = datetime.datetime.now(datetime.timezone.utc)
        yield {"title": title, "link": it.findtext("link"), "source": source, "published": pub.strftime("%Y-%m-%dT%H:%M")}

def key(t):
    return re.sub(r"\W+", "", t.lower())[:80]

def main():
    old = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {"items": []}
    seen, items = set(), []
    for q in QUERIES:
        try:
            for x in fetch(q):
                k = key(x["title"])
                if not x["link"] or k in seen or BLOCK.search(x["title"]):
                    continue
                seen.add(k); items.append(x)
        except Exception as e:
            print("query failed:", q, e)
    if not items:
        print("No items fetched; keeping existing feed."); return
    for x in old.get("items", []):  # keep earlier items so the feed never shrinks to nothing
        k = key(x["title"])
        if k not in seen:
            seen.add(k); items.append(x)
    items.sort(key=lambda x: x.get("published", ""), reverse=True)
    json.dump({"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M"), "items": items[:40]},
              open(OUT, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("news items:", len(items[:40]))

if __name__ == "__main__":
    main()
