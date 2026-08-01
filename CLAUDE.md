# CLAUDE.md — Frontend Website Rules

## Always Do First
- Check `brand_assets/` before writing any frontend code. Use whatever is there — logos, colors, images. No placeholders where real assets exist.

## GitHub & Deployment
- **NEVER push to GitHub unless the user explicitly asks.** Commit changes locally but do not push.
- When the user says to push, run `git push origin main` from the repo root (`c:\Users\cuney\OneDrive\Desktop\Claude\Olympic Cafe`).

## Dev Server
- Serve at `http://localhost:3000` via `node serve.mjs` (background). Never screenshot `file:///`.
- Do not start a second instance if already running.

## Screenshots
- `node screenshot.mjs http://localhost:3000` — saves to `./temporary screenshots/screenshot-N.png`
- Optional label: `node screenshot.mjs http://localhost:3000 label`
- Chrome: `C:/Program Files/Google/Chrome/Application/chrome.exe` — `puppeteer-core` is in `node_modules/`
- After each screenshot, read the PNG with the Read tool and compare against reference
- **Always take desktop (1440px) and mobile (390px) screenshots per pass.** Both must look correct.
- Be specific when comparing: pixel values, exact hex colors, spacing, border-radius, shadows

## Reference Images
- Match layout, spacing, typography, and color exactly. Use placeholder content only where no real content exists.
- Do not improve or add to the design. Minimum 2 comparison rounds — stop only when no visible differences remain.

## Output Defaults
- Single `index.html`, all styles inline, mobile-first responsive
- Tailwind via CDN with a config block for custom tokens — no arbitrary values when a token works:
  ```html
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: { brand: {} }, fontFamily: { display: [], body: [] }, spacing: {} } }
    }
  </script>
  ```
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Required `<head>` tags every page:
  ```html
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:type" content="website" />
  ```

## Design Guardrails
- **Colors:** No default Tailwind palette (indigo-500, blue-600, etc.). Derive from brand color.
- **Typography:** Different fonts for headings vs body. Tight tracking (`-0.03em`) on large headings, `line-height: 1.7` on body.
- **Shadows:** Layered, color-tinted, low opacity — never flat `shadow-md`.
- **Gradients:** Multiple radial layers. Add SVG noise grain for depth.
- **Animations:** `transform` and `opacity` only. No `transition-all`. Spring-style easing.
- **Interactive states:** Every clickable element: hover, focus-visible, and active. No exceptions.
- **Images:** Gradient overlay (`bg-gradient-to-t from-black/60`) + `mix-blend-multiply` color layer.
- **Depth:** Base → elevated → floating layering system — surfaces don't all sit at the same z-plane.
- **Scroll reveals:** `IntersectionObserver` on `opacity` + `translateY`. Never trigger on page load.

## Accessibility
- WCAG AA contrast. Semantic HTML (`<nav>`, `<main>`, `<button>` — never `<div>` for clicks). Descriptive `alt` on all images. Visible focus rings (`focus-visible:ring-2`). 44×44px minimum touch targets on mobile.
