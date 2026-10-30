// Shared by every page: mobile navigation, the action bar while typing, and scroll reveals.
(function () {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('mobile-nav');

  function setNav(open, returnFocus) {
    nav.classList.toggle('hidden', !open);
    nav.classList.toggle('flex', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    toggle.querySelector('[data-icon-open]').toggleAttribute('hidden', open);
    toggle.querySelector('[data-icon-close]').toggleAttribute('hidden', !open);
    if (!open && returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setNav(false, true);
  });
  document.addEventListener('click', (e) => {
    if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setNav(false);
  });

  // The action bar steps aside while a field has focus, so it can't cover what's being typed.
  const isField = (el) => el && el.matches && el.matches('input:not([type=checkbox]), textarea, select');
  document.addEventListener('focusin', (e) => document.body.classList.toggle('typing', isField(e.target)));
  document.addEventListener('focusout', () => document.body.classList.remove('typing'));

  // Marks today's row in any opening hours list, using UK time wherever the visitor is.
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(new Date());
  document.querySelectorAll('[data-days]').forEach((row) => {
    if (!row.dataset.days.split(',').includes(today)) return;
    row.classList.add('is-today');
    row.querySelector('.today-tag').hidden = false;
  });

  // Only sections that are off-screen right now get hidden, and only here in JS,
  // so nothing above the fold animates and nothing stays hidden if this never runs.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
  }
})();
