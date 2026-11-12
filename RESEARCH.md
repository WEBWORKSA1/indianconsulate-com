# Research — sources and competitor survey (November 2026)

57 URLs were attempted. 45 returned usable content; 12 were blocked by robots.txt or errors (listed at the end). Findings shaped the feature set below.

## Official portals
| Site | Takeaways used |
|---|---|
| indianvisaonline.gov.in | e-Visa, regular visa, visa on arrival (Japan, South Korea, certain UAE nationals), free e-Arrival card (≤72 h before arrival, not a visa), Su-Swagatam app; warning that agents may not charge for visas/e-Arrival → scam guide, visa guide |
| ociservices.gov.in | Official OCI portal (redirect page only) → linked as the only place to apply |
| embassy.passportindia.gov.in | Country selector for Passport/Misc services at missions → fallback link in Consulate Finder |
| passportindia.gov.in | JS-only app → we link, don't scrape |
| mea.gov.in (missions page) | 404 at fetch time → we built our own mission directory |

## Indian missions
| Mission | Takeaways |
|---|---|
| CGI Dubai | Service list (visa, passport, marriages, repatriation, PCC, OCI, death registration), fraud-agency advisory, Track Your Document, accessibility tools |
| Embassy Abu Dhabi | Attestation, worker welfare (PBSK, PBBY), overseas voter notices, 24×7 lines |
| HCI London | Spoofed-number scam warning → scam guide |
| CGI Toronto, HCI Ottawa, CGI Vancouver | BLS helpline, after-hours bereavement visa line, surrender/PCC/IDP/life certificate sections |
| CGI Chicago | e-OCI notice: digital-only for new applicants from 8 Jul 2026, physical cards valid |
| CGI Houston | PAN/Aadhaar help for NRI/OCI/PIO, Global Entry, IDP |
| CGI Birmingham | VFS, MADAD, emergency visa, PAP/RAP permits |
| HCI Canberra, CGI Sydney, CGI Melbourne | IDLV, eCARe (mortal remains), life certificates, emergency certificate |
| CGI Jeddah | CPV & attestation services |
| CGI Auckland (notice) | e-OCI launch 30 Jun 2026 |
| Embassy Minsk (notice) | OCI re-issue rule updates |

## Application centres
| Site | Takeaways |
|---|---|
| BLS International Canada | Jurisdiction by postal code, in-person + biometrics, Premium Lounge (doesn't speed processing), Purolator tracking, reschedule notices |
| VFS Global | Status/appointment pages, optional form-filling, SMS alerts, courier, fraud page |

## Commercial visa & immigration players
| Site | Patterns adopted |
|---|---|
| VisaHQ | Visa-type selector, repeated CTAs, 3-step overview, trust stats |
| Atlys | Lookup-first hero, requirements checker, photo tool, numbered flow, floating help |
| Sherpa | Requirements checker, problem/solution layout, partner widgets |
| CIBTvisas | Requirement checker, "reviewed by a real person", B2B consultation funnel |
| TravelDocs | Document pre-check, order status, affiliate programme, newsletter |
| Boundless | Free-consultation CTA, audience split (individual/business) |
| VisaPlace | Quiz-based lead magnets (VisaScore), 3-step funnel, separate corporate form |
| Henley Passport Index | Callback form, compare tools, opt-in checkbox |
| VisaDB | Expert marketplace & listing fees → future service-partner directory |

## Information & community sites
| Site | Patterns adopted |
|---|---|
| VisaGuide.World | Comparison tables, question-based FAQ headings |
| SchengenVisaInfo | "Independent since…" positioning, wizard tools, rule-change table, news cards |
| ImmiHelp | NRI/OCI topical hub, trackers, affiliate insurance |
| VisaJourney | Community timelines → roadmap: processing-time tracker |
| SBNRI | NRI services, WhatsApp CTAs, deadline countdowns |
| NRIOL | Diaspora content breadth, quizzes, forum |
| passport-photo.online | Photo checker as a high-intent tool |
| Trackitt | Remittance content (affiliate potential) |
| travel.state.gov, usembassy.gov, GOV.UK travel advice, travel.gc.ca, Smartraveller | Alert-first layouts, email alerts, A–Z directories, emergency info, skip links |
| Embassy-Worldwide | A–Z directory pattern |
| nriinformation.com, Business Standard, Fragomen, NRI Pulse, Indian Eagle | 2026 rule details: Citizenship (Amendment) Rules 30 Apr 2026, 3-month OCI passport update window and US$25 late fee, reported Nov–Dec 2026 waiver, minors dual-passport rule, online renunciation, end of postal OCI in some US missions, Canada in-person biometrics |

## Blocked / unavailable
indianembassyusa.gov.in, indiacgny.gov.in, cgiatlanta.gov.in, madad.gov.in, YouTube search (robots.txt); cgisf.gov.in (server error); vfsglobal.com/india/usa, ivisa.com, embassypages.com, passportindex.org, iatatravelcentre.com, hcisingapore.gov.in (client errors).
