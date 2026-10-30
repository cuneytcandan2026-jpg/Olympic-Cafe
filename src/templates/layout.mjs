import { BUSINESS as B } from '../data/business.mjs';
import { MENU } from '../data/menu.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/about.html', label: 'About', key: 'about' },
  { href: '/menu.html', label: 'Menu', key: 'menu' },
  { href: '/gallery.html', label: 'Gallery', key: 'gallery' },
  { href: '/contact.html', label: 'Contact', key: 'contact' },
];

export const ICONS = {
  menu: '<path d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v7a3 3 0 0 1-3 3M17 21v-8h-3V7a4 4 0 0 1 4-4h0v18"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
};
export const icon = (name, size = 20, cls = '') =>
  `<svg aria-hidden="true" focusable="false" class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

export const addressLines = `${B.address.street}<br />${B.address.town}, ${B.address.county}<br />${B.address.postcode}`;

export const priceRange = () => {
  const values = MENU.flatMap((c) => c.items).flatMap((i) => (i.prices ? Object.values(i.prices) : [i.price])).map(Number);
  const food = values.filter((v) => v >= 1);
  return `£${Math.min(...food).toFixed(2)}-£${Math.max(...food).toFixed(2)}`;
};

export function schema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': `${B.baseUrl}/#cafe`,
    name: B.name,
    url: `${B.baseUrl}/`,
    hasMenu: `${B.baseUrl}/menu.html`,
    image: `${B.baseUrl}/assets/img/og/home.jpg`,
    telephone: B.phoneSchema,
    servesCuisine: B.servesCuisine,
    priceRange: priceRange(),
    address: {
      '@type': 'PostalAddress',
      streetAddress: B.address.street,
      addressLocality: B.address.town,
      addressRegion: B.address.county,
      postalCode: B.address.postcode,
      addressCountry: B.address.country,
    },
    openingHoursSpecification: B.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

function header(current) {
  const desktop = NAV.map((n) => `<a href="${n.href}" class="nav-link"${n.key === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n        ');
  const mobile = NAV.map((n) => `<a href="${n.href}" class="flex min-h-12 items-center font-semibold text-brand-ink"${n.key === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ');
  return `<header class="site-header border-b border-brand-burgundy/10 bg-brand-creamlight">
  <div class="site-header-inner container-page flex items-center justify-between gap-4">
    <a href="/" class="shrink-0 rounded" aria-label="Olympic Cafe home">
      <img class="site-logo" src="/assets/img/logo-185.webp" srcset="/assets/img/logo-185.webp 185w, /assets/img/logo-370.webp 370w" sizes="185px" width="185" height="60" alt="Olympic Cafe" />
    </a>
    <nav class="hidden items-center gap-8 nav:flex" aria-label="Primary">
        ${desktop}
    </nav>
    <div class="flex items-center gap-4">
      <a href="${B.phoneHref}" class="hidden min-h-11 items-center gap-2 whitespace-nowrap font-semibold text-brand-burgundy hover:underline active:opacity-70 md:inline-flex">${icon('phone', 18)}${B.phoneDisplay}</a>
      <a href="/menu.html" class="btn btn-primary hidden whitespace-nowrap nav:inline-flex">View Menu</a>
      <button id="menu-toggle" type="button" class="js-only -mr-2 inline-flex h-12 w-12 items-center justify-center rounded-lg text-brand-burgundy hover:bg-brand-burgundy/10 active:bg-brand-burgundy/20 nav:hidden" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-nav">
        <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path data-icon-open d="M3 6h18M3 12h18M3 18h18"/><path data-icon-close d="M6 6l12 12M18 6L6 18" hidden/></svg>
      </button>
    </div>
  </div>
  <nav id="mobile-nav" class="mobile-nav hidden flex-col border-t border-brand-burgundy/10 bg-brand-creamlight px-4 py-3 shadow-lifted sm:px-6 nav:!hidden" aria-label="Mobile">
      ${mobile}
      <a href="${B.phoneHref}" class="flex min-h-12 items-center gap-2 font-semibold text-brand-burgundy">${icon('phone', 18)}Call ${B.phoneDisplay}</a>
  </nav>
</header>`;
}

function actionBar(current) {
  return `<nav class="action-bar flex divide-x divide-brand-cream/25 bg-brand-burgundy shadow-lifted md:hidden on-dark" aria-label="Quick actions">
  <a href="/menu.html${current === 'menu' ? '#menu-results' : ''}">${icon('menu')}Menu</a>
  <a href="${B.phoneHref}">${icon('phone')}Call</a>
  <a href="${B.directionsUrl}" rel="noopener">${icon('pin')}Directions</a>
</nav>`;
}

function footer() {
  const hours = B.hours.map((h) => `${h.label}: ${h.time}`).join('<br />');
  const links = NAV.slice(1).map((n) => `<li><a href="${n.href}" class="inline-flex min-h-11 min-w-11 items-center text-brand-creamlight hover:text-white hover:underline active:opacity-70">${n.label}</a></li>`).join('\n          ');
  return `<footer class="on-dark bg-brand-ink py-12 text-brand-creamlight">
  <div class="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
    <div>
      <span class="inline-block rounded-2xl bg-brand-creamlight px-3 py-2"><img src="/assets/img/logo-185.webp" srcset="/assets/img/logo-185.webp 185w, /assets/img/logo-370.webp 370w" sizes="185px" width="185" height="60" alt="Olympic Cafe" loading="lazy" /></span>
      <p class="mt-3 text-sm">${B.descriptor}</p>
    </div>
    <div>
      <h2 class="mb-2 text-lg text-brand-cream">Visit us</h2>
      <p class="text-sm">${addressLines}</p>
      <a href="${B.directionsUrl}" rel="noopener" class="text-link text-sm">Get directions</a><br />
      <a href="${B.phoneHref}" class="text-link text-sm">${B.phoneDisplay}</a>
    </div>
    <nav aria-label="Footer">
      <h2 class="mb-2 text-lg text-brand-cream">Explore</h2>
      <ul class="text-sm">
          ${links}
      </ul>
    </nav>
    <div>
      <h2 class="mb-2 text-lg text-brand-cream">Hours</h2>
      <p class="text-sm">${hours}<br />Eat in or take away</p>
    </div>
  </div>
  <p class="container-page mt-8 text-xs text-brand-creamlight">&copy; 2026 Olympic Cafe. All rights reserved.</p>
</footer>`;
}

export function page({ key, path, title, description, ogTitle, ogDescription, ogImage, body, scripts = [], preloads = '', extraHead = '', noindex = false }, assets) {
  const url = `${B.baseUrl}${path}`;
  const image = `${B.baseUrl}/assets/img/og/${ogImage}.jpg`;
  const scriptTags = ['site', ...scripts].map((s) => `<script src="/assets/js/${assets.js[s]}" defer></script>`).join('\n');
  return `<!DOCTYPE html>
<!-- Generated by scripts/build.mjs. Edit the files in src/ and run npm run build. -->
<html lang="en-GB">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`}
<meta property="og:site_name" content="${B.name}" />
<meta property="og:locale" content="en_GB" />
<meta property="og:title" content="${esc(ogTitle || title)}" />
<meta property="og:description" content="${esc(ogDescription || description)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Food served at Olympic Cafe, Waltham Cross" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(ogTitle || title)}" />
<meta name="twitter:description" content="${esc(ogDescription || description)}" />
<meta name="twitter:image" content="${image}" />
<meta name="theme-color" content="#FBF4E7" />
<link rel="icon" type="image/png" href="/assets/img/favicon.png" />
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />
<script>document.documentElement.classList.add('js');${key === 'home' ? "if(location.pathname==='/index.html')location.replace('/'+location.search+location.hash);" : ''}</script>
${noindex ? '' : `<script type="application/ld+json">${JSON.stringify(schema())}</script>`}
<link rel="preload" href="/assets/fonts/poppins-400.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/fredoka-600.woff2" as="font" type="font/woff2" crossorigin />
${preloads}
<link rel="stylesheet" href="/assets/css/${assets.css}" />
${extraHead}
${scriptTags}
</head>
<body>
<a href="#main-content" class="sr-only rounded-full bg-brand-burgundy px-4 py-2 font-semibold text-brand-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]">Skip to content</a>
${header(key)}
<main id="main-content" tabindex="-1">
${body}
</main>
${footer()}
${actionBar(key)}
</body>
</html>
`;
}

// Responsive photo. Every source is 16:9, so width and height reserve the space and stop layout shift.
export function photo({ img, alt, sizes, cls = '', eager = false, priority = false }) {
  const srcset = [480, 800, 1200].map((w) => `/assets/img/r/${img}-${w}.webp ${w}w`).join(', ');
  return `<img src="/assets/img/r/${img}-800.webp" srcset="${srcset}" sizes="${sizes}" width="1200" height="675" alt="${esc(alt)}" class="${cls}"${eager ? '' : ' loading="lazy"'}${priority ? ' fetchpriority="high"' : ''} decoding="async" />`;
}

export function imagePreload(img, sizes) {
  const srcset = [480, 800, 1200].map((w) => `/assets/img/r/${img}-${w}.webp ${w}w`).join(', ');
  return `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high" />`;
}

export const formatPrice = (p) => `£${p}`;
