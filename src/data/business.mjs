// Business facts used by every page and by the structured data. Change them here only.
// These are the values already published on the site. See docs/HANDOVER.md for owner confirmation.
export const BUSINESS = {
  name: 'Olympic Cafe',
  baseUrl: 'https://olympiccafe.co.uk',
  phoneDisplay: '01992 631 555',
  phoneHref: 'tel:+441992631555',
  phoneSchema: '+441992631555',
  email: 'info@olympiccafe.co.uk',
  address: {
    street: '257 High Street',
    town: 'Waltham Cross',
    county: 'Hertfordshire',
    postcode: 'EN8 7BE',
    country: 'GB',
  },
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=257%20High%20Street%2C%20Waltham%20Cross%2C%20EN8%207BE',
  mapEmbedUrl: 'https://maps.google.com/maps?q=257%20High%20Street%2C%20Waltham%20Cross%2C%20Hertfordshire%2C%20EN8%207BE&z=15&output=embed',
  hours: [
    { label: 'Mon–Sat', labelLong: 'Monday to Saturday', time: '5:30am–5pm', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '05:30', closes: '17:00' },
    { label: 'Sunday', labelLong: 'Sunday', time: '6am–4pm', days: ['Sunday'], opens: '06:00', closes: '16:00' },
  ],
  servesCuisine: ['British', 'Mediterranean'],
  descriptor: 'Breakfast · Brunch · Lunch',
};

// Dates when the usual hours don't apply, as 'YYYY-MM-DD': { closed: true } or { opens: '08:00', closes: '14:00' }.
// These always win over the bank holiday list below. The homepage reads them for its open and closed status.
export const HOURS_EXCEPTIONS = {};

// England and Wales, from gov.uk/bank-holidays.json, plus the real Christmas and Boxing Day dates in years when gov.uk
// lists a substitute day instead. With no exception set, the homepage says hours may differ rather than "Open".
export const BANK_HOLIDAYS = [
  '2026-12-25', '2026-12-26', '2026-12-28',
  '2027-01-01', '2027-03-26', '2027-03-29', '2027-05-03', '2027-05-31', '2027-08-30',
  '2027-12-25', '2027-12-26', '2027-12-27', '2027-12-28',
];
// After this date the list has run out, so the homepage shows the usual hours and makes no live claim until it is extended.
export const BANK_HOLIDAYS_UNTIL = '2027-12-31';

// One short temporary message shown on every page, such as Christmas or bank holiday hours. Leave empty for none.
export const NOTICE = process.env.SITE_NOTICE || '';

// Add genuine customer reviews here, with permission, as { quote, author, source }. The homepage section
// only appears when this list has entries. Never add review markup or a rating that is not real.
export const REVIEWS = [];

// Set at build time. With no endpoint the contact page shows phone and email only, never a form that cannot deliver.
export const CONTACT_CONFIG = {
  endpoint: process.env.CONTACT_ENDPOINT || '',
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
};
