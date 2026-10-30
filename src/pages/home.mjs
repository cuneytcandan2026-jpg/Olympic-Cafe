import { BUSINESS as B, REVIEWS } from '../data/business.mjs';
import { EXPLORE } from '../data/explore.mjs';
import { findDish, MENU } from '../data/menu.mjs';
import { addressLines, cropped, diptych, esc, formatPrice, hoursRows, icon, imagePreload, photo, torchDivider } from '../templates/layout.mjs';

const HERO_SIZES = '(min-width: 1024px) 58vw, 100vw';

const tiles = EXPLORE.map((t) => `<li>
          <a class="table-tile" href="/menu.html#${t.cat}">
            ${cropped({ name: t.crop, alt: t.alt, sizes: '(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw', cls: 'table-tile-photo' })}
            <span class="table-tile-label">
              <span class="block font-display text-xl font-semibold leading-tight md:text-2xl">${esc(t.label)}</span>
              <span class="mt-0.5 block text-sm">From ${formatPrice(t.from)}</span>
            </span>
          </a>
        </li>`).join('\n        ');

function supportingDish({ cat, name, crop, alt }) {
  const dish = findDish(cat, name);
  return `<article class="flex gap-4 md:gap-6">
          ${cropped({ name: crop, alt, sizes: '(min-width: 768px) 176px, 104px', cls: 'plate-frame h-26 w-26 shrink-0 md:h-44 md:w-44' })}
          <div class="min-w-0">
            <h3 class="text-xl md:text-2xl">${esc(dish.name)}</h3>
            <p class="font-semibold text-brand-burgundy">${formatPrice(dish.price)}</p>
            <p class="mt-1 text-sm">${esc(dish.desc)}</p>
            <a href="/menu.html#${cat}" class="text-link text-sm">See it on the menu</a>
          </div>
        </article>`;
}

const feature = findDish('set-breakfast', 'Mediterranean Breakfast');

const rings = MENU.find((c) => c.id === 'sweet-savoury');

const PAIRINGS = [
  { food: { cat: 'brunch', name: 'Sicily Coast', crop: 'avocado-toast-brie-fries', alt: 'Sicily Coast: crushed avocado on sourdough with mushrooms, sun-dried tomato and feta, with chips' }, drink: { label: 'Orange Juice', price: findDish('freshly-squeezed', 'Orange Juice').price, crop: 'orange-juice', alt: 'A tall glass of freshly squeezed orange juice with an orange slice' } },
  { food: { cat: 'burgers', name: 'Chicken Burger', crop: 'chicken-burger', alt: 'A crispy chicken burger with lettuce and mayo in a sesame bun' }, drink: { label: 'Milkshakes', prefix: 'from ', price: findDish('cold-drinks', 'Milkshake').price, crop: 'chocolate-milkshake', alt: 'A chocolate milkshake with whipped cream and a striped straw' } },
  { food: { cat: 'jacket-potato', name: 'Tuna Mayo', label: 'Tuna Mayo Jacket', crop: 'jacket-potato-tuna', alt: 'A jacket potato filled with tuna mayo, served with salad' }, drink: { label: 'Iced Coffee', price: findDish('cold-drinks', 'Iced Coffee').price, crop: 'iced-coffee', alt: 'An iced coffee in a tall patterned glass with a striped straw' } },
];

const pairing = ({ food, drink }) => {
  const dish = findDish(food.cat, food.name);
  return `<li class="pairing">
          <div class="pairing-photos">
            ${cropped({ name: food.crop, alt: food.alt, sizes: '160px', cls: 'plate-frame h-32 w-32 md:h-40 md:w-40' })}
            <span class="pairing-and" aria-hidden="true">&amp;</span>
            ${cropped({ name: drink.crop, alt: drink.alt, sizes: '128px', cls: 'plate-frame -ml-4 h-24 w-24 md:h-32 md:w-32' })}
          </div>
          <h3 class="mt-4 text-xl md:text-2xl">${esc(food.label || dish.name)} <span class="sr-only">and</span><span aria-hidden="true">&amp;</span> ${esc(drink.label)}</h3>
          <p class="text-sm"><span class="font-semibold text-brand-burgundy">${formatPrice(dish.price)}</span> and <span class="font-semibold text-brand-burgundy">${drink.prefix || ''}${formatPrice(drink.price)}</span></p>
        </li>`;
};

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
  body: `  <section class="hero paper-texture bg-brand-creamlight">
    <div class="hero-photo">
      ${photo({ img: 'table-spread-overhead-1', alt: 'An overhead spread of Olympic Cafe breakfasts, sandwiches, coffee and juice on a wooden table', sizes: HERO_SIZES, cls: 'h-full w-full object-cover', eager: true, priority: true })}
      <div class="ticket hero-ticket hidden lg:block" role="group" aria-label="Opening hours">
        <p class="kicker mb-2">Open seven days a week</p>
        <ul class="text-sm">${hoursRows('', 'label')}</ul>
      </div>
    </div>
    <div class="hero-copy">
      <p class="kicker mb-2">/ BREAKFAST &middot; BRUNCH &middot; LUNCH</p>
      <h1 class="mb-4 text-4xl leading-[1.05] text-brand-burgundy sm:text-5xl xl:text-6xl"><span class="block">Proper food.</span> <span class="block">A warm welcome.</span> <span class="block">All day.</span></h1>
      <div class="mb-4 flex flex-wrap gap-3 lg:order-1 lg:mb-0">
        <a href="/menu.html" class="btn btn-primary flex-1 whitespace-nowrap sm:flex-none">View Menu</a>
        <a href="${B.directionsUrl}" rel="noopener" class="btn btn-secondary flex-1 whitespace-nowrap sm:flex-none">Get Directions</a>
      </div>
      <p class="max-w-xl text-base md:text-lg lg:mb-6">Olympic Cafe is a neighbourhood cafe on Waltham Cross High Street, serving full English breakfasts, brunch, homemade lunches and Mediterranean-inspired dishes. Eat in or take away, seven days a week.</p>
      <p class="mt-3 flex items-start gap-2 text-sm font-semibold text-brand-burgundy lg:order-2 lg:mt-4">${icon('pin', 18, 'mt-1 shrink-0')}${B.address.street}, ${B.address.town}, ${B.address.postcode}</p>
    </div>
  </section>

  <section class="pb-0 pt-10 md:pt-16" aria-labelledby="explore-heading" data-reveal>
    <div class="container-page mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-1">
      <div>
        <p class="kicker mb-1">/ PULL UP A CHAIR</p>
        <h2 id="explore-heading" class="text-3xl text-brand-burgundy md:text-4xl">What are you hungry for?</h2>
      </div>
      <a href="/menu.html" class="text-link">See the full menu</a>
    </div>
    <ul class="long-table">
        ${tiles}
    </ul>
  </section>

  <section class="py-12 md:py-20" aria-labelledby="signature-heading" data-reveal>
    <div class="feature">
      <div class="feature-photo">
        ${cropped({ name: 'mediterranean-feature', alt: 'Mediterranean Breakfast with eggs, sucuk, halloumi, mushrooms, olives, tomato and cucumber, with toast', sizes: '(min-width: 1024px) 62vw, 100vw', cls: 'h-full w-full object-cover' })}
      </div>
      <div class="feature-card">
        <p class="kicker mb-1">/ FROM THE MENU</p>
        <h2 id="signature-heading" class="mb-3 text-3xl text-brand-burgundy md:text-4xl">Start your day the Olympic way</h2>
        <div class="flex items-baseline justify-between gap-4">
          <h3 class="text-xl md:text-2xl">${esc(feature.name)}</h3>
          <span class="whitespace-nowrap text-lg font-semibold text-brand-burgundy">${formatPrice(feature.price)}</span>
        </div>
        <p class="mt-1 text-sm md:text-base">${esc(feature.desc)}</p>
        <a href="/menu.html#set-breakfast" class="btn btn-primary mt-4 w-full sm:w-auto">See Set Breakfast</a>
      </div>
    </div>
    <div class="container-page mt-8 grid gap-6 md:mt-12 md:grid-cols-2 md:gap-10">
      ${supportingDish({ cat: 'set-breakfast', name: 'Full Olympic', crop: 'full-english-fries', alt: 'Full Olympic: eggs, bacon, cumberland sausages, mushrooms, chips and beans, with toast on the side' })}
      ${supportingDish({ cat: 'brunch', name: 'Avo Breeze', crop: 'avocado-toast-poached-egg-fries', alt: 'Avo Breeze: crushed avocado on sourdough with poached eggs and streaky bacon, with chips' })}
    </div>
  </section>

  <section class="paper-texture bg-brand-terracottapale py-12 md:py-20" aria-labelledby="rings-heading" data-reveal>
    <div class="container-page grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <div class="rings-photos lg:col-span-6">
        <figure class="rings-photo-main">
          ${cropped({ name: 'pancake-ring-special', alt: 'Red Ring: eggs, streaky bacon, cumberland sausage, grilled tomato and beans, with pancakes and fruit', sizes: '(min-width: 1024px) 400px, 60vw', cls: 'plate-frame w-full' })}
          <figcaption class="mt-3 text-center text-sm font-semibold">Red Ring, with pancakes</figcaption>
        </figure>
        <figure class="rings-photo-side">
          ${cropped({ name: 'french-toast-fruit', alt: 'Blue Ring: poached eggs, halloumi, sucuk and avocado, with French toast and fruit', sizes: '(min-width: 1024px) 280px, 42vw', cls: 'plate-frame w-full' })}
          <figcaption class="mt-3 text-center text-sm font-semibold">Blue Ring, with French toast</figcaption>
        </figure>
      </div>
      <div class="lg:col-span-6">
        <p class="kicker mb-1">/ SWEET &amp; SAVOURY</p>
        <h2 id="rings-heading" class="mb-3 text-3xl text-brand-burgundy md:text-4xl">Can't choose? Have both.</h2>
        <p class="mb-5 max-w-xl">Our five Rings put a cooked breakfast and your choice of pancakes or French toast on one plate, with seasonal fruit, fresh cream and maple syrup. Tea or coffee is included.</p>
        <ul class="mb-5">
          ${rings.items.map((i) => `<li class="ring-row">
            <div class="flex items-baseline gap-3">
              <h3 class="text-xl md:text-2xl">${esc(i.name)}</h3>
              <span class="leader" aria-hidden="true"></span>
              <span class="whitespace-nowrap font-semibold text-brand-burgundy">${formatPrice(i.price)}</span>
            </div>
            <p class="text-sm">${esc(i.desc)}</p>
          </li>`).join('\n          ')}
        </ul>
        <a href="/menu.html#sweet-savoury" class="btn btn-secondary w-full sm:w-auto">See Sweet &amp; Savoury</a>
      </div>
    </div>
  </section>

  <section class="py-12 md:py-20" aria-labelledby="pairings-heading" data-reveal>
    <div class="container-page">
      <p class="kicker mb-1">/ GOOD COMPANY</p>
      <h2 id="pairings-heading" class="mb-2 text-3xl text-brand-burgundy md:text-4xl">What goes with what</h2>
      <p class="mb-6 max-w-2xl md:mb-10">A few ideas for next time. These aren't set deals: each one is ordered and priced separately.</p>
      <ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        ${PAIRINGS.map(pairing).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="on-dark bg-brand-burgundy py-12 text-brand-cream md:py-20" aria-labelledby="roast-heading" data-reveal>
    <div class="container-page">
      <div class="roast-board">
        <div>
          <p class="kicker mb-2">/ SUNDAYS AT OLYMPIC</p>
          <h2 id="roast-heading" class="roast-title">Sunday Roast</h2>
          <p class="mt-4 max-w-sm text-base md:text-lg">All served with mixed veg, roast potatoes, Yorkshire pudding and gravy.</p>
        </div>
        <div>
          <ul>
            ${roast.items.map((i) => `<li class="flex items-baseline gap-3 py-2 md:py-3">
              <span class="font-display text-2xl font-semibold md:text-4xl">${esc(i.name)}</span>
              <span class="leader leader-on-dark" aria-hidden="true"></span>
              <span class="whitespace-nowrap text-xl font-semibold md:text-2xl">${formatPrice(i.price)}</span>
            </li>`).join('\n            ')}
          </ul>
          <a href="/menu.html#sunday-roast" class="btn btn-on-dark mt-6 w-full sm:w-auto">See the Sunday Roast menu</a>
        </div>
      </div>
    </div>
  </section>

  <section class="pt-12 md:pt-20" aria-labelledby="story-heading" data-reveal>
    <div class="container-page mb-8 grid gap-4 md:mb-10 md:grid-cols-2 md:gap-10">
      <div>
        <p class="kicker mb-1">/ OUR STORY</p>
        <h2 id="story-heading" class="text-3xl text-brand-burgundy md:text-4xl">A proper neighbourhood cafe</h2>
      </div>
      <div>
        <p class="mb-2 max-w-xl">British roots, Mediterranean character. Full English breakfasts and Sunday roasts share the menu with halloumi, feta, sucuk and olives, cooked to order and served without any fuss.</p>
        <a href="/about.html" class="text-link">About Olympic Cafe</a>
      </div>
    </div>
    ${diptych([
      { img: 'full-english-hash-browns', alt: 'A cooked breakfast with bacon, egg, sausage, hash browns, mushrooms and beans, with toast', title: 'British roots', text: 'Full English breakfasts and Sunday roasts.', dark: true },
      { img: 'titan-breakfast', alt: 'Titan Breakfast with poached eggs, halloumi, mushrooms, avocado, grilled tomato and smoked salmon', title: 'Mediterranean character', text: 'Halloumi, feta, sucuk and olives.' },
    ])}
  </section>

  ${reviews}

  <section class="visit" aria-labelledby="visit-heading" data-reveal>
    <img class="visit-photo" src="/assets/img/c/table-visit-800.webp" srcset="/assets/img/c/table-visit-800.webp 800w, /assets/img/c/table-visit-1600.webp 1600w" sizes="(min-width: 1024px) 100vw, 150vw" width="2100" height="810" alt="A matcha latte with leaf art on a wooden table" loading="lazy" decoding="async" />
    <div class="container-page visit-inner">
      <div class="ticket visit-ticket">
        ${torchDivider('mb-3')}
        <p class="kicker mb-1 text-center">/ COME SAY HELLO</p>
        <h2 id="visit-heading" class="mb-4 text-center text-3xl text-brand-burgundy">Visit Olympic Cafe in Waltham Cross</h2>
        <p class="mb-4 text-center">${addressLines}</p>
        <ul class="mb-1">${hoursRows('py-1', 'label')}</ul>
        <p class="mb-5 text-sm">Eat in or take away</p>
        <div class="grid gap-3">
          <a href="${B.directionsUrl}" rel="noopener" class="btn btn-primary w-full">Get Directions</a>
          <a href="${B.phoneHref}" class="btn btn-secondary w-full">Call ${B.phoneDisplay}</a>
        </div>
        <p class="mt-2 text-center"><a href="/contact.html" class="text-link text-sm">All contact details and map</a></p>
      </div>
    </div>
  </section>`,
};
