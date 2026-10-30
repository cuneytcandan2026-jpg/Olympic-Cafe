# Olympic Cafe website: handover

Status: built and tested locally on branch `site-audit-improvements`. **Not published.** Production only changes when this branch is merged to `master` and pushed.

To review: run `npm install`, then `npm run preview`, then open http://localhost:3000. Screenshots are in `docs/preview/`.

## 1. What changed

**Contact**
- GitHub Pages can't run server code, so a server-side form needs a separate endpoint. A ready-to-deploy Cloudflare Worker is in `workers/contact/`, with validation, honeypot, optional Turnstile and server-side secrets.
- It can't go live without accounts and a confirmed inbox, so the site currently shows **phone and email only, with no form**. It never shows a fake success.
- Once an endpoint is set, a rebuild turns the form on. It has accessible errors, says "sent" only after the endpoint confirms delivery, and keeps the visitor's text on any failure.

**Menu**
- All 22 categories and 222 items are in the initial HTML, generated from one data file (`src/data/menu.mjs`). The homepage prices come from the same file.
- Search covers all categories. There is an "All categories" option, shareable links such as `/menu.html#brunch`, and an empty state with a reset.
- Mobile uses a dropdown and desktop uses category links. Choosing a category lines up the results under the sticky bars instead of jumping to the top. The incomplete ARIA tabs are gone.
- Checked against the printed A3 menu. Added 25 items and add-on notes the site had left out, such as Red Bull, Herbal Tea and Liver. Removed a "Baguette" entry and an Extras "Chips" entry that aren't in the printed list.

**Vegetarian labels: this will look like a big reduction**
- The printed menu has no vegetarian marks, only the Veggie Breakfast section and items named "Veggie".
- About 100 labels on the old site were guesses from ingredients, and one was wrong: "Egg, Cumberland Sausage & Chips".
- Only 5 labels remain (Veggie Set 1 to 3, Veggie Burger, Meal 4). The other 81 likely candidates are kept in the data file as `vegCandidate` and take seconds to switch on once confirmed.

**Header and layout**
- Header reduced from 112/160px to 68/76px, driven by one `--header-h` variable that also sets sticky positions, scroll padding and anchor offsets.
- Desktop navigation now appears at 1100px, tested for collisions from 320 to 1440px.
- Mobile action bar for Menu, Call and Directions, with safe-area spacing. It steps aside while typing.
- Header and menu bar scroll away on short screens (landscape, 200% zoom).
- Removed the pinned story, 3D gallery, card flips and word-by-word reveals. Reduced the repeated values sections.
- Gallery is a simple grid with visible captions.

**Accessibility**
- Small terracotta text darkened, and burgundy-on-terracotta panel replaced.
- Lightbox now uses a native modal dialog: hidden when closed, focus kept inside when open, Escape works, focus restored on close.
- Content is visible by default if JavaScript fails. Touch targets are 44px or more, inputs 16px, with autocomplete and clear focus rings.

**SEO**
- One H1 per page and logical headings. Internal links use `/`.
- Schema now has a stable `@id`, URL and menu link. No ratings or reviews.
- New 1200x630 JPEG share images, and a custom 404 page.
- "Dinner" and "night owls" removed from all site text.

**Performance**
- Runtime Tailwind CDN replaced by a 25KB compiled file.
- Fonts self-hosted and reduced from 9 styles to 4.
- Header logo reduced from 271KB to 9KB (retina version 23KB).
- Photos served at 480, 800 and 1200px with `srcset`, explicit dimensions, a prioritised hero and lazy loading below the fold.

**Corrected from the photos**
- The homepage "Black Ring" photo actually shows the Red Ring ingredients, so the card now shows Red Ring (same price, £12.50).
- "Avocado toast with brie" is Sicily Coast (feta).
- "Egg Royal" shows ham, so it is captioned Egg Benedict.

**Exposed files found**
- The live site currently serves `CLAUDE.md`, the audit documents, `serve.mjs`, `package.json` and everything in `brand_assets/`.
- A new `_config.yml` stops these being published. The repository itself is still public.

## 2. Lighthouse results

Median of 3 runs per page and device, Lighthouse 12.8.2 in headless Chrome. Mobile uses the default simulated slow 4G and 4x CPU slowdown. Desktop uses the desktop preset.

Before and after were both served from the same local server, with gzip and a 10-minute cache to match GitHub Pages. "Before" is the current `master` code.

| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | Page weight |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Mobile | 66 → 96 | 100 → 100 | 100 → 100 | 100 → 100 | 7.5s → 2.7s | 1384 → 401 KB |
| Home | Desktop | 94 → 100 | 100 → 100 | 100 → 100 | 100 → 100 | 1.5s → 0.6s | 2208 → 286 KB |
| Menu | Mobile | 71 → 99 | 97 → 100 | 100 → 100 | 100 → 100 | 5.2s → 1.7s | 819 → 130 KB |
| Menu | Desktop | 97 → 100 | 97 → 100 | 96 → 100 | 100 → 100 | 1.1s → 0.4s | 827 → 116 KB |
| Contact | Mobile | 64 → 99 | 95 → 100 | 100 → 100 | 100 → 100 | 8.2s → 1.8s | 1296 → 583 KB |
| Contact | Desktop | 97 → 100 | 95 → 100 | 96 → 100 | 100 → 100 | 1.1s → 0.4s | 1539 → 864 KB |
| Gallery | Mobile | 66 → 95 | 96 → 100 | 100 → 100 | 100 → 100 | 8.1s → 2.9s | 4758 → 568 KB |
| Gallery | Desktop | 92 → 100 | 96 → 100 | 96 → 100 | 100 → 100 | 1.7s → 0.8s | 5037 → 554 KB |
| About | Mobile | 70 → 99 | 95 → 100 | 100 → 100 | 100 → 100 | 5.6s → 2.1s | 925 → 227 KB |
| About | Desktop | 96 → 100 | 95 → 100 | 96 → 100 | 100 → 100 | 1.2s → 0.5s | 1205 → 212 KB |

Limitations:
- These are local lab results with no real network latency to the site, so live scores will differ. Re-measure after deployment. Raw summaries are in `docs/lighthouse-before.json` and `docs/lighthouse-after.json`.
- A Lighthouse accessibility score of 100 covers automated checks only and doesn't prove WCAG conformance.
- Contact page weight includes the Google Maps embed, which isn't ours to optimise.
- Scores say nothing about rankings, and none are promised.

## 3. Test results

`npm test` passes **398 of 398** checks in real Chrome (`docs/test-results.json`).

| Area | Covered |
| --- | --- |
| Links | All internal URLs, anchors, images, real 404s, `tel:` and directions links |
| Menu | Search, categories, vegetarian filter, reset, empty states, shared links, browser back |
| No JavaScript | All 222 items readable, category anchors work, navigation reachable |
| Header and sticky | 12 widths from 320 to 1440px: height, sticky offset, collisions |
| Layout | 5 pages at 320, 375, 390, 430, 768, 1440, two landscape sizes and 200% zoom equivalent: overflow, action bar clearance |
| Keyboard and dialog | Mobile nav, lightbox focus trap, Escape, focus restoration |
| Reduced motion | No smooth scroll or reveals |
| Contact | Validation, provider failure, offline endpoint, honeypot, success, kept text, and the Worker directly with a simulated mail provider |
| Images | No missing images, dimensions and alt text on all, layout shift under 0.1 |
| Metadata | Titles, canonicals, share images, sitemap, robots, JSON-LD parsing |
| axe | WCAG 2.2 AA and best-practice rules on all pages at 2 widths, plus 4 interactive states |

Also done by hand: every dish and price compared with the printed menu, and all screenshots reviewed.

**Not tested:**
- Real phones, or a screen reader such as VoiceOver or NVDA.
- Real email delivery.
- The `_config.yml` exclusions, which only take effect on GitHub's build.
- Browsers other than Chrome.
- 200% zoom was simulated with an equivalent 720x450 viewport.

Automated scans can't judge everything, so a quick pass on a real iPhone and Android phone is worthwhile before launch.

## 4. Owner to confirm

**Business details and wording**
- [ ] Address, phone and opening hours (Mon-Sat 5:30am-5pm, Sun 6am-4pm).
- [ ] **Dinner:** the site no longer mentions dinner, to match a 5pm close. The logo artwork, brand guidelines and printed menu still say "Breakfast - Brunch - Lunch - Dinner". The logo was left unchanged as instructed. Either the hours or the logo tagline should eventually change.
- [ ] "All day" in the headline is kept as you asked. Is it fine given the 5pm close?
- [ ] Is `info@olympiccafe.co.uk` monitored? The domain has mail records, but delivery hasn't been tested. It is left out of the schema until confirmed.
- [ ] Is the map pin and directions destination the right spot?

**Menu**
- [ ] Are the printed menu prices current? The site matches the A3 menu, which is undated.
- [ ] Which `vegCandidate` dishes are truly vegetarian? Cheese, Worcestershire sauce and frying oil can all matter here.
- [ ] Allergy wording on the menu page ("Please tell us before you order"). Please check it reflects how you handle allergens.
- [ ] Is "Bag" on the printed menu a baguette? The site says Baguette.
- [ ] Is the Sunday Roast still offered at these prices?
- [ ] Printed menu typos to fix at the next print: "Herdfordshire", "Cheery Pie", "Chesee", "streay".

**Content and claims**
- [ ] Are the three "Signature plates" the right dishes? I didn't call them "popular" because nothing verifies that.
- [ ] Do gallery captions and the Red Ring and Egg Benedict corrections match what's on the plates?
- [ ] Claims taken from the brand guidelines: "cooked to order", "homemade", "eat in or take away". Are they accurate?
- [ ] Real reviews: none were supplied, so there is no reviews section. Add genuine ones with permission to `REVIEWS` in `src/data/business.mjs` and the section appears.
- [ ] Story text is deliberately short and has no history claims. Send real history if you'd like it included.

## 5. Hosting and setup

| Item | Status | What's needed |
| --- | --- | --- |
| Contact form | Worker written and tested with a simulated provider, not deployed | Cloudflare and Resend accounts, confirmed inbox. Steps in `workers/contact/README.md` |
| `/index.html` to `/` | Canonical tag and instant client-side forward are done. **Not a true 301**, which GitHub Pages can't do | Optional: put Cloudflare in front and add a redirect rule |
| Long-cache headers | File names are versioned for CSS and JS, but GitHub Pages fixes the cache at 10 minutes | Optional: Cloudflare cache rule for `/assets/*`, 1 year for `assets/css`, `assets/js` and `assets/fonts`. Lighthouse flags this until then |
| Privacy | The form and Google Map involve personal data and third-party cookies. The site has no privacy notice | Add a privacy page before enabling the form, and consider a click-to-load map |

**Deploying (when you decide to):** merge `site-audit-improvements` into `master` and push. GitHub Pages then publishes it. Afterwards:
1. Open each page and check https://olympiccafe.co.uk/CLAUDE.md now returns a 404.
2. Test share previews with the Facebook Sharing Debugger or by pasting a link into WhatsApp.
3. Re-run Lighthouse on the live site.

**Google Search Console**
1. Go to search.google.com/search-console and add a Domain property for `olympiccafe.co.uk`.
2. Add the TXT record it gives you at your DNS provider, then verify.
3. Under Sitemaps, submit `https://olympiccafe.co.uk/sitemap.xml`.
4. Use URL Inspection on `/` and `/menu.html` and request indexing.
5. Check back after a few days for coverage errors.

**Google Business Profile**
1. Claim or open the profile at business.google.com.
2. Make the name, address, phone and hours match the website exactly.
3. Set the website to `https://olympiccafe.co.uk/` and the menu link to `https://olympiccafe.co.uk/menu.html`.
4. Check the map pin, add the real photos, and keep special hours up to date.
5. Make other listings match too, so details are consistent everywhere.

## 6. Editing the site from now on

The root HTML, CSS and JS files are generated. Change business facts in `src/data/business.mjs`, dishes in `src/data/menu.mjs`, and pages in `src/pages/`. Then run `npm run build`, followed by `npm test`.
