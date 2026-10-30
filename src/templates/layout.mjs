import { BUSINESS as B, NOTICE } from '../data/business.mjs';
import { cropOf } from '../data/crops.mjs';
import { MENU } from '../data/menu.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "note" is the short handwritten line beside each link in the mobile menu.
const NAV = [
  { href: '/', label: 'Home', key: 'home', note: 'Start here' },
  { href: '/about.html', label: 'About', key: 'about', note: 'Our story' },
  { href: '/menu.html', label: 'Menu', key: 'menu', note: 'Come hungry' },
  { href: '/gallery.html', label: 'Gallery', key: 'gallery', note: 'See the food' },
  { href: '/contact.html', label: 'Contact', key: 'contact', note: 'Find us' },
];

const LAARA_URL = 'https://laaradigital.co.uk/';

// The torch stands in for the i of Olympic. Decorative here: the surrounding link or footer text carries the name.
const logo = (cls = '') => `<svg class="logo ${cls}" aria-hidden="true" focusable="false" viewBox="0 0 4312 1000" width="215" height="50"><use href="/assets/img/logo.svg#letters" class="logo-letters" /><use href="/assets/img/logo.svg#handle" class="logo-handle" /><use href="/assets/img/logo.svg#shade" class="logo-shade" /><g class="logo-fire"><use href="/assets/img/logo.svg#flame" class="logo-flame" /><use href="/assets/img/logo.svg#line" class="logo-line" /></g></svg>`;

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
  const mobile = NAV.map((n) => `<a href="${n.href}" class="sheet-link" data-note="${n.note}"${n.key === current ? ' aria-current="page"' : ''}>${n.label}<span class="leader leader-on-dark" aria-hidden="true"></span></a>`).join('\n      ');
  return `<header class="site-header on-dark">
  <div class="site-header-bar">
    <div class="site-header-inner container-page flex items-center justify-between gap-4">
      <a href="/" class="logo-link shrink-0" aria-label="Olympic Cafe home">${logo('site-logo')}</a>
      <nav class="hidden items-stretch gap-2.5 self-stretch nav:flex" aria-label="Primary">
        ${desktop}
      </nav>
      <div class="flex items-center gap-5">
        <a href="${B.phoneHref}" class="header-phone hidden min-h-11 items-center gap-2 whitespace-nowrap font-semibold md:inline-flex">${icon('phone', 18)}${B.phoneDisplay}</a>
        <a href="/menu.html" class="btn btn-on-dark hidden whitespace-nowrap nav:inline-flex">View Menu</a>
        <button id="menu-toggle" type="button" class="menu-toggle js-only -mr-2 inline-flex h-12 w-12 items-center justify-center rounded-xl nav:hidden" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-nav">
          <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path data-icon-open d="M3 8h18M3 16h12"/><path data-icon-close d="M6 6l12 12M18 6L6 18" hidden/></svg>
        </button>
      </div>
    </div>
  </div>
  <nav id="mobile-nav" class="mobile-nav hidden flex-col nav:!hidden" aria-label="Mobile">
      ${mobile}
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <a href="/menu.html" class="btn btn-on-dark w-full">View Menu</a>
        <a href="${B.phoneHref}" class="btn btn-outline-on-dark w-full">Call ${B.phoneDisplay}</a>
      </div>
  </nav>
</header>`;
}

function actionBar(current) {
  return `<nav class="action-bar flex on-dark md:hidden" aria-label="Quick actions">
  <a href="/menu.html${current === 'menu' ? '#menu-results' : ''}">${icon('menu')}Menu</a>
  <a href="${B.phoneHref}">${icon('phone')}Call</a>
  <a href="${B.directionsUrl}" rel="noopener">${icon('pin')}Directions</a>
</nav>`;
}

function footer() {
  const links = NAV.slice(1).map((n) => `<li><a href="${n.href}" class="footer-link">${n.label}</a></li>`).join('\n          ');
  return `<footer class="site-footer">
  <div class="container-page grid gap-10 pb-10 pt-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-14 lg:pt-20">
    <nav class="on-dark lg:col-span-4" aria-label="Footer">
      <h2 class="kicker mb-3 font-accent text-sm font-normal">/ EXPLORE</h2>
      <ul>
          ${links}
      </ul>
    </nav>
    <div class="on-dark lg:col-span-4">
      <h2 class="mb-3 font-display text-3xl leading-tight text-brand-cream md:text-4xl">Come and pull up a chair.</h2>
      <p class="text-base">${addressLines}</p>
      <p class="mt-1 text-sm">${B.descriptor}</p>
      <div class="mt-5 flex flex-wrap gap-3">
        <a href="${B.directionsUrl}" rel="noopener" class="btn btn-on-dark whitespace-nowrap">Get Directions</a>
        <a href="${B.phoneHref}" class="btn btn-outline-on-dark whitespace-nowrap">${B.phoneDisplay}</a>
      </div>
    </div>
    <div class="receipt ticket md:col-span-2 lg:col-span-4 lg:ml-auto">
      <h2 class="kicker mb-3 font-normal text-center">/ OPENING HOURS</h2>
      <ul class="text-sm">${hoursRows('py-1', 'label')}</ul>
      <p class="mt-3 flex items-baseline justify-between gap-3 text-sm font-semibold"><span>Eat in</span><span class="leader" aria-hidden="true"></span><span>or take away</span></p>
      <p class="kicker mt-4 text-center">Thank you. See you soon.</p>
    </div>
  </div>
  <div class="footer-wordmark" aria-hidden="true">${logo('w-full h-auto')}</div>
  <div class="footer-legal on-dark">
    <div class="container-page flex flex-col gap-x-6 sm:flex-row sm:items-center sm:justify-between">
      <p>&copy; 2026 Olympic Cafe. All rights reserved.</p>
      <p>Website designed by <a href="${LAARA_URL}" rel="noopener" class="footer-credit">Laara Digital</a></p>
    </div>
  </div>
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
<meta name="theme-color" content="#8A181A" />
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
${NOTICE ? `<p class="site-notice">${esc(NOTICE)}</p>` : ''}
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

// An art-directed crop from src/data/crops.mjs. The real proportions are always reserved.
export function cropped({ name, alt, sizes, cls = '', eager = false }) {
  const { widths, width, height } = cropOf(name);
  const srcset = widths.map((w) => `/assets/img/c/${name}-${w}.webp ${w}w`).join(', ');
  const middle = widths[Math.floor(widths.length / 2)];
  return `<img src="/assets/img/c/${name}-${middle}.webp" srcset="${srcset}" sizes="${sizes}" width="${width}" height="${height}" alt="${esc(alt)}" class="${cls}"${eager ? '' : ' loading="lazy"'} decoding="async" />`;
}

// A small torch between two thin rules. The brand guidelines allow this as a divider, but not as repeated decoration.
export const torchDivider = (cls = '') => `<div class="torch-divider ${cls}" aria-hidden="true"><img src="/assets/img/torch.webp" width="37" height="96" alt="" loading="lazy" /></div>`;

// Hours as a list. site.js marks today's row, in UK time, for visitors with JavaScript.
export const hoursRows = (rowCls = '', labelKey = 'labelLong') => B.hours.map((h) => `<li class="hours-row ${rowCls}" data-days="${h.days.join(',')}"><span class="font-semibold">${h[labelKey]}</span><span class="today-tag" hidden>Today</span><span class="whitespace-nowrap">${h.time}</span></li>`).join('');

// Two photos meeting edge to edge on the same table, each with a short line beneath it.
export function diptych(items, headingTag = 'h3') {
  return `<div class="diptych">
        ${items.map((d) => `<div>
          ${photo({ img: d.img, alt: d.alt, sizes: '50vw', cls: 'diptych-photo' })}
          <div class="diptych-label ${d.dark ? 'on-dark bg-brand-burgundy text-brand-cream' : 'bg-brand-cream text-brand-ink'}">
            <${headingTag} class="text-lg md:text-2xl ${d.dark ? '' : 'text-brand-burgundy'}">${esc(d.title)}</${headingTag}>
            <p class="mt-1 text-sm md:text-base">${esc(d.text)}</p>
          </div>
        </div>`).join('\n        ')}
      </div>`;
}

export function imagePreload(img, sizes) {
  const srcset = [480, 800, 1200].map((w) => `/assets/img/r/${img}-${w}.webp ${w}w`).join(', ');
  return `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high" />`;
}

export const formatPrice = (p) => `£${p}`;
