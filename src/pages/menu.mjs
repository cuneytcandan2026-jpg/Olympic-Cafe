import { dishId, MENU, dishCount } from '../data/menu.mjs';
import { BUSINESS as B } from '../data/business.mjs';
import { EXPLORE, MENU_GROUPS } from '../data/explore.mjs';
import { cropped, esc, formatPrice, icon } from '../templates/layout.mjs';

function priceBlock(item) {
  if (item.prices) {
    const parts = Object.entries(item.prices).map(([size, p]) => `<span class="whitespace-nowrap">${size} <strong class="font-semibold text-brand-burgundy">${formatPrice(p)}</strong></span>`);
    return { inline: '', below: `<p class="dish-sizes mt-0.5 flex flex-wrap gap-x-3 text-sm">${parts.join('')}</p>` };
  }
  return { inline: `<span class="whitespace-nowrap font-semibold text-brand-burgundy">${formatPrice(item.price)}</span>`, below: '' };
}

function dish(item, category) {
  const { inline, below } = priceBlock(item);
  const search = `${item.name} ${item.desc || ''} ${category.name}`.toLowerCase();
  // What order.js needs. It reads the name and category from the headings, so they aren't repeated here.
  const price = item.prices ? `data-prices="${esc(JSON.stringify(item.prices))}"` : `data-price="${item.price}"`;
  const skip = (category.addons || []).filter((a) => (a.except || []).includes(item.name)).map((a) => a.id).join(',');
  return `<li id="${dishId(category.id, item.name)}" class="border-b border-brand-burgundy/10 py-3" data-search="${esc(search)}" data-veg="${item.veg ? '1' : '0'}" ${price}${skip ? ` data-skip="${skip}"` : ''}>
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-lg leading-snug">${esc(item.name)}</h3>
              ${inline}
            </div>
            ${item.desc ? `<p class="mt-0.5 text-sm">${esc(item.desc)}</p>` : ''}
            ${below}
            ${item.veg ? '<p class="veg-label mt-1"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Vegetarian</p>' : ''}
          </li>`;
}

const addonData = (c) => (c.addons ? ` data-addons="${esc(JSON.stringify(c.addons.map(({ id, label, price }) => ({ id, label, price }))))}"` : '');

const sections = MENU.map((c) => `<section id="${c.id}" data-category="${c.id}" aria-labelledby="${c.id}-heading"${addonData(c)}>
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
  scripts: ['menu', 'order'],
  body: `  <section class="bg-brand-creamlight pb-3 pt-5 md:pt-8">
    <div class="container-page">
      <div class="xl:flex xl:items-center xl:justify-between xl:gap-10">
      <div class="min-w-0">
      <p class="kicker mb-1">/ THE FULL MENU</p>
      <h1 class="mb-1 text-4xl text-brand-burgundy md:text-5xl">Our menu</h1>
      <p class="max-w-3xl text-sm md:text-base">Everything we serve at Olympic Cafe in Waltham Cross, with prices. Have an allergy or dietary need? Please tell us before you order, or call <a href="${B.phoneHref}" class="whitespace-nowrap font-semibold text-brand-burgundy underline">${B.phoneDisplay}</a>.</p>
      <p class="js-only mt-1 max-w-3xl text-sm md:text-base">Tap <span class="font-semibold text-brand-burgundy">+</span> to jot down your order and see the total, then show it at the counter.</p>
      <p class="print-only">${B.address.street}, ${B.address.town}, ${B.address.postcode}. Full menu: ${B.baseUrl.replace('https://', '')}/menu.html</p>
      </div>
      <nav class="menu-strip mt-3 xl:mt-0 xl:shrink-0" aria-label="Popular menu sections">
        ${EXPLORE.map((t) => `<a href="#${t.cat}">${cropped({ name: t.crop, alt: t.alt, sizes: '80px', cls: 'plate-frame' })}${esc(t.label)}</a>`).join('\n        ')}
      </nav>
      </div>
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
            ${MENU_GROUPS.map((g) => `<optgroup label="${esc(g.label)}">${g.ids.map((id) => `<option value="${id}">${esc(MENU.find((c) => c.id === id).name)}</option>`).join('')}</optgroup>`).join('\n            ')}
          </select>
        </div>
        <label class="veg-toggle justify-center">
          <input id="menu-veg" type="checkbox" />
          Vegetarian
        </label>
      </form>
      <div class="chip-rail js-only hidden md:mt-2 md:block">
        <nav id="menu-chips" class="chip-scroll" aria-label="Menu categories">
          <a class="chip" href="#menu-results" data-chip="" aria-current="true">All categories</a>
          ${MENU.map((c) => `<a class="chip" href="#${c.id}" data-chip="${c.id}">${esc(c.name)}</a>`).join('\n          ')}
        </nav>
        <button id="chips-back" type="button" class="chip-arrow chip-arrow-back" tabindex="-1" aria-label="Show earlier categories" disabled><span class="chip-arrow-icon"><svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></span></button>
        <button id="chips-next" type="button" class="chip-arrow chip-arrow-next" tabindex="-1" aria-label="Show more categories" disabled><span class="chip-arrow-icon"><svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></button>
      </div>
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
      <div class="flex flex-wrap items-center gap-x-4">
        <button id="menu-reset" type="button" class="text-link hidden text-sm">Reset search and filters</button>
        <button id="menu-print" type="button" class="text-link text-sm">Print this menu</button>
      </div>
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
  </div>

  <div id="pad-toast" class="pad-toast js-only" role="status" aria-live="polite"></div>
  <button id="pad-bar" type="button" class="pad-bar js-only" aria-haspopup="dialog" hidden></button>

  <dialog id="pad" class="pad-dialog js-only" aria-labelledby="pad-title">
    <div class="pad-head">
      <div>
        <p class="kicker">/ ORDER PAD</p>
        <h2 id="pad-title" class="text-3xl text-brand-burgundy">Your order</h2>
      </div>
      <button id="pad-close" type="button" class="pad-icon-btn" aria-label="Close your order">
        <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>

    <div id="pad-shared" class="pad-section" hidden>
      <h3 class="text-xl">Someone shared an order with you</h3>
      <p id="pad-shared-text" class="mt-1 text-sm"></p>
      <ul id="pad-shared-lines" class="my-3 text-sm"></ul>
      <p class="mb-3 text-sm">You already have items on your pad. Which one would you like to use?</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <button id="pad-shared-replace" type="button" class="btn btn-primary">Replace my pad</button>
        <button id="pad-shared-keep" type="button" class="btn btn-secondary">Keep mine</button>
      </div>
    </div>

    <div id="pad-body">
      <p id="pad-note" class="pad-note" hidden></p>
      <div id="pad-empty" class="pad-section text-center" hidden>
        <p class="mb-1 font-semibold">Nothing on your pad yet.</p>
        <p class="text-sm">Tap + next to any dish to add it.</p>
        <button id="pad-undo" type="button" class="text-link text-sm" hidden>Undo clear</button>
      </div>
      <div id="pad-filled">
        <ul id="pad-lines" class="pad-section"></ul>
        <div class="pad-section">
          <p class="flex items-baseline gap-3 font-display text-2xl font-semibold"><span>Estimated total</span><span class="leader" aria-hidden="true"></span><span id="pad-total" class="text-brand-burgundy"></span></p>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span class="text-sm font-semibold" id="pad-split-label">Split between</span>
            <div class="pad-stepper" role="group" aria-labelledby="pad-split-label">
              <button id="pad-split-down" type="button" class="pad-step" aria-label="Fewer people">&minus;</button>
              <span id="pad-split-count" class="pad-qty"></span>
              <button id="pad-split-up" type="button" class="pad-step" aria-label="More people">+</button>
            </div>
          </div>
          <p id="pad-split-each" class="mt-1 text-right text-sm font-semibold" hidden></p>
          <p class="mt-3 text-sm">This is an estimate, and the till has the final price. Your order isn't sent to us, so please show it at the counter. Tell us your choices when you order, and any allergies or dietary needs.</p>
        </div>
        <div class="pad-section grid gap-3">
          <button id="pad-show" type="button" class="btn btn-primary w-full">Show at the counter</button>
          <div class="grid gap-3 sm:grid-cols-2">
            <a href="${B.phoneHref}" class="btn btn-secondary w-full">${icon('phone', 18)}Call us</a>
            <button id="pad-share" type="button" class="btn btn-secondary w-full">Share this order</button>
          </div>
          <div id="pad-link-box" hidden>
            <label for="pad-link" class="mb-1 block text-sm font-semibold">Copy this link to share your order</label>
            <input id="pad-link" type="text" class="field-control" readonly />
          </div>
          <button id="pad-clear" type="button" class="text-link justify-self-center text-sm">Clear my pad</button>
        </div>
      </div>
    </div>

    <div id="pad-counter" class="pad-counter" hidden>
      <p class="kicker">/ OLYMPIC CAFE ORDER</p>
      <ul id="pad-counter-lines" class="my-4 flex-1"></ul>
      <p class="flex items-baseline gap-3 font-display text-3xl font-semibold"><span>Estimate</span><span class="leader" aria-hidden="true"></span><span id="pad-counter-total" class="text-brand-burgundy"></span></p>
      <button id="pad-counter-back" type="button" class="btn btn-secondary mt-4 w-full">Back to my pad</button>
    </div>
  </dialog>`,
};
