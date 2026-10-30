export default {
  key: 'notfound',
  path: '/404.html',
  noindex: true,
  title: 'Page not found | Olympic Cafe, Waltham Cross',
  description: 'That page could not be found. Try the Olympic Cafe menu or contact page.',
  ogImage: 'home',
  body: `  <section class="paper-texture py-14">
    <div class="container-page">
      <p class="kicker mb-1">/ PAGE NOT FOUND</p>
      <h1 class="mb-2 text-4xl text-brand-burgundy md:text-5xl">We can't find that page</h1>
      <p class="mb-5 max-w-xl">It may have moved. These should help you find what you were after.</p>
      <div class="flex flex-wrap gap-3">
        <a href="/" class="btn btn-primary w-full sm:w-auto">Go to the homepage</a>
        <a href="/menu.html" class="btn btn-secondary w-full sm:w-auto">View Menu</a>
        <a href="/contact.html" class="btn btn-secondary w-full sm:w-auto">Find Us</a>
      </div>
    </div>
  </section>`,
};
