# Olympic Cafe — Changes Made (2026-08-04)

Companion to `OLYMPIC_CAFE_FULL_AUDIT.md`. Every fix below is a safe, non-subjective technical/accessibility/SEO fix — no business facts, prices, hours, or visual design were changed.

---

### 1. Added canonical URLs and `og:url`

- **Issue**: No `<link rel="canonical">` or `og:url` anywhere on the site. Previously deferred (no live domain existed at the time of the prior audit).
- **Fix**: Added a page-specific `<link rel="canonical">` and `<meta property="og:url">` to the `<head>` of all 5 pages, using `https://cuneytcandan2026-jpg.github.io/Olympic-Cafe/<page>.html`.
- **Files changed**: `index.html`, `about.html`, `menu.html`, `gallery.html`, `contact.html`.
- **How tested**: Grepped each file to confirm exactly one canonical link and one `og:url` per page, each pointing at the correct page.
- **Trade-offs**: None. If the business ever moves to a custom domain, these five URLs (plus `sitemap.xml`) are the only places that would need updating.

### 2. Added `sitemap.xml` and a `Sitemap:` line in `robots.txt`

- **Issue**: No sitemap existed; `robots.txt` had no `Sitemap:` directive.
- **Fix**: Created `sitemap.xml` listing all 5 pages with the live domain; added `Sitemap: https://cuneytcandan2026-jpg.github.io/Olympic-Cafe/sitemap.xml` to `robots.txt`.
- **Files changed**: `sitemap.xml` (new), `robots.txt`.
- **How tested**: Read the file back and confirmed well-formed XML (matching `<urlset>`/`<url>`/`<loc>` tags, one entry per real page).
- **Trade-offs**: None.

### 3. Added a `<noscript>` fallback to the Menu page

- **Issue**: `menu.html` renders the entire menu via JavaScript into empty containers. With JS disabled or blocked, a visitor saw a blank page below the (non-functional) search bar — the single worst failure mode on the site, since the menu is the primary conversion page.
- **Fix**: Added a `<noscript>` block inside `<main>` with a plain-language explanation, the phone number as a `tel:` link, and the address, so a no-JS visitor still has a path to see the menu (by calling or visiting) instead of a dead end.
- **Files changed**: `menu.html`.
- **How tested**: Reviewed the markup placement (inside `<main>`, after `#menu-root`) to confirm it renders regardless of JS state; visually verified the JS-enabled experience is unaffected (browsers ignore `<noscript>` content when JS is enabled).
- **Trade-offs**: This is a message, not a full static menu rebuild — a visitor without JS still can't browse/search the menu on-page. A full static fallback would require duplicating ~230 menu lines into server-rendered HTML, which is a larger change than this pass's safe-fix scope; flagged as a possible future improvement if no-JS traffic becomes a real concern.

### 4. Added a skip-to-content link on every page

- **Issue**: No skip-to-content link existed; keyboard users had to tab through the entire header/nav on every page before reaching the main content.
- **Fix**: Added a visually-hidden-until-focused "Skip to content" link as the first element inside `<body>` on all 5 pages, targeting a new `id="main-content"` on each page's `<main>` element. Uses Tailwind's built-in `sr-only`/`focus:not-sr-only` utilities — no custom CSS needed.
- **Files changed**: `index.html`, `about.html`, `menu.html`, `gallery.html`, `contact.html`.
- **How tested**: Confirmed the link is the first focusable element after `<body>` and that each `<main>` now has a matching `id="main-content"`.
- **Trade-offs**: None — invisible until a keyboard user tabs to it.

### 5. Added `aria-hidden="true"` to decorative inline SVG icons

- **Issue**: Every inline `<svg>` icon (hamburger, nav/footer icons, feature icons, search icon, veg-toggle leaf, lightbox arrows, info-card icons) lacked `aria-hidden="true"`. Most sit inside elements that already have an accessible name (a labelled button, or adjacent visible text), so this wasn't a missing-label bug, but some screen reader/browser combinations could still announce them as unlabeled graphics — extra noise for screen reader users.
- **Fix**: Added `aria-hidden="true"` to all inline SVG icons across all 5 pages (mechanical, uniform change — every `<svg>` on the site is purely decorative; none carry unique information not already stated in adjacent text or an `aria-label`).
- **Files changed**: `index.html`, `about.html`, `menu.html`, `gallery.html`, `contact.html`.
- **How tested**: Grepped for `aria-hidden="true"` counts per file after the change (6/3/3/4/4 respectively, matching the number of inline SVGs found in each file during the audit read-through).
- **Trade-offs**: None — no visual change, `aria-hidden` only affects assistive-technology announcement.

### 6. Added screen-reader announcements for menu search/filter results

- **Issue**: The Menu page's search and "Vegetarian only" filter update what's visible on screen, but nothing was announced to screen reader users — a sighted user sees the list shrink or the "No dishes match" message appear; a screen reader user got no equivalent feedback.
- **Fix**: Added a visually-hidden `#filter-status` region with `role="status" aria-live="polite"`. When a search query or the vegetarian filter is active, it's updated with either a result count ("12 dishes found.") or "No dishes match your search."; it's cleared when no filter is active (so switching tabs on the default view doesn't spam announcements).
- **Files changed**: `menu.html`.
- **How tested**: Traced the updated `applyFilters()` logic (now also counts `visibleCount` as it toggles row visibility) to confirm the status text updates correctly on both search input and vegetarian-checkbox changes, and clears when filters are reset.
- **Trade-offs**: None — invisible to sighted users, announced only via assistive technology's live-region handling.

### 7. Added a fallback line to the contact form's success message

- **Issue**: The `mailto:`-based contact form already explained itself reasonably well (a note under the button, and a post-submit success message), but if a visitor's device has no configured mail client, clicking "Send Message" silently does nothing visible beyond the success message — which could read as if the message had actually been sent.
- **Fix**: Extended the existing success message to include a direct fallback: the same, already-published email address and phone number, both of which already appear elsewhere on the site (footer, info cards) — no new fact was introduced.
- **Files changed**: `contact.html`.
- **How tested**: Confirmed the added text reuses exactly the existing `hello@olympiccafe.co.uk` and `01992 631 555` values already present elsewhere in the file, so no new/unverified information was introduced.
- **Trade-offs**: The underlying email address is still an unverified placeholder per project history (see audit §5.3/§13.1) — this fix improves messaging around the existing mechanism, it doesn't and can't verify whether that inbox is real or monitored. That remains an open item for the business owner.

---

## Files modified this pass

- `index.html`
- `about.html`
- `menu.html`
- `gallery.html`
- `contact.html`
- `robots.txt`
- `sitemap.xml` (new)
- `OLYMPIC_CAFE_FULL_AUDIT.md` (new)
- `OLYMPIC_CAFE_CHANGES.md` (new, this file)
- `OLYMPIC_CAFE_TEST_CHECKLIST.md` (new)

## Explicitly not changed this pass

- Any price, opening hours, address, phone number, or other business fact.
- The contact form's receiving email address or delivery mechanism (still `mailto:`; still unverified — see audit §13.1).
- Vegetarian tags on menu items (still unverified — see audit §13.2).
- Menu item photos (`item.img` field remains unused — owner deferred this decision, see audit §13.3).
- Any visual/design change, colour, spacing, or layout.
- No commit or push was made — per `CLAUDE.md`, changes are left staged in the working tree for the user to review and commit themselves.
