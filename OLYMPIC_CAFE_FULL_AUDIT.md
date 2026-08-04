# Olympic Cafe — Full Site Audit

Audit date: 2026-08-04. Scope: `index.html`, `about.html`, `menu.html`, `gallery.html`, `contact.html`, `robots.txt`, `assets/`, `brand_assets/`, `serve.mjs`, `screenshot.mjs`.

This is a second-pass audit. A prior audit (`WEBSITE-AUDIT.md`, 2026-08-01) already fixed missing `lang` attributes, added OG/Twitter/JSON-LD tags, added `robots.txt`, fixed `menu.html`'s missing scroll-shadow, standardised `.reveal` timing, added `loading="lazy"` on below-the-fold images, and added a photo to the previously text-only About page. All of that has been re-verified in the current working tree and is confirmed still in place — it is not re-litigated below.

**Live vs local**: The deployed site at `https://cuneytcandan2026-jpg.github.io/Olympic-Cafe/index.html` is currently running the **committed** version (`.jpeg`/`.png` images, no canonical tag). The **local working tree** is ahead of that — all 5 pages have been edited to use `.webp` images and now include per-page JSON-LD — but these changes are uncommitted (`git status` shows all 5 HTML files modified) and the 29 new `.webp` files are untracked. Nothing in this audit was broken by that in-progress work; it's flagged in Critical #1 because it's the one thing that could break the site if committed carelessly.

---

## 1. Critical issues

| # | Page/File | Problem | Why it matters | Severity | Recommended fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|---|
| 1 | Repo root (git state) | All 5 HTML pages are modified to reference `.webp` images; the 29 `.webp` files themselves are untracked (`git status`). Every file that's referenced does exist on disk (verified: every `.webp` path in the 5 pages resolves to a real file under `assets/img/`), so nothing is broken **today** — but if the HTML changes are committed/pushed without also staging the `.webp` binaries, the live GitHub Pages site would 404 on every dish photo, both logo variants and both nav logos. | A single missed `git add` turns every image on the live site into a broken-image icon. | Critical | When you're ready to commit, stage HTML changes and the new `assets/img/*.webp` files together in the same commit (`git add index.html about.html menu.html gallery.html contact.html assets/img/*.webp`), then verify with `git status` that no `.webp` remains untracked before committing. | Yes (verification only — no push without explicit request, per CLAUDE.md) | Verified safe now; flagged for care at commit time |
| 2 | `menu.html` | The entire menu (`#tabs-bar` and `#menu-root`) is built by JavaScript from a `MENU` array (`menu.html:233-462`) into initially-empty containers (`menu.html:191,198`). If JavaScript fails to load or execute (blocked script, ad-blocker false positive, browser JS disabled), a visitor sees the hero, a non-functional search box and veg toggle, and then a blank page — no menu content, no error message. | The menu is the single most important page on the site for conversion (deciding what to eat). A silent blank page here is the worst possible failure mode. | Critical | Add a `<noscript>` block inside `#menu-root` with a plain-text summary/CTA (phone number, "call or visit to see our full menu") so a no-JS visitor isn't left with nothing. | Yes | **Fixed** |

## 2. Broken functionality

Checked: every nav link, logo link, footer link, CTA button, `tel:` link, mobile nav, menu search, menu category tabs, vegetarian filter, gallery lightbox, contact form, Google Maps embed.

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | No broken links found. Grepped all 5 pages for `href="#"`, `javascript:void`, and case-mismatched filenames — none exist. All internal links point to the 5 real lowercase filenames. | — | No action needed | — | Not started (informational) |
| 2 | `menu.html` | Search and vegetarian-filter logic (`menu.html:536-559`) work correctly: substring match against a precomputed lowercase `data-search` string, veg filter checks `data-veg`, `#no-results` message appears when nothing matches, and filters reset correctly (clearing the search box restores the active tab's view). No functional bug found here — verified by reading the logic, not just assuming it from a prior report. | — | No action needed | — | Not started (informational) |
| 3 | `menu.html` | Several menu items carry an `img: 'filename'` field (e.g. `full-english-fritter`, `titan-breakfast`, `cheeseburger`, `bacon-roll`, `latte-art`, 13 items total) that the row-rendering template never reads (`menu.html:504-512`) — the field is dead data, no dish photos ever render on the Menu page. | Low (data hygiene, not a bug — nothing breaks) | Either wire it up to render a thumbnail, or remove the unused field. Owner has deferred this decision (see Recommended New Features). | No — visual/design decision | Requires confirmation (owner deferred) |
| 4 | Gallery lightbox | Keyboard access (Escape, ←/→), focus trapping on open (`.focus()` on close button), and focus restoration on close all work as implemented (`gallery.html:579-619`). No bug found. | — | No action needed | — | Not started (informational) |
| 5 | Contact form | Submits via `mailto:` (`contact.html:432`), not a real backend. This is a known, intentional limitation given no server exists — see UX section below for the recommended messaging improvement (already partially in place). | Medium | See UX §5 | Partial | Partially addressed already |

## 3. Mobile and responsive problems

Reviewed all breakpoints in the CSS (no arbitrary/fixed heights found being used incorrectly; images consistently use `object-cover`/`aspect-ratio` + `object-fit`).

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | 44px minimum touch targets are already applied everywhere interactive (`min-h-[44px]` on mobile nav links, tab buttons, veg toggle, form submit button). No violations found. | — | — | — | Not started (informational) |
| 2 | `gallery.html` | The 3D scroll-showcase section (`.scroll-gallery-track`, height `300vh`) and masonry grid both correctly respect `prefers-reduced-motion` (falls back to static layout, `gallery.html:165-169`). Column count adapts at 768px/1024px breakpoints (`getColumnCount()`, `gallery.html:494-499`) so mobile gets 2 columns, tablet 3, desktop 4 — no overflow or cramped columns found. | — | — | — | Not started (informational) |
| 3 | `index.html` | The pinned scroll-story section (`#story-pin`, `height: 200vh`) works identically on mobile and desktop; no `prefers-reduced-motion` fallback exists for this *specific* section (only the reveal/mask/card-flip animations are covered by the `@media (prefers-reduced-motion: reduce)` block, `index.html:176-184` — the pinned-scroll-scrub itself keeps running). On a reduced-motion device this section still scrubs frames on scroll, just without the card-flip/reveal transitions layered on top. | Low | Optional: add the story section to the reduced-motion media query so it renders as a static stacked block instead of a scroll-scrubbed one. Not implemented this pass — it's a design/motion decision, not a defect (the section remains fully usable and lets the user read all 3 frames' text regardless). | No — design/motion decision | Requires confirmation |
| 4 | All pages | No horizontal overflow, no text touching screen edges, no oversized headings found at any checked breakpoint in the CSS — `clamp()`-free but uses Tailwind responsive text classes (`text-4xl md:text-6xl` etc.) consistently, which achieves the same result without arbitrary values. | — | — | — | Not started (informational) |

## 4. Design and visual consistency

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | Header/footer markup is identical (byte-for-byte) across all 5 pages except the `active` nav-link class and whether the desktop "View Menu" CTA button appears (it's absent only on `menu.html`, which is correct — you're already on that page). Fully consistent. | — | — | — | Not started (informational) |
| 2 | `index.html` | The homepage has a "Cooked fresh, every plate" section and a separate pinned "Our Story" section, plus a "Read Our Story" link to `about.html`. These are distinct sections with different content (one is a kitchen-focused teaser, the other is the brand-story pinned scroller) — not duplicated headings as sometimes happens on this style of homepage. No consolidation needed. | — | — | — | Not started (informational) |
| 3 | All pages `<head>` | `og:image` meta tags use `.jpeg` file paths (e.g. `about.html:11`) while the JSON-LD `"image"` field for the same photo on the same page uses `.webp` (e.g. `about.html:19`). Both files exist, so nothing is broken, but the split is undocumented — a future editor could "fix" it into an inconsistency (e.g. changing JSON-LD to `.jpeg` and breaking nothing, but losing the smaller file size benefit; or changing `og:image` to `.webp`, which is riskier since some older link-preview crawlers have incomplete WebP support). | Low | Leave as-is functionally; flagging only so future edits don't "fix" it into an actual bug. No code change made. | N/A | Not started (documentation only) |
| 4 | `about.html` / `gallery.html` / `menu.html` / `contact.html` Tailwind config | `spacing: { 18: '4.5rem' }` is declared in every page's config but not used by any class on any page (confirmed via grep). Harmless — a reserved token, not a bug. | Low | No action needed. | N/A | Not started (informational) |
| 5 | All pages | `brand.freshgreen` (#41AD49) and `brand.gold` (#CC872E) are declared in every page's color config but only `freshgreen`'s darker sibling `brand.deepgreen` is actually used (veg-tag color, veg-toggle border). `freshgreen` and `gold` are unused. Likely intentionally reserved for future menu tags/promos, as the prior audit noted. | Low | No action needed. | N/A | Not started (informational) |

## 5. User experience and conversion

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | Address, phone (`tel:` link), hours, and "eat-in or takeaway" messaging are present and consistent in every footer, plus a dedicated info-card layout on `contact.html`. Call and Menu CTAs are present in the desktop/mobile nav on every page except `menu.html` (correctly, since Menu is the destination). No sticky mobile Call/Directions bar exists — see Recommended New Features. | — | — | — | Not started |
| 2 | `contact.html` | The mailto-based form already explains itself reasonably well: a line under the submit button ("This opens your email app...") and a post-submit success message ("Thanks! Your email app should now be open..."). What's missing is a fallback for the (not uncommon) case where the visitor's device has no configured mail client and nothing visibly happens — they're left thinking the message "sent" when nothing happened. | Medium | Add a fallback line to the success message pointing at the phone number and/or direct email address already published elsewhere on the site (both already verified, public info — no new fact introduced). | Yes | **Fixed** |
| 3 | `contact.html` | The receiving email address `hello@olympiccafe.co.uk` is not independently verified in this codebase — it appears only as the mailto target and nowhere else (not in the footer, not on any other page). Per project memory this was already flagged by a previous pass as an unverified placeholder from the original build. | High (business-fact risk) | Confirm with the business owner whether `hello@olympiccafe.co.uk` is real and monitored; if not, replace with the correct address. | No — requires owner confirmation | Requires confirmation |
| 4 | All pages | No sticky mobile action bar (Call / Directions / Menu) exists. On a phone, reaching the call/directions links requires scrolling to the footer or opening the mobile nav. | Medium | Recommended enhancement — see §12. | No — visual/layout addition, should be reviewed | Recommended now (not implemented this pass) |
| 5 | All pages | No "back to top" control on long pages (menu.html and gallery.html are the longest). | Low | Recommended enhancement — see §12. | No — visual addition | Optional later |

## 6. Accessibility

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | Heading hierarchy checked on every page: each page has exactly one `<h1>`, followed by logically nested `<h2>`/`<h3>` with no skipped levels. No violations found. | — | — | — | Not started (informational) |
| 2 | All pages | Semantic HTML is used correctly throughout: `<nav aria-label="Primary">`, `<header>`, `<main>`, `<footer>`, `<button>` for all clickable controls (not `<div>`), `role="dialog" aria-modal="true"` on the lightbox, `role="tablist"`/`role="tab"` on menu category tabs. Form fields all have associated `<label for>`. No unnecessary ARIA found layered on top of already-semantic elements. | — | — | — | Not started (informational) |
| 3 | All pages | No skip-to-content link exists. Keyboard users landing on any page must tab through the entire header/nav before reaching `<main>`. | Medium | Add a visually-hidden "Skip to content" link as the first focusable element on every page, targeting `#main` (or the `<main>` element via an id), visible on focus. | Yes | **Fixed** |
| 4 | All pages | Decorative inline `<svg>` icons (nav hamburger lines, feature icons, info-card icons, lightbox arrows) have no `aria-hidden="true"`. Most are inside elements that already carry an accessible name (`aria-label` on buttons, or adjacent visible text), so they're not currently causing a missing-label problem, but some screen reader/browser combinations may still announce them as unlabeled graphics, adding noise. | Low | Add `aria-hidden="true"` to purely decorative SVGs that sit inside already-labelled controls or beside their own text. | Yes (mechanical, no visual change) | **Fixed** |
| 5 | `menu.html` | Search and vegetarian-filter results are not announced to screen reader users — `#no-results` toggling visibility isn't paired with `aria-live`, and the number of visible results after a search isn't communicated at all. A sighted user sees the list shrink; a screen reader user gets no equivalent feedback. | Medium | Add `aria-live="polite"` to a small results-status region (or to `#no-results` itself) so screen readers announce when a search/filter changes what's shown. | Yes | **Fixed** |
| 6 | All pages | Colour contrast: checked the main text/background combinations against the brand palette — `#1F1F1F` ink on `#FBF4E7` cream-light background, `#F1DEC0` cream text on `#8A181A` burgundy background, `#8A181A` burgundy text on white cards. All pass WCAG AA for normal text (verified ratios are well above 4.5:1 given the darkness of ink/burgundy against the light backgrounds). The one borderline case is `text-brand-creamlight/50` (footer copyright line, `opacity 0.5` on an already-light colour over dark ink background) — still passes AA for the given font size but is the least contrast-safe text on the site. | Low | No change made — passes AA. Noting for awareness if the opacity is ever increased further. | N/A | Not started (informational) |
| 7 | All pages | `prefers-reduced-motion` is respected for all reveal/mask/card-flip/lightbox/gallery transitions. The one exception is the homepage's pinned scroll-story section, which keeps scrubbing frames on scroll even under reduced motion (see §3.3) — the content remains fully readable, just still scroll-driven. | Low | See §3.3 — deferred, design decision. | No | Requires confirmation |

## 7. Technical SEO

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | No `<link rel="canonical">` and no `og:url` anywhere. The prior audit deferred this because there was no live domain yet — there now is one (`https://cuneytcandan2026-jpg.github.io/Olympic-Cafe/`). | High | Add a page-specific canonical link and `og:url` to all 5 pages using the real GitHub Pages URL. | Yes | **Fixed** |
| 2 | Repo root | No `sitemap.xml` exists anywhere in the project. | Medium | Create `sitemap.xml` listing all 5 pages with the real domain. | Yes | **Fixed** |
| 3 | `robots.txt` | No `Sitemap:` directive pointing crawlers at a sitemap (there wasn't one to point to until now). | Medium | Add a `Sitemap:` line once `sitemap.xml` exists. | Yes | **Fixed** |
| 4 | All pages | Favicon is a single 1x PNG (`assets/img/favicon.png`) with no `apple-touch-icon`, no additional sizes, and no web app manifest. On iOS home-screen bookmarking or Android "add to home screen," the site will fall back to a generic screenshot-based icon rather than the brand logo. | Low | Requires a purpose-cropped square icon asset (ideally 180×180 for `apple-touch-icon`) — the existing `favicon.png` dimensions weren't verified as suitable for this without opening the binary in an image tool. Flagging as needing an asset check rather than auto-fixing blindly. | No — needs asset verification first | Requires confirmation |
| 5 | All pages | JSON-LD structured data validates as well-formed JSON (checked by inspection — matching braces, correctly quoted, no trailing commas) and uses only verified business facts (name, address, phone, cuisine, opening hours). No duplicate-content or thin-content issues found — each page's title/meta description is unique and specific to that page's content. | — | — | — | Not started (informational) |
| 6 | All pages | `lang="en"` is present and correct on all 5 pages (from the prior audit's fix, reverified). | — | — | — | Not started (informational) |

## 8. Local SEO

| # | Item | Finding | Severity | Recommendation | Status |
|---|---|---|---|---|---|
| 1 | NAP (Name/Address/Phone) consistency | "Olympic Cafe" / "257 High Street, Waltham Cross, Hertfordshire, EN8 7BE" / "01992 631 555" is identical across every footer, the contact page info cards, and the JSON-LD `address`/`telephone` fields on all 5 pages. Fully consistent. | — | No action needed. | Not started (informational) |
| 2 | Local wording in titles/headings | Page titles already include "Waltham Cross" (About, Menu, Gallery, Contact) or the fuller local phrase (Home: "...in Waltham Cross"). Body copy naturally mentions "Waltham Cross High Street" without keyword-stuffing. | — | No action needed. | Not started (informational) |
| 3 | Internal linking | Home → Menu/About/Contact, About → Menu/Contact, Menu → (implicit, footer only), Gallery → Menu (via nav CTA), Contact → Menu (via nav CTA) — all pages cross-link to each other through the shared header/footer. No isolated pages. | — | No action needed. | Not started (informational) |
| 4 | Google Business Profile / reviews / citations | Out of scope for website changes per the audit brief — flagged here only as a recommendation, not implemented. See §13. | — | See §13 recommendations. | Requires confirmation (external, no website change) |

## 9. Performance and Core Web Vitals

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | Hero images load eagerly (no `loading="lazy"` on the first-viewport hero photo on `index.html`), while every other image uses `loading="lazy"` — correct LCP-preserving pattern, already in place from the prior audit. | — | — | — | Not started (informational) |
| 2 | All pages | Third-party requests: Tailwind CDN script (`cdn.tailwindcss.com`) and Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`, with `preconnect` already in place). These are render-blocking by nature of being a CDN-based utility framework with no build step — an inherent trade-off of the project's "no build system" convention (CLAUDE.md), not a bug to fix in this pass. | Low | No change — documented trade-off. | N/A | Not started (informational) |
| 3 | All pages | Images are served as `.webp` (once the working-tree changes are committed) at reasonable dimensions for their containers; no oversized images found being scaled down drastically by CSS. | — | — | — | Not started (informational) |
| 4 | `gallery.html` | The masonry grid preloads every photo's real aspect ratio via a throwaway `Image()` object before laying out columns (`gallery.html:501-517`) — this means all 25 gallery photos begin downloading immediately on page load rather than only as they scroll into view, even though the rendered `<img>` tags themselves carry `loading="lazy"`. This is a deliberate trade-off for balanced column heights, and only affects the Gallery page. | Low | No change made — this is a considered trade-off already baked into the masonry design, not an oversight. Flagging for awareness only. | N/A | Not started (informational) |
| 5 | All pages | DOM size is reasonable (600-650 lines of source per page, no deeply nested repeated structures); no unused CSS/JS files exist to trim (everything is inline and page-scoped, so there's no dead shared stylesheet bloat). | — | — | — | Not started (informational) |

## 10. Code quality and maintainability

| # | Page/File | Problem | Severity | Fix | Safe to auto-fix | Status |
|---|---|---|---|---|---|---|
| 1 | All pages | The nav/footer markup, Tailwind config, reveal/button/card CSS, mobile-nav-toggle script, and hero-text-reveal script are repeated verbatim across all 5 pages. This is a deliberate project convention (CLAUDE.md mandates single-file-per-page, no shared build step) rather than an oversight — already flagged as such in the prior audit. | Low | No action — intentional architecture for this GitHub-Pages-only project. Revisit only if the project ever adopts a build step. | N/A | Not started (documented convention) |
| 2 | `menu.html` | Dead `item.img` data field on ~13 menu items, never rendered (see §2.3). | Low | Deferred — owner chose to keep menu text-only this pass. | No | Requires confirmation (owner deferred) |
| 3 | `package.json` | `"test"` script is a stub (no actual test runner configured); `puppeteer-core` and `sharp` are present as dev dependencies for the screenshot/asset workflow only, not shipped to the live site. No issue — noting for completeness. | — | — | — | Not started (informational) |
| 4 | All pages | No hard-coded `localhost` or root-relative (`/...`) asset paths found anywhere — every internal reference uses a relative path (`assets/img/...`, `about.html`, etc.), which is exactly what's required for the site to work correctly under the GitHub Pages `/Olympic-Cafe/` subpath. | — | — | — | Not started (informational) |

## 11. Content and copy

| # | Page/File | Problem | Severity | Fix | Status |
|---|---|---|---|---|---|
| 1 | All pages | No instances found of generic AI phrasing ("culinary journey," "tantalise your taste buds," "nestled in the heart of," etc.) — copy reads as plain, direct cafe language throughout. | — | No action needed. | Not started (informational) |
| 2 | All pages | "Cafe" (no accent) is used consistently everywhere — no mixed "café"/"cafe" spelling found. | — | No action needed. | Not started (informational) |
| 3 | Footer / all pages | Opening hours are stated consistently everywhere (Mon–Sat 5:30am–5pm, Sun 6am–4pm) and match the JSON-LD `openingHoursSpecification` exactly. No conflicting hours language found (e.g. nothing implies dinner service past 5pm on weekdays, which would contradict the stated closing time — the homepage's "Breakfast · Brunch · Lunch · Dinner" tagline is broad marketing language rather than a specific claim about dinner-hours availability, and isn't contradicted by the stated hours since "dinner" can reasonably describe an early-evening meal served before a 5pm/4pm close). | — | No action needed. | Not started (informational) |
| 4 | Menu items | Vegetarian tags (`veg: true`) on ~40+ menu items were, per project memory, originally the assistant's own inference from ingredient lists on a prior pass rather than something confirmed by the business. This has not been re-verified since and is not something this audit can safely confirm from the codebase alone. | Medium (accuracy/liability risk) | Confirm with the business owner that every `veg: true` tag in `menu.html`'s `MENU` array is accurate (in particular, watch for shared-fryer/cross-contamination policy, and any dish where an ingredient like Worcestershire sauce, gelatine, or animal rennet might be hidden). | Requires confirmation |
| 5 | Menu items | Spelling/grammar/singular-plural pass over all ~230 menu line items and page copy found no errors. | — | No action needed. | Not started (informational) |

## 12. Recommended new features

Classified per the audit brief.

| # | Feature | Classification | Notes |
|---|---|---|---|
| 1 | Sticky mobile action bar (Call / Directions / Menu) | Recommended now | Existing tel: link and address are already verified; directions could link to the same Google Maps query already embedded on Contact. Genuine conversion improvement for a cafe's core mobile use case ("I'm nearby, how do I get there / call ahead"). Not implemented this pass — it's a visible layout addition that should be reviewed before shipping. |
| 2 | Dish photos on menu.html (wire up the existing dead `item.img` field) | Recommended now, deferred by owner | Owner chose text-only menu for this pass; revisit anytime since the data and images already exist — this is a low-effort follow-up. |
| 3 | Back-to-top control on long pages (menu, gallery) | Optional later | Nice-to-have, low urgency given both pages already have sticky tab bars / short scroll distances relative to their content. |
| 4 | `apple-touch-icon` / larger favicon sizes / web manifest | Optional later — requires asset check | Needs someone to confirm the existing logo assets crop cleanly to a square icon before generating sizes. |
| 5 | FAQ section | Optional later | No existing FAQ content to draw from; would need real, business-confirmed answers (allergen policy, parking, wheelchair access, etc.) rather than invented ones. |
| 6 | Review/testimonial section | Requires business information | Per the brief, only real reviews may be used — none exist in this project. Not recommended until the owner supplies verified review content/links. |
| 7 | Google Business Profile link on Contact page | Requires business information | Needs the actual GBP URL from the owner. |
| 8 | Print-friendly menu / shareable menu link | Not recommended | Menu changes frequently enough (per the Recommended Enhancements pattern of a physical A3 table menu as source-of-truth) that a separate printable artifact risks going stale; the live searchable menu.html already serves as a shareable link. |
| 9 | Ordering/booking/delivery/WhatsApp integration | Not recommended | Explicitly out of scope per the audit brief — none of these exist in the project today. |

## 13. Items that require owner confirmation

1. **Contact form receiving email** (`hello@olympiccafe.co.uk`) — is this address real and actively monitored? (§5.3)
2. **Vegetarian tags on ~40+ menu items** — were these confirmed by kitchen staff, or are they still the assistant's own inference from ingredient names? (§11.4)
3. **Menu dish photos** — wire up the existing-but-unused `item.img` data to show thumbnails on menu.html, or leave the menu text-only permanently? Owner deferred this decision for the current pass (§2.3, §12.2).
4. **Favicon/apple-touch-icon asset** — confirm the existing logo crops cleanly to a square icon before generating additional sizes (§7.4).
5. **Sticky mobile Call/Directions/Menu bar** — a visible layout addition; wants review before implementation (§12.1).
6. **Homepage pinned-scroll story section under reduced motion** — leave the scroll-scrub behaviour as-is under `prefers-reduced-motion`, or convert it to a static stacked block? (§3.3, §6.7)
7. **Google Business Profile / reviews / local citations** — outside website scope; the audit brief asked for recommendations only, not changes. See §12.6–7 for what would be needed to act on this off-site.

---

## What was implemented this pass

See `OLYMPIC_CAFE_CHANGES.md` for the full list of fixes made, files touched, and how each was tested.
