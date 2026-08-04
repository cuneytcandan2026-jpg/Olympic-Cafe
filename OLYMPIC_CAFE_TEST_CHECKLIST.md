# Olympic Cafe — Manual Test Checklist

No automated test runner exists in this project (`package.json`'s `test` script is a stub), so validation here is manual. Serve locally first:

```
node serve.mjs
```

Then open `http://localhost:3000` in a browser. For screenshots at specific widths:

```
node screenshot.mjs http://localhost:3000/index.html desktop
node screenshot.mjs http://localhost:3000/index.html mobile
```

(repeat per page as needed — see `screenshot.mjs` for exact viewport sizes it uses)

## Pages load

- [ ] `index.html` opens with no console errors
- [ ] `about.html` opens with no console errors
- [ ] `menu.html` opens with no console errors
- [ ] `gallery.html` opens with no console errors
- [ ] `contact.html` opens with no console errors

## Navigation

- [ ] Every header nav link (Home / About / Menu / Gallery / Contact) goes to the correct page from every other page
- [ ] Logo click returns to `index.html` from every page
- [ ] Mobile hamburger opens/closes the mobile nav on all 5 pages; `aria-expanded` toggles correctly
- [ ] Footer links (About/Menu/Gallery/Contact) work from every page
- [ ] `tel:01992631555` links are present and correctly formatted in header, footer, and (on contact.html) the info card
- [ ] Browser back/forward works normally between pages (no JS history hijacking anywhere)

## Skip-to-content (new)

- [ ] On each page, pressing Tab once from the top focuses a "Skip to content" link
- [ ] Activating it moves focus to `<main id="main-content">`, skipping the header/nav

## Menu page

- [ ] All menu categories render on first load with JavaScript enabled
- [ ] Clicking a category tab shows only that category and scrolls to top
- [ ] Typing in the search box filters items across all categories by name/description
- [ ] Clearing the search box restores the previously active tab's view
- [ ] "Vegetarian only" checkbox filters to veg-tagged items only, combinable with search
- [ ] Searching for a nonsense string shows the "No dishes match your search" message
- [ ] With a screen reader (or by inspecting `#filter-status` in devtools), confirm the live region updates with a result count when searching or filtering, and clears when neither filter is active
- [ ] With JavaScript disabled (devtools → disable JavaScript, then reload), confirm the `<noscript>` message appears with a working `tel:` link, instead of a blank page

## Gallery page

- [ ] Masonry grid renders with balanced column heights at 2/3/4-column breakpoints (resize the window to check ~375px, ~800px, ~1200px)
- [ ] Clicking any tile opens the lightbox with the correct photo and caption
- [ ] Lightbox: Escape closes it, ArrowLeft/ArrowRight navigate, focus returns to the tile that opened it
- [ ] Scroll-driven 3D showcase section animates on scroll; confirm it becomes static (no rotation) with `prefers-reduced-motion` enabled in OS/browser settings

## Contact page

- [ ] All 3 info cards (Address, Phone, Hours) display correctly
- [ ] Google Maps embed loads and shows the correct address
- [ ] Submitting the form with empty fields shows inline validation errors and focuses the first invalid field
- [ ] Submitting an invalid email shows the email-specific error
- [ ] Submitting a valid form opens a `mailto:` draft (or the OS's "no mail client configured" prompt) and shows the success message, which now also includes the fallback email/phone line
- [ ] Success message is announced via screen reader (`role="status" aria-live="polite"`)

## Accessibility

- [ ] Tab through each page top-to-bottom; every interactive element receives a visible focus ring
- [ ] No keyboard trap anywhere (lightbox open/close, mobile nav open/close)
- [ ] Zoom to 200% on each page — no horizontal scrollbar, no overlapping text
- [ ] Enable `prefers-reduced-motion` and reload each page — reveal/mask/card-flip/gallery/lightbox transitions are disabled; hero text appears instantly instead of animating in

## SEO / structured data

- [ ] View source on each page and confirm exactly one `<link rel="canonical">` and one `<meta property="og:url">`, both matching that page's real URL
- [ ] Paste each page's JSON-LD block into a JSON validator (or `JSON.parse()` in devtools console) to confirm it's syntactically valid
- [ ] Open `sitemap.xml` directly in a browser — confirms it's well-formed XML and lists all 5 pages
- [ ] Open `robots.txt` directly — confirms the new `Sitemap:` line is present and points to the correct URL

## Responsive widths

Check each page at: 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px+

- [ ] No horizontal scrollbar at any width
- [ ] No text touching screen edges
- [ ] Header/nav doesn't wrap or overlap at any width
- [ ] All touch targets remain easily tappable on mobile widths

## Before committing (see `OLYMPIC_CAFE_FULL_AUDIT.md` Critical #1)

- [ ] Run `git status` and confirm every `.webp` file referenced by the modified HTML is staged in the same commit as the HTML changes — do not commit the HTML changes alone
- [ ] After staging, re-run `git status` to confirm no `assets/img/*.webp` file remains untracked

## Deployment (only if the user explicitly asks)

```
git add index.html about.html menu.html gallery.html contact.html robots.txt sitemap.xml OLYMPIC_CAFE_FULL_AUDIT.md OLYMPIC_CAFE_CHANGES.md OLYMPIC_CAFE_TEST_CHECKLIST.md assets/img/*.webp
git commit -m "Audit fixes: SEO canonicals/sitemap, a11y skip-link + aria-hidden icons + live regions, menu noscript fallback"
git push origin main
```

Per `CLAUDE.md`, do not push unless explicitly asked — commit locally and stop there otherwise.
