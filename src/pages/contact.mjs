import { BUSINESS as B, CONTACT_CONFIG as C } from '../data/business.mjs';
import { addressLines, esc, icon } from '../templates/layout.mjs';

function field({ id, label, type = 'text', autocomplete, hint, multiline }) {
  const describedBy = `${id}-error${hint ? ` ${id}-hint` : ''}`;
  const control = multiline
    ? `<textarea id="${id}" name="${id}" rows="5" required maxlength="5000" class="field-control py-3" aria-describedby="${describedBy}"></textarea>`
    : `<input id="${id}" name="${id}" type="${type}" required maxlength="${type === 'email' ? 254 : 100}" autocomplete="${autocomplete}" class="field-control" aria-describedby="${describedBy}" />`;
  return `<div class="mb-4">
            <label for="${id}" class="mb-1 block font-semibold">${esc(label)}</label>
            ${control}
            <p id="${id}-error" class="mt-1 text-sm font-semibold text-brand-burgundy" hidden></p>
          </div>`;
}

const directContact = `<a href="${B.phoneHref}" class="text-link">${B.phoneDisplay}</a> or <a href="mailto:${B.email}" class="text-link">${B.email}</a>`;

const form = C.endpoint
  ? `<div class="js-only">
        <h2 id="form-heading" class="mb-1 text-2xl text-brand-burgundy md:text-3xl">Send us a message</h2>
        <p class="mb-4 text-sm">We only use your details to reply to you. All fields are required.</p>
        <div id="form-success" class="mb-4 rounded-xl border-2 border-brand-deepgreen bg-white p-4 font-semibold text-brand-deepgreen" role="status" tabindex="-1" hidden></div>
        <div id="form-error" class="mb-4 rounded-xl border-2 border-brand-burgundy bg-white p-4" role="alert" tabindex="-1" hidden>
          <p id="form-error-text" class="font-semibold text-brand-burgundy"></p>
          <p class="text-sm">Your message is still in the form below. You can try again, or reach us on ${directContact}.</p>
        </div>
        <form id="contact-form" action="${esc(C.endpoint)}" method="post" novalidate data-endpoint="${esc(C.endpoint)}">
          ${field({ id: 'name', label: 'Your name', autocomplete: 'name' })}
          ${field({ id: 'email', label: 'Your email', type: 'email', autocomplete: 'email' })}
          ${field({ id: 'message', label: 'Your message', multiline: true })}
          <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label for="company">Leave this field empty</label>
            <input id="company" name="company" type="text" tabindex="-1" autocomplete="off" />
          </div>
          ${C.turnstileSiteKey ? `<div class="cf-turnstile mb-4" data-sitekey="${esc(C.turnstileSiteKey)}"></div>` : ''}
          <button id="form-submit" type="submit" class="btn btn-primary w-full sm:w-auto">Send message</button>
        </form>
      </div>
      <noscript>
        <h2 class="mb-1 text-2xl text-brand-burgundy">Get in touch</h2>
        <p>Our message form needs JavaScript. Please call or email us instead: ${directContact}.</p>
      </noscript>`
  : `<h2 id="form-heading" class="mb-1 text-2xl text-brand-burgundy md:text-3xl">Talk to us</h2>
        <p class="mb-4">The quickest way to reach us is by phone during opening hours, or you can send us an email.</p>
        <div class="flex flex-wrap gap-3">
          <a href="${B.phoneHref}" class="btn btn-primary w-full sm:w-auto">Call ${B.phoneDisplay}</a>
          <a href="mailto:${B.email}" class="btn btn-secondary w-full sm:w-auto">Email us</a>
        </div>`;

export default {
  key: 'contact',
  path: '/contact.html',
  title: 'Contact | Olympic Cafe, Waltham Cross',
  description: 'Find Olympic Cafe at 257 High Street, Waltham Cross, Hertfordshire, EN8 7BE. Get directions, opening hours and contact details, or call 01992 631 555.',
  ogTitle: 'Contact | Olympic Cafe',
  ogDescription: 'Find us, call us or email us. Olympic Cafe, 257 High Street, Waltham Cross.',
  ogImage: 'contact',
  scripts: C.endpoint ? ['contact'] : [],
  extraHead: C.endpoint && C.turnstileSiteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : '',
  body: `  <section class="paper-texture bg-brand-creamlight py-6 md:py-10">
    <div class="container-page">
      <p class="kicker mb-1">/ GET IN TOUCH</p>
      <h1 class="mb-2 text-4xl text-brand-burgundy md:text-5xl">Come say hello</h1>
      <p class="max-w-2xl md:text-lg">Find us on Waltham Cross High Street, open seven days a week for eat-in or takeaway.</p>
    </div>
  </section>

  <section class="pb-8" aria-label="Contact details">
    <div class="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="card p-5">
        <h2 class="mb-1 flex items-center gap-2 text-lg text-brand-burgundy">${icon('pin')}Address</h2>
        <p class="text-sm">${addressLines}</p>
        <a href="${B.directionsUrl}" rel="noopener" class="text-link text-sm">Get directions</a>
      </div>
      <div class="card p-5">
        <h2 class="mb-1 flex items-center gap-2 text-lg text-brand-burgundy">${icon('phone')}Phone</h2>
        <p class="text-sm">Call ahead for takeaway or to check availability.</p>
        <a href="${B.phoneHref}" class="text-link text-sm">${B.phoneDisplay}</a>
      </div>
      <div class="card p-5">
        <h2 class="mb-1 flex items-center gap-2 text-lg text-brand-burgundy">${icon('mail')}Email</h2>
        <p class="text-sm">Drop us a line and we'll get back to you.</p>
        <a href="mailto:${B.email}" class="text-link break-all text-sm">${B.email}</a>
      </div>
      <div class="card p-5">
        <h2 class="mb-1 flex items-center gap-2 text-lg text-brand-burgundy">${icon('clock')}Hours</h2>
        <dl class="text-sm">
          ${B.hours.map((h) => `<div class="flex justify-between gap-3"><dt class="font-semibold">${h.label}</dt><dd>${h.time}</dd></div>`).join('\n          ')}
        </dl>
        <p class="mt-1 text-sm">Eat in or take away</p>
      </div>
    </div>
  </section>

  <section class="pb-10 md:pb-14">
    <div class="container-page grid items-start gap-6 lg:grid-cols-2">
      <div class="card p-5 md:p-8">
        ${form}
      </div>
      <div class="overflow-hidden rounded-3xl shadow-base">
        <iframe title="Map showing Olympic Cafe at 257 High Street, Waltham Cross" src="${B.mapEmbedUrl}" width="600" height="400" class="block h-80 w-full border-0 md:h-[28rem]" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </section>`,
};
