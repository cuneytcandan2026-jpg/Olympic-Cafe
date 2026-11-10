import { BUSINESS as B, GA_ID } from '../data/business.mjs';

// Privacy and cookies notice. Keep it true to what the site does: update it before adding any new tracking,
// a contact form, embeds or marketing tools. The owner should read and confirm it (see docs/HANDOVER.md).
const UPDATED = '10 November 2026';
const address = `${B.address.street}, ${B.address.town}, ${B.address.postcode}`;

const section = (id, heading, body) => `
      <section aria-labelledby="${id}" class="mt-10">
        <h2 id="${id}" class="mb-3 text-2xl text-brand-burgundy md:text-3xl">${heading}</h2>
        ${body}
      </section>`;

const cookieRow = (name, purpose, expiry) => `<div class="border-b border-dotted border-brand-burgundy/30 py-3">
              <dt class="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold"><code class="font-accent text-brand-burgundy">${name}</code><span class="text-sm font-normal">Kept for ${expiry}</span></dt>
              <dd class="mt-1 text-sm">${purpose}</dd>
            </div>`;

export default {
  key: 'privacy',
  path: '/privacy.html',
  title: 'Privacy and Cookies | Olympic Cafe, Waltham Cross',
  description: 'How the Olympic Cafe website uses cookies and Google Analytics, what we collect, how long we keep it and how to change your cookie choice.',
  ogTitle: 'Privacy and Cookies | Olympic Cafe',
  ogImage: 'home',
  body: `  <section class="paper-texture bg-brand-creamlight py-8 md:py-12">
    <div class="container-page max-w-3xl">
      <p class="kicker mb-2">/ PRIVACY AND COOKIES</p>
      <h1 class="mb-3 text-4xl leading-tight text-brand-burgundy md:text-5xl">Privacy and cookies</h1>
      <p class="text-base md:text-lg">This notice explains what the Olympic Cafe website collects, why, and the choices you have. We keep it short because we collect very little.</p>
      <p class="mt-2 text-sm">Last updated ${UPDATED}.</p>
    </div>
  </section>

  <div class="container-page max-w-3xl pb-14">
    ${section('who', 'Who we are', `<p>Olympic Cafe, ${address}, is responsible for this website and the personal data described here. You can reach us on <a href="${B.phoneHref}" class="text-link">${B.phoneDisplay}</a>, by email at <a href="mailto:${B.email}" class="text-link">${B.email}</a>, or in person at the cafe.</p>`)}

    ${section('analytics', 'Google Analytics, only if you accept', `<p>We'd like to know how many people visit the site and which pages they use, so we can improve it. For that we use Google Analytics, but <strong>only if you click Accept</strong> on the cookie banner. Until then, nothing is sent to Google and no analytics cookies are set.</p>
        <p class="mt-3">If you accept, Google Analytics records things like the pages you view, roughly where you are (town or region, not your address), the device and browser you use, how you arrived at the site, and taps on our call, directions and menu buttons. It does not record your name, and Google Analytics does not store your full IP address. We have switched off advertising features, so this data is not used to show you ads.</p>
        <p class="mt-3">Google processes this data for us and may handle it outside the UK, under safeguards approved for UK data. We keep analytics data for 14 months. Our legal basis is your consent, which you can withdraw at any time.</p>`)}

    ${section('cookies', 'Cookies and storage we use', `<dl class="border-t-2 border-brand-burgundy/40">
            ${cookieRow('oc-consent', 'Remembers whether you accepted or rejected analytics, so we don\'t ask on every page. Stored in your browser, never sent to us.', '12 months')}
            ${cookieRow('_ga', 'Google Analytics: tells one visit from another. Only set if you accept.', '2 years')}
            ${cookieRow(`_ga_${GA_ID.replace(/^G-/, '')}`, 'Google Analytics: keeps track of your current visit. Only set if you accept.', '2 years')}
      </dl>
      <p class="mt-4"><button type="button" class="text-link js-only" data-cookie-settings>Change your cookie choice</button><span class="js-only"> (also under Cookie settings at the bottom of every page).</span> If you reject analytics after accepting, we delete the Google Analytics cookies from your browser.</p>`)}

    ${section('map', 'Google Maps', `<p>Our contact page shows a Google map, and our directions links open Google Maps. When the map loads, or you follow a directions link, Google receives your IP address and may set its own cookies. Google's use of that data is covered by <a href="https://policies.google.com/privacy" rel="noopener" class="text-link">Google's privacy policy</a>.</p>`)}

    ${section('hosting', 'Hosting', `<p>The website is hosted by GitHub Pages. Like most web hosts, GitHub records visitors' IP addresses in its server logs to keep the service secure. We don't see or use those logs. Our legal basis is our legitimate interest in running a secure website.</p>`)}

    ${section('contact', 'If you contact us', `<p>If you phone or email us, we use what you tell us only to reply to you, and we don't keep it longer than we need to. We never sell or share your details for marketing.</p>`)}

    ${section('rights', 'Your rights', `<p>You can ask us for a copy of the personal data we hold about you, ask us to correct or delete it, or object to how we use it. Contact us using the details above. If you're not happy with how we've handled your data, you can complain to the Information Commissioner's Office at <a href="https://ico.org.uk/make-a-complaint/" rel="noopener" class="text-link">ico.org.uk</a>.</p>`)}
  </div>`,
};
