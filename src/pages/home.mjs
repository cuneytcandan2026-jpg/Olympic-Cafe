import { BUSINESS as B, REVIEWS } from '../data/business.mjs';
import { findDish, MENU } from '../data/menu.mjs';
import { addressLines, esc, formatPrice, icon, imagePreload, photo } from '../templates/layout.mjs';

const HERO_SIZES = '(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw';

const SIGNATURE = [
  { cat: 'set-breakfast', name: 'Titan Breakfast', img: 'titan-breakfast', alt: 'Titan Breakfast with poached eggs, halloumi, mushrooms, avocado, grilled tomato and smoked salmon, with toast' },
  { cat: 'set-breakfast', name: 'Mediterranean Breakfast', img: 'mediterranean-breakfast', alt: 'Mediterranean Breakfast with eggs, sucuk, halloumi, olives, tomato and cucumber, with toast' },
  { cat: 'sweet-savoury', name: 'Red Ring', img: 'pancake-ring-special', alt: 'Red Ring with eggs, streaky bacon, cumberland sausage, grilled tomato and baked beans, with pancakes and fruit' },
];

function dishCard({ cat, name, img, alt }) {
  const dish = findDish(cat, name);
  return `<article class="dish-card card overflow-hidden">
          ${photo({ img, alt, sizes: '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw', cls: 'aspect-video w-full object-cover' })}
          <div class="p-5">
            <div class="mb-1 flex items-start justify-between gap-3">
              <h3 class="text-xl">${esc(dish.name)}</h3>
              <span class="whitespace-nowrap font-semibold text-brand-burgundy">${formatPrice(dish.price)}</span>
            </div>
            <p class="text-sm">${esc(dish.desc)}</p>
          </div>
        </article>`;
}

const roast = MENU.find((c) => c.id === 'sunday-roast');

const reviews = REVIEWS.length
  ? `<section class="py-12 md:py-16" aria-labelledby="reviews-heading">
    <div class="container-page">
      <h2 id="reviews-heading" class="mb-6 text-3xl text-brand-burgundy">What customers say</h2>
      <div class="grid gap-6 md:grid-cols-3">
        ${REVIEWS.map((r) => `<figure class="card p-6"><blockquote>${esc(r.quote)}</blockquote><figcaption class="mt-3 text-sm font-semibold">${esc(r.author)}, ${esc(r.source)}</figcaption></figure>`).join('\n        ')}
      </div>
    </div>
  </section>`
  : '';

export default {
  key: 'home',
  path: '/',
  title: 'Olympic Cafe | Breakfast, Brunch & Lunch in Waltham Cross',
  description: 'Neighbourhood cafe on Waltham Cross High Street serving full English breakfasts, brunch, homemade lunches and Mediterranean-inspired dishes. Open 7 days a week.',
  ogTitle: 'Olympic Cafe | Waltham Cross',
  ogDescription: 'Proper food and a warm welcome on Waltham Cross High Street. Eat in or take away, 7 days a week.',
  ogImage: 'home',
  preloads: imagePreload('table-spread-overhead-1', HERO_SIZES),
  body: `  <section class="paper-texture bg-brand-creamlight py-6 md:py-10">
    <div class="container-page grid items-center gap-6 md:grid-cols-2 md:gap-10">
      <div>
        <p class="kicker mb-2">/ BREAKFAST &middot; BRUNCH &middot; LUNCH</p>
        <h1 class="mb-3 text-4xl leading-[1.05] text-brand-burgundy lg:text-6xl">Proper food. A&nbsp;warm&nbsp;welcome. All&nbsp;day.</h1>
        <p class="mb-5 max-w-xl text-base md:text-lg">Olympic Cafe is a neighbourhood cafe on Waltham Cross High Street, serving full English breakfasts, brunch, homemade lunches and Mediterranean-inspired dishes. Eat in or take away, seven days a week.</p>
        <div class="flex flex-wrap gap-3">
          <a href="/menu.html" class="btn btn-primary flex-1 whitespace-nowrap sm:flex-none">View Menu</a>
          <a href="${B.directionsUrl}" rel="noopener" class="btn btn-secondary flex-1 whitespace-nowrap sm:flex-none">Get Directions</a>
        </div>
      </div>
      <div class="relative">
        ${photo({ img: 'table-spread-overhead-1', alt: 'An overhead spread of Olympic Cafe breakfasts, sandwiches, coffee and juice on a wooden table', sizes: HERO_SIZES, cls: 'aspect-video w-full rounded-3xl object-cover shadow-base', eager: true, priority: true })}
      </div>
    </div>
  </section>

  <section class="on-dark bg-brand-burgundy py-6 text-brand-cream" aria-label="Address and opening hours">
    <div class="container-page grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div class="flex gap-3">
        ${icon('pin', 24, 'mt-1 shrink-0')}
        <div>
          <h2 class="text-lg">Find us</h2>
          <p class="text-sm">${B.address.street}, ${B.address.town}, ${B.address.postcode}</p>
          <a href="${B.directionsUrl}" rel="noopener" class="text-link text-sm">Get directions</a>
        </div>
      </div>
      <div class="flex gap-3">
        ${icon('clock', 24, 'mt-1 shrink-0')}
        <div>
          <h2 class="text-lg">Opening hours</h2>
          <p class="text-sm">${B.hours.map((h) => `${h.label}: ${h.time}`).join('<br />')}</p>
        </div>
      </div>
      <div class="flex gap-3">
        ${icon('phone', 24, 'mt-1 shrink-0')}
        <div>
          <h2 class="text-lg">Call us</h2>
          <p class="text-sm">Eat in or take away</p>
          <a href="${B.phoneHref}" class="text-link text-sm">${B.phoneDisplay}</a>
        </div>
      </div>
    </div>
  </section>

  <section class="py-12 md:py-16" aria-labelledby="signature-heading" data-reveal>
    <div class="container-page">
      <p class="kicker mb-1">/ FROM THE MENU</p>
      <h2 id="signature-heading" class="mb-6 text-3xl text-brand-burgundy md:text-4xl">Signature plates</h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${SIGNATURE.map(dishCard).join('\n        ')}
      </div>
      <a href="/menu.html" class="btn btn-secondary mt-6 w-full sm:w-auto">See the full menu</a>
    </div>
  </section>

  <section class="bg-brand-cream py-12 md:py-16" aria-labelledby="story-heading" data-reveal>
    <div class="container-page grid items-center gap-6 md:grid-cols-2 md:gap-10">
      <div>
        <p class="kicker mb-1">/ OUR STORY</p>
        <h2 id="story-heading" class="mb-3 text-3xl text-brand-burgundy md:text-4xl">A proper neighbourhood cafe</h2>
        <p class="mb-4 max-w-xl">British roots, Mediterranean character. Full English breakfasts and Sunday roasts share the menu with halloumi, feta, sucuk and olives, cooked to order and served without any fuss.</p>
        <a href="/about.html" class="btn btn-secondary w-full sm:w-auto">About Olympic Cafe</a>
      </div>
      ${photo({ img: 'latte-art', alt: 'A latte with leaf art in a stoneware cup', sizes: '(min-width: 768px) 50vw, 100vw', cls: 'aspect-video w-full rounded-3xl object-cover shadow-base' })}
    </div>
  </section>

  <section class="on-dark bg-brand-burgundy py-12 text-brand-cream md:py-16" aria-labelledby="roast-heading" data-reveal>
    <div class="container-page">
      <p class="kicker mb-1">/ SUNDAYS AT OLYMPIC</p>
      <h2 id="roast-heading" class="mb-2 text-3xl md:text-4xl">Sunday Roast</h2>
      <p class="mb-5 max-w-xl">All served with mixed veg, roast potatoes, Yorkshire pudding and gravy.</p>
      <ul class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        ${roast.items.map((i) => `<li class="flex items-baseline justify-between gap-2 rounded-xl bg-brand-creamlight px-4 py-3 text-brand-ink"><span class="font-display font-semibold">${esc(i.name)}</span><span class="font-semibold text-brand-burgundy">${formatPrice(i.price)}</span></li>`).join('\n        ')}
      </ul>
      <a href="/menu.html#sunday-roast" class="btn btn-on-dark w-full sm:w-auto">See the Sunday Roast menu</a>
    </div>
  </section>

  ${reviews}

  <section class="py-12 md:py-16" aria-labelledby="visit-heading" data-reveal>
    <div class="container-page">
      <p class="kicker mb-1">/ COME SAY HELLO</p>
      <h2 id="visit-heading" class="mb-4 text-3xl text-brand-burgundy md:text-4xl">Visit Olympic Cafe in Waltham Cross</h2>
      <div class="grid gap-6 sm:grid-cols-2">
        <p>${addressLines}</p>
        <p>${B.hours.map((h) => `${h.labelLong}: ${h.time}`).join('<br />')}<br />Eat in or take away</p>
      </div>
      <div class="mt-5 flex flex-wrap gap-3">
        <a href="${B.directionsUrl}" rel="noopener" class="btn btn-primary w-full sm:w-auto">Get Directions</a>
        <a href="${B.phoneHref}" class="btn btn-secondary w-full sm:w-auto">Call ${B.phoneDisplay}</a>
        <a href="/contact.html" class="btn btn-secondary w-full sm:w-auto">Contact us</a>
      </div>
    </div>
  </section>`,
};
