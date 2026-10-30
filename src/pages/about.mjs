import { diptych } from '../templates/layout.mjs';

export default {
  key: 'about',
  path: '/about.html',
  title: 'About | Olympic Cafe, Waltham Cross',
  description: 'Olympic Cafe is a neighbourhood cafe in Waltham Cross serving British cafe classics, Mediterranean-inspired breakfasts and family favourites. Eat in or take away.',
  ogTitle: 'About | Olympic Cafe',
  ogDescription: 'A neighbourhood cafe in Waltham Cross with British roots and Mediterranean character.',
  ogImage: 'about',
  body: `  <section class="paper-texture bg-brand-creamlight py-8 md:py-12">
    <div class="container-page max-w-3xl">
      <p class="kicker mb-2">/ ABOUT OLYMPIC CAFE</p>
      <h1 class="mb-3 text-4xl leading-tight text-brand-burgundy md:text-5xl">Your local cafe in Waltham Cross</h1>
      <p class="text-base md:text-lg">Olympic Cafe is a warm, welcoming neighbourhood cafe on the High Street, serving British cafe classics, Mediterranean-inspired breakfasts and familiar family favourites.</p>
    </div>
  </section>

  <section class="pb-10 md:pb-14" aria-label="British roots and Mediterranean character">
    ${diptych([
      { img: 'full-english-fries-2', alt: 'A cooked breakfast with bacon, egg, sausage, beans and chips, with a side plate of toast', title: 'British roots', text: "Full English breakfasts, Sunday roasts, shepherd's pie and proper cafe favourites.", dark: true },
      { img: 'avocado-toast-brie-fries', alt: 'Sicily Coast: crushed avocado on sourdough with mushrooms, sun-dried tomato, feta and pesto, with chips', title: 'Mediterranean character', text: 'Halloumi, feta, olives and sucuk run through our breakfasts and brunch menu.' },
    ], 'h2')}
  </section>

  <section class="bg-white py-10 md:py-14" aria-labelledby="expect-heading" data-reveal>
    <div class="container-page">
      <h2 id="expect-heading" class="mb-6 text-3xl text-brand-burgundy md:text-4xl">What to expect</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <div>
          <h3 class="mb-1 text-xl text-brand-burgundy">Cafe favourites</h3>
          <p class="text-sm">Set breakfasts, brunch, lunches, burgers, sandwiches, jacket potatoes and hot and cold drinks.</p>
        </div>
        <div>
          <h3 class="mb-1 text-xl text-brand-burgundy">Eat in or take away</h3>
          <p class="text-sm">Grab a table or call ahead for takeaway.</p>
        </div>
        <div>
          <h3 class="mb-1 text-xl text-brand-burgundy">Open seven days a week</h3>
          <p class="text-sm">From early morning, Monday to Sunday. See our opening hours below.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="py-10 md:py-14" data-reveal>
    <div class="container-page">
      <h2 class="mb-4 text-3xl text-brand-burgundy md:text-4xl">Join us for breakfast, brunch or lunch</h2>
      <div class="flex flex-wrap gap-3">
        <a href="/menu.html" class="btn btn-primary w-full sm:w-auto">View Menu</a>
        <a href="/contact.html" class="btn btn-secondary w-full sm:w-auto">Find Us</a>
      </div>
    </div>
  </section>`,
};
