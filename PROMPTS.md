# IndianConsulate.com — Phase-wise Build Prompts

## The idea (why this, not something else)

**Concept:** *IndianConsulate.com — the independent consular services navigator.* A plain-English, tool-driven guide for the Indian diaspora (NRIs, OCI cardholders, people of Indian origin) and foreign travellers to India, monetised by AdSense, a lead-generation help desk and sponsorships, with donations, contests and careers for community and content supply.

**Why it wins:**
- **Evergreen, high-intent demand.** Passports expire, OCIs need updating, visas are needed for every trip — the queries never stop. 2026 added a wave of new queries: the e-OCI, the Citizenship (Amendment) Rules 2026, the 3-month passport-update window, the minors dual-passport rule, the end of postal OCI applications in some countries.
- **Official sites are fragmented and hard to read.** 100+ mission sites, each different, many blocking crawlers. A single clear guide with tools fills that gap.
- **Ad value.** Immigration, travel insurance, remittance, legal and relocation advertisers pay premium CPCs; diaspora traffic from the US, UK, Canada, UAE and Australia is high-RPM.
- **Lead value.** Every surrender-then-OCI, minor OCI, lost-passport or PoA case is a qualified lead for document-service firms and immigration lawyers.

**Non-negotiable guardrail:** the domain sounds official, so the site must never pose as one — a non-affiliation bar on every page, no State Emblem or official insignia, no fee collection, `.gov.in` links for applications, and a full disclaimer and trademark page. This protects users, AdSense approval and the domain itself.

---

## Phase 0 — Strategy & compliance
> Define IndianConsulate.com as an independent information service about Indian consular services. Write the positioning statement, audience segments (NRIs by country, OCI holders, people of Indian origin, foreign travellers, businesses), revenue model (AdSense Auto ads, lead-gen help desk, sponsorships, service-partner leads, donations) and compliance guardrails: persistent “not a government website” notice, no State Emblem, no government-fee collection, `.gov.in` links for official applications, a full disclaimer + trademark/copyright page, no fabricated testimonials, fees or processing times.

## Phase 1 — Research (35+ sites)
> Visit at least 35 sites across five clusters: (1) official portals — MEA, Indian Visa Online, OCI Services, Passport Seva for missions, MADAD; (2) Indian missions — Washington, New York, San Francisco, Chicago, Houston, Atlanta, Ottawa, Toronto, Vancouver, London, Birmingham, Dubai, Abu Dhabi, Canberra, Sydney, Melbourne, Jeddah, Singapore; (3) application centres — VFS Global, BLS International; (4) commercial visa/immigration players — VisaHQ, iVisa, Atlys, Sherpa, CIBTvisas, TravelDocs, Boundless, VisaPlace, VisaDB, Henley; (5) information and community sites — VisaGuide.World, SchengenVisaInfo, ImmiHelp, VisaJourney, SBNRI, NRIOL, passport-photo services, government travel-advice portals. Extract features, tools, forms, lead-gen patterns, trust signals, monetisation and design. Record findings in RESEARCH.md. Also research what changed in the current year (rules, fees, digital cards).

## Phase 2 — Information architecture & design system
> IA: Home; Services hub + 8 service guides (OCI/e-OCI, passport renewal abroad, visa/e-Visa, surrender/renunciation, attestation/apostille, PCC, emergencies, NRI services); Tools hub + 5 tools; Consulate Finder; Guides hub + 8 long-form guides; News (auto-updated); Videos; Get Help (lead gen); Support (donations); Contests; Careers; Advertise; About; Contact; FAQ; Editorial policy; Privacy; Terms; Disclaimer; Sitemap; Search; Thank-you; 404. Design system: navy ink, saffron accent, teal trust colour, Fraunces display + Inter body, light/dark modes, cards, tiers, steps, FAQ accordions, notices, forms — deliberately not imitating government sites.

## Phase 3 — Core build
> Static site that runs on the GitHub Pages free plan: a stdlib Python generator (`build/build.py`) renders `build/content/**` into root HTML with a shared layout. Every page: (1) top strip “Contact, if you are interested in this website/domain name/Sponsorship/Advertisement/Partnership” linking to https://web.works/contact; (2) independence notice bar; (3) sticky header with search, dark mode and a “Get help” CTA; (4) footer with newsletter, link columns and legal notice; (5) cookie-consent banner with non-personalised-ads fallback; (6) AdSense head tag `ca-pub-6620975821265271`; (7) canonical, OG, Twitter, JSON-LD (WebSite, Article, FAQPage, BreadcrumbList). Relative links so the site works on github.io and the custom domain. Generate sitemap.xml, robots.txt, search index, ads.txt, manifest, favicon, OG image. Exclude build sources and docs from the public site.

## Phase 4 — Content
> Write original, plain-English content: 8 service guides (key-facts table, eligibility, steps, typical documents, mistakes, official links, FAQs) and 8 guides (OCI in 2026, passport renewal by country, surrender→OCI sequence, e-Visa mistakes, scams, children born abroad, moving-abroad checklist, power of attorney from abroad). Cite rule changes by date; never invent fees or processing times; send readers to the official source to verify. About, Editorial policy, FAQ, Privacy (AdSense/Google cookie disclosures and opt-out links), Terms, Disclaimer (non-affiliation, domain statement, trademarks, copyright, no legal advice).

## Phase 5 — Interactive tools
> Client-side tools (no data leaves the device): Service Finder (who-are-you × goal → service + portal + CTA); OCI Eligibility Check (6 questions → eligible / extra scrutiny / not eligible + surrender-certificate note); Document Checklist Builder (10 services × situation flags, tick progress saved in localStorage, print/copy); Photo Checker (format, square, pixel range, KB range, border-luminance background estimate; OCI, e-Visa and printed 2×2″ presets); Passport & Trip Planner (6-month validity, renewal window, start-by date with service buffers, .ics reminders). Every tool ends with a lead CTA.

## Phase 6 — Lead generation engine
> `get-help.html`: 3-step form (service cards → country, urgency, applicants, citizenship → name, email, optional WhatsApp, contact preference, notes, consent + alerts opt-in) with progress bar, `?service=` prefill that skips to step 2, inline validation, honeypot, computed lead score, first-touch attribution (landing, referrer, UTM) and personalised thank-you. Site-wide CTAs: hero, in-article CTA band, 55%-scroll slide-in, sticky mobile bar, tool-result CTAs, header button. All forms submit via FormSubmit AJAX to the owner inbox, the address assembled at runtime from an encoded key so it never appears in source, with classic-POST fallback.

## Phase 7 — Monetisation & community
> AdSense Auto ads on content pages (excluded from the lead funnel) + ads.txt. Support page: 4 donation tiers, allocation chart (operations, hiring, promotion, contests, tools), configurable PayPal/Stripe/BMC/Razorpay/UPI links with pledge-mode fallback. Contests: monthly tip contest, live countdown, configurable prizes, entry form, compliant rules (no purchase necessary, 18+, judging criteria). Careers: 6 roles + application form. Advertise: sponsorship packages, standards, partner/lead-buyer enquiry form.

## Phase 8 — Automation (self-updating)
> GitHub Actions on every source push and daily: generate images if missing, `fetch_news.py` pulls headline + link from Google News RSS for OCI / e-OCI / Indian consulate / Indian passport NRI / India e-Visa / surrender-certificate queries, dedupes and filters, keeps the newest 40, rebuilds (refreshing review dates and sitemap lastmod) and commits. Client side: tip-of-the-day rotation, month-end contest countdown, auto year and month.

## Phase 9 — SEO & AdSense readiness
> Unique titles and descriptions, H1→H2 hierarchy with auto TOC, FAQ schema, internal linking (related guides, tool↔guide links), fast pages (no frameworks, lazy YouTube, system fallback fonts), accessibility (skip link, labels, aria-live, focus states, reduced motion), privacy policy with Google disclosures, contact/about/editorial pages, no thin pages, no deceptive layouts, labelled sponsorships, noindex on search/thank-you/404.

## Phase 10 — QA & deploy
> Check: no broken internal links; owner strip and independence bar on every page; email absent from all public files; JS syntax; mobile overflow at 390 px; tool flows; lead-form 3 steps; cookie banner; dark mode. Push to `webworksa1/indianconsulate-com` (main), enable Pages (main / root). When DNS is ready, switch `site_url` and add the custom domain.

## Phase 11 — Growth roadmap
> Country hubs (`/usa/`, `/canada/`, `/uae/`…) with jurisdiction tables; Hindi and regional-language versions; a community-reported processing-times tracker (original data = link magnet); a paid premium checklist PDF; a WhatsApp alert channel; service-partner marketplace pages per city; a YouTube channel built with commissioned creators; email automation for rule-change alerts.
