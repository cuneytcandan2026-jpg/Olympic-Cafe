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

// Add genuine customer reviews here, with permission, as { quote, author, source }. The homepage section
// only appears when this list has entries. Never add review markup or a rating that is not real.
export const REVIEWS = [];

// Set at build time. With no endpoint the contact page shows phone and email only, never a form that cannot deliver.
export const CONTACT_CONFIG = {
  endpoint: process.env.CONTACT_ENDPOINT || '',
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
};
