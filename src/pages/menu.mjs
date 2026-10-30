import { MENU, dishCount } from '../data/menu.mjs';
import { BUSINESS as B } from '../data/business.mjs';
import { esc, formatPrice } from '../templates/layout.mjs';

function priceBlock(item) {
  if (item.prices) {
    const parts = Object.entries(item.prices).map(([size, p]) => `<span class="whitespace-nowrap">${size} <strong class="font-semibold text-brand-burgundy">${formatPrice(p)}</strong></span>`);
    return { inline: '', below: `<p class="mt-0.5 flex flex-wrap gap-x-3 text-sm">${parts.join('')}</p>` };
  }
  return { inline: `<span class="whitespace-nowrap font-semibold text-brand-burgundy">${formatPrice(item.price)}</span>`, below: '' };
}

function dish(item, category) {
  const { inline, below } = priceBlock(item);
  const search = `${item.name} ${item.desc || ''} ${category.name}`.toLowerCase();
  return `<li class="border-b border-brand-burgundy/10 py-3" data-search="${esc(search)}" data-veg="${item.veg ? '1' : '0'}">
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-lg leading-snug">${esc(item.name)}</h3>
              ${inline}
            </div>
            ${item.desc ? `<p class="mt-0.5 text-sm">${esc(item.desc)}</p>` : ''}
            ${below}
            ${item.veg ? '<p class="veg-label mt-1"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Vegetarian</p>' : ''}
          </li>`;
}

const sections = MENU.map((c) => `<section id="${c.id}" data-category="${c.id}" aria-labelledby="${c.id}-heading">
        <h2 id="${c.id}-heading" class="mb-1 text-2xl text-brand-burgundy md:text-3xl">${esc(c.name)}</h2>
        ${c.note ? `<p class="max-w-3xl text-sm">${esc(c.note)}</p>` : ''}
        <ul class="mt-2 grid gap-x-10 md:grid-cols-2">
          ${c.items.map((i) => dish(i, c)).join('\n          ')}
        </ul>
      </section>`).join('\n\n      ');

export default {
  key: 'menu',
  path: '/menu.html',
  title: 'Menu | Olympic Cafe, Waltham Cross',
  description: 'The full Olympic Cafe menu with prices: set breakfasts, brunch, lunch, burgers, sandwiches, salads, Sunday roast and drinks. Eat in or take away in Waltham Cross.',
  ogTitle: 'Menu | Olympic Cafe',
  ogDescription: 'Breakfast, brunch and lunch with prices. Browse the full Olympic Cafe menu.',
  ogImage: 'menu',
  scripts: ['menu'],
  body: `  <section class="bg-brand-creamlight pb-3 pt-5 md:pt-8">
    <div class="container-page">
      <p class="kicker mb-1">/ THE FULL MENU</p>
      <h1 class="mb-1 text-4xl text-brand-burgundy md:text-5xl">Our menu</h1>
      <p class="max-w-3xl text-sm md:text-base">Everything we serve at Olympic Cafe in Waltham Cross, with prices. Have an allergy or dietary need? Please tell us before you order, or call <a href="${B.phoneHref}" class="whitespace-nowrap font-semibold text-brand-burgundy underline">${B.phoneDisplay}</a>.</p>
    </div>
  </section>

  <div id="menu-controls" class="menu-controls py-2.5">
    <div class="container-page">
      <form id="menu-form" class="js-only grid grid-cols-2 gap-2 md:flex md:items-center" role="search" aria-label="Search and filter the menu">
        <div class="col-span-2 md:w-80">
          <label for="menu-search" class="sr-only">Search the menu</label>
          <input id="menu-search" name="q" type="search" class="field-control" placeholder="Search the menu" autocomplete="off" enterkeyhint="search" />
        </div>
        <div class="md:hidden">
          <label for="menu-category" class="sr-only">Category</label>
          <select id="menu-category" class="field-control min-w-0 px-3">
            <option value="">All categories</option>
            ${MENU.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('\n            ')}
          </select>
        </div>
        <label class="veg-toggle justify-center">
          <input id="menu-veg" type="checkbox" />
          Vegetarian
        </label>
      </form>
      <nav id="menu-chips" class="js-only hidden flex-wrap gap-2 pt-1 md:mt-2 md:flex md:flex-nowrap md:overflow-x-auto md:pb-1" aria-label="Menu categories">
        <a class="chip" href="#menu-results" data-chip="" aria-current="true">All categories</a>
        ${MENU.map((c) => `<a class="chip" href="#${c.id}" data-chip="${c.id}">${esc(c.name)}</a>`).join('\n        ')}
      </nav>
      <noscript>
        <p class="mb-1 text-sm font-semibold">Jump to a category:</p>
        <div class="flex flex-wrap gap-2">
          ${MENU.map((c) => `<a class="chip" href="#${c.id}">${esc(c.name)}</a>`).join('\n          ')}
        </div>
      </noscript>
    </div>
  </div>

  <div id="menu-results" class="container-page py-4 md:py-6">
    <div class="js-only mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <p id="menu-status" class="text-sm font-semibold" role="status" aria-live="polite">Showing all ${dishCount} items.</p>
      <button id="menu-reset" type="button" class="text-link hidden text-sm">Reset search and filters</button>
    </div>
    <div id="menu-empty" class="py-10 text-center" hidden>
      <h2 class="mb-2 text-2xl text-brand-burgundy">Nothing matches that</h2>
      <p id="menu-empty-text" class="mb-4">Try a different word, or show the whole menu again.</p>
      <button id="menu-empty-reset" type="button" class="btn btn-primary">Show the full menu</button>
    </div>
    <p class="mb-5 max-w-3xl rounded-xl bg-brand-cream px-4 py-3 text-sm" id="menu-veg-note"><strong class="font-semibold">Vegetarian labels:</strong> shown only on dishes our printed menu lists as veggie. Other dishes may suit you, so please ask us.</p>
    <div class="space-y-8 md:space-y-10">
      ${sections}
    </div>
  </div>`,
};
