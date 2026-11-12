# IndianConsulate.com — Independent Consular Services Guide

An independent, AdSense-monetised guide to Indian consular services worldwide (OCI & e-OCI, passport renewal abroad, visas & e-Visa, surrender certificates, attestation/apostille, PCC, emergencies, NRI services) with free interactive tools, a lead-generation help desk, donations, contests, careers and sponsorships.

**Not a government website.** The site carries a non-affiliation notice on every page, never uses the State Emblem of India, and links users to official `.gov.in` portals.

## Structure
| Path | What it is |
|---|---|
| `index.html`, `*.html`, `services/`, `tools/`, `guides/` | **Generated** static pages served by GitHub Pages (do not edit by hand) |
| `build/content/**.html` | Page sources — a `<!--meta ... -->` header (title, description, type, …) + body HTML |
| `build/build.py` | Stdlib-only generator: wraps pages in the shared layout, builds TOC, schema.org JSON-LD, breadcrumbs, `sitemap.xml`, `robots.txt`, search index |
| `build/data/site.json` | Site URL, AdSense client ID, owner contact link |
| `build/data/missions.json` | Consulate-finder data (83 missions, 58 countries) |
| `build/data/news.json` | Auto-refreshed headline feed |
| `build/data/videos.json` | Video topics; add `{"id": "<YouTube ID>", "title": "…"}` objects to `embeds` for click-to-play embeds |
| `build/fetch_news.py` | Pulls headlines (title + link only) from Google News RSS |
| `build/make_images.py` | Generates the OG share image and app icon (Pillow, run in CI) |
| `.github/workflows/auto-update.yml` | On every source push + daily: refresh news → rebuild → commit (self-updating site) |
| `assets/css/site.css` | Design system (light + dark) |
| `assets/js/main.js` | UI, search, cookie consent, multi-step lead form, form relay, donations, countdown, lite YouTube |
| `assets/js/tools.js` | Service finder, OCI eligibility, checklist builder, photo checker, trip planner (.ics) |
| `assets/js/config.js` | **Edit me:** donation links, contest prizes, encoded form-relay key |
| `PROMPTS.md` | Phase-wise build prompts · `RESEARCH.md` competitor & source survey |

Rebuild after any content change: `python3 build/build.py` (CI does this automatically on push).

## Publish on GitHub Pages (free plan)
Settings → Pages → Build and deployment → Source **Deploy from a branch** → Branch **main** / **(root)** → Save.
Live at `https://webworksa1.github.io/indianconsulate-com/`. `.nojekyll` is present, so files are served as-is.

## Custom domain (indianconsulate.com)
The domain currently points to a registrar parking page. When ready:
1. DNS: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; CNAME `www` → `webworksa1.github.io`.
2. Settings → Pages → Custom domain `indianconsulate.com`, tick **Enforce HTTPS**.
3. In `build/data/site.json` set `"site_url": "https://indianconsulate.com"` and commit — CI rebuilds canonical URLs, sitemap, robots and 404 links.

## Forms (lead gen, contact, pledges, contest, careers, partners, newsletter)
All forms post via FormSubmit to the owner inbox. The address is assembled at runtime from the encoded `relay` key in `config.js` and never appears in page source. **The first submission triggers a one-time FormSubmit activation email — click Activate**, otherwise later submissions are not delivered. Lead submissions include service, country, urgency, citizenship, a 0–100 lead score, first landing page, referrer and UTM tags.

## Donations
Paste PayPal.me / Stripe Payment Link / Buy Me a Coffee / Razorpay / UPI URLs into `assets/js/config.js` → `payments`. Until then the Support page runs in pledge mode (pledge form → you email a payment link).

## AdSense
The Auto-ads tag (`ca-pub-6620975821265271`) is in the `<head>` of every content page; it is deliberately omitted from `get-help.html`, `thank-you.html` and `404.html` to keep the lead funnel clean. `ads.txt` is at the root. Apply once the custom domain is live (`https://indianconsulate.com/ads.txt` must resolve). After approval: enable Auto ads, turn on the Google-certified consent message for EEA/UK/CH (Privacy & messaging).

## Contest
Monthly; countdown auto-resets each month. Change prizes in `config.js`.

## Trademark / copyright
See `disclaimer.html`. “IndianConsulate.com” is a descriptive domain; no affiliation with the Government of India, MEA, MHA, any Indian mission, VFS Global or BLS International is claimed or implied.
