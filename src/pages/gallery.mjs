import { GROUPS, PHOTOS } from '../data/gallery.mjs';
import { esc, photo } from '../templates/layout.mjs';

const SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw';
const FEATURE_SIZES = '(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw';

let index = 0;
function tile(p, position) {
  const i = index++;
  const feature = position === 0 && !p.wide;
  return `<li${feature ? ' class="gallery-feature"' : p.wide ? ' class="gallery-wide"' : ''}>
          <figure>
            <a class="gallery-link" href="/assets/img/r/${p.img}-1200.webp" data-index="${i}" data-full="/assets/img/r/${p.img}-1200.webp" data-label="${esc(p.label)}"${p.menu ? ` data-menu="${p.menu}"` : ''} aria-label="View larger photo: ${esc(p.label)}">
              ${photo({ img: p.img, alt: `${p.label} at Olympic Cafe`, sizes: feature || p.wide ? FEATURE_SIZES : SIZES, eager: i < 3 })}
            </a>
            <figcaption class="mt-1.5 px-1 text-sm leading-snug">${esc(p.label)}</figcaption>
          </figure>
        </li>`;
}

const groups = GROUPS.map((g) => `<section class="mb-10 md:mb-14" aria-labelledby="group-${g.id}">
      <div class="container-page mb-3 flex flex-wrap items-baseline justify-between gap-x-6">
        <h2 id="group-${g.id}" class="text-2xl text-brand-burgundy md:text-3xl">${esc(g.title)}</h2>
        ${g.menu ? `<a href="/menu.html#${g.menu}" class="text-link text-sm">${esc(g.link)}</a>` : ''}
      </div>
      <ul class="gallery-group">
        ${PHOTOS.filter((p) => p.group === g.id).map(tile).join('\n        ')}
      </ul>
    </section>`).join('\n\n    ');

export default {
  key: 'gallery',
  path: '/gallery.html',
  title: 'Gallery | Olympic Cafe, Waltham Cross',
  description: 'Photos of food and drink from Olympic Cafe in Waltham Cross: cooked breakfasts, brunch, burgers, coffee, juices and more.',
  ogTitle: 'Gallery | Olympic Cafe',
  ogDescription: 'A look at what is on the plate at Olympic Cafe, Waltham Cross.',
  ogImage: 'gallery',
  scripts: ['gallery'],
  body: `  <section class="paper-texture bg-brand-creamlight py-6 md:py-10">
    <div class="container-page">
      <p class="kicker mb-1">/ GALLERY</p>
      <h1 class="mb-2 text-4xl text-brand-burgundy md:text-5xl">What's on the plate</h1>
      <p class="max-w-2xl md:text-lg">A taste of what comes out of our kitchen in Waltham Cross.</p>
    </div>
  </section>

  <div class="pt-2">
    ${groups}
  </div>

  <dialog id="lightbox" class="lightbox" aria-label="Photo viewer">
    <div class="relative h-full w-full">
      <button id="lightbox-close" type="button" class="lightbox-btn right-3 top-3" aria-label="Close photo viewer">
        <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>
      </button>
      <button id="lightbox-prev" type="button" class="lightbox-btn left-3 top-1/2 -mt-6" aria-label="Previous photo">
        <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button id="lightbox-next" type="button" class="lightbox-btn right-3 top-1/2 -mt-6" aria-label="Next photo">
        <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <figure class="flex h-full w-full flex-col items-center justify-center px-16 py-16">
        <img id="lightbox-img" alt="" class="max-h-full min-h-0 max-w-full rounded-2xl object-contain" />
        <figcaption id="lightbox-caption" class="mt-3 text-center text-sm text-brand-creamlight" aria-live="polite"></figcaption>
        <a id="lightbox-menu" class="lightbox-menu" href="/menu.html" hidden>See it on the menu</a>
      </figure>
    </div>
  </dialog>`,
};
