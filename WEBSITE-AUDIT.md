# Olympic Cafe — Website Audit

Audit date: 2026-08-01. Scope: `index.html`, `about.html`, `menu.html`, `gallery.html`, `contact.html`, `serve.mjs`, `screenshot.mjs`, `assets/`, `brand_assets/`.

## Summary

The site is already a well-built, single-file-per-page Tailwind build with a consistent burgundy/cream/terracotta/ink brand system, considered typography (Fredoka/Poppins/Special Elite), and a genuinely non-generic motion system: staggered hero word reveals, mask-wipe headings, scroll reveals via `IntersectionObserver`, a pinned scroll-scrubbed story section on the homepage, a card-flip accent, a JS-balanced masonry gallery with a full keyboard-accessible lightbox, and `prefers-reduced-motion` support everywhere. Buttons, nav links, and cards all have hover/active/focus-visible states and 44px+ touch targets.

This audit therefore does **not** recommend a redesign. It found a small number of real gaps: missing SEO/structured-data plumbing, a handful of consistency bugs from staggered page-by-page building, one visually flat page (About has no photography at all), and missing `loading="lazy"` on below-the-fold images. These are listed below and were implemented in this pass except where explicitly flagged as needing information only the business owner has.

---

## Critical fixes

| # | Page/Component | Problem | Solution | Benefit | Difficulty | Perf impact | New content needed? |
|---|---|---|---|---|---|---|---|
| 1 | All 5 pages | No `<html>`/`<head>`/`<body>` tags — files start directly at `<meta charset>`, so there's no `lang` attribute anywhere in the site | Wrap each page's existing content in `<!DOCTYPE html><html lang="en"><head>…</head><body>…</body></html>` without changing content order | Screen readers get correct pronunciation rules; passes a basic SEO/accessibility check | Trivial | None | No |
| 2 | All 5 pages `<head>` | No `og:image`, no Twitter Card meta, no structured data despite verified name/address/phone sitting in every footer | Add `og:image` (existing photo), `twitter:card`, and one `CafeOrCoffeeShop` JSON-LD block per page using only verified fields | Correct, attractive link previews when shared on social/messaging apps; eligibility for rich results in search | Low | None (JSON-LD is a few hundred bytes) | No — used only verified data |
| 3 | Repo root | No `robots.txt` | Add a minimal `robots.txt` (`User-agent: * / Allow: /`) | Crawlers get an explicit allow instead of defaulting to guesswork | Trivial | None | No |
| 4 | `menu.html` | Header is missing the sticky-shadow-on-scroll script that all 4 other pages have — scrolling on Menu doesn't add the header shadow like every other page does | Add the same `window.addEventListener('scroll', …)` block and shadow-transition class used elsewhere | Visual consistency across pages | Trivial | None | No |
| 5 | about/menu/gallery/contact `.reveal` CSS | Reveal-on-scroll timing drifts with no apparent intent: index.html uses `24px`/`0.7s`, about/gallery/contact use `22px`/`0.65s`, menu.html uses `20px`/`0.6s` | Standardize all pages to index.html's values (most-used shape) | One consistent "feel" to scroll reveals sitewide instead of a subtly different one per page | Low | None | No |
| 6 | All 5 pages, most `<img>` tags | No `loading="lazy"` anywhere — every image (dish cards, gallery tiles, story frames, footer logos) loads eagerly regardless of position | Add `loading="lazy"` to all below-the-fold images; keep hero/first-viewport images eager | Faster initial page load, less wasted bandwidth on content the visitor may never scroll to | Low | Improves performance | No |

## High-impact improvements

| # | Page/Component | Problem | Solution | Benefit | Difficulty | Perf impact | New content needed? |
|---|---|---|---|---|---|---|---|
| 1 | `about.html` | Zero images across the entire page — four consecutive text/card sections (positioning hero, British/Mediterranean split, personality grid, core values, CTA) with no photography anywhere, making it the flattest page on the site | Add an image to the British Roots / Mediterranean Character split panel using existing, currently-unused `assets/img/` photography | Breaks up a text-heavy page, reinforces the food/place connection, uses assets already paid for and shot | Low | Negligible (one lazy image) | No — existing assets only |
| 2 | All 5 pages | No structured data for the business itself | `CafeOrCoffeeShop` JSON-LD (see Critical #2) | Same as above — listed twice because it serves both an SEO and a trust/discoverability purpose | — | — | — |

## Visual enhancements / polish

| # | Page/Component | Problem | Solution | Benefit | Difficulty | Perf impact | New content needed? |
|---|---|---|---|---|---|---|---|
| 1 | about/menu/gallery/contact Tailwind config | `spacing: {18: '4.5rem'}` token only exists in index.html's config, not the other 4 — harmless today since it's unused elsewhere, but a trap if a future edit assumes it's globally available | Add the token to all 5 configs for consistency | Prevents a future silent bug | Trivial | None | No |
| 2 | All 5 pages | `brand.freshgreen` (#41AD49) and `brand.gold` (#CC872E) are declared in every page's color config but never used by any class | Leave as-is — flagging only | Not a bug; likely intentionally reserved for future menu tags/promo badges | — | — | — |

## Optional future ideas (need info/assets/decisions this pass doesn't have)

| # | Item | What's needed | Why it wasn't done now |
|---|---|---|---|
| 1 | Contact form real delivery address | The business's actual monitored email | `contact.html`'s mailto target (`hello@olympiccafe.co.uk`) is an unverified placeholder from the original build. Per user instruction this pass, left as-is and re-flagged rather than guessed. |
| 2 | Canonical URLs, `og:url`, `sitemap.xml` | A live domain | Site has no deployed domain yet, so absolute URLs would be fabricated. Add these once the domain is known. |
| 3 | ~~`openingHours` in the JSON-LD schema~~ | ~~Specific daily open/close times~~ | **Resolved 2026-08-01**: user supplied verified hours (Mon–Sat 5:30am–5pm, Sun 6am–4pm). Added to `openingHoursSpecification` in all 5 pages' JSON-LD, the footer on all 5 pages, and the Hours info-card on `contact.html`. |
| 4 | Vegetarian tags on the menu | Business confirmation | Already flagged in project memory as the assistant's own inference from ingredients, not verified — out of scope for this pass, not re-litigated. |
| 5 | Shared CSS/JS build step | A decision to change `CLAUDE.md`'s single-file-page architecture | Current duplication (nav/footer/buttons/reveal CSS/hero-reveal JS repeated per page) is a deliberate project convention, not a bug — flagged only in case priorities change. |

---

## What was implemented this pass

See the end-of-task summary message for the final list of files changed and verification results.
