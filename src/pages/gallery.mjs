import { PHOTOS } from '../data/gallery.mjs';
import { esc, photo } from '../templates/layout.mjs';

const SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 360px) 50vw, 100vw';

const tiles = PHOTOS.map((p, i) => `<li>
          <figure>
            <a class="gallery-link" href="/assets/img/r/${p.img}-1200.webp" data-index="${i}" data-full="/assets/img/r/${p.img}-1200.webp" data-label="${esc(p.label)}" aria-label="View larger photo: ${esc(p.label)}">
              ${photo({ img: p.img, alt: `${p.label} at Olympic Cafe`, sizes: SIZES, cls: 'aspect-video w-full object-cover', eager: i < 4 })}
            </a>
            <figcaption class="mt-1.5 text-sm leading-snug">${esc(p.label)}</figcaption>
          </figure>
        </li>`).join('\n        ');

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

  <section class="pb-10 md:pb-14" aria-label="Photo gallery">
    <div class="container-page">
      <ul class="grid gap-x-4 gap-y-5 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        ${tiles}
      </ul>
    </div>
  </section>

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
      </figure>
    </div>
  </dialog>`,
};
