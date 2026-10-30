// Contact form endpoint. GitHub Pages can't run server code, so this deploys separately as a
// Cloudflare Worker. All secrets live in the Worker's environment and never reach the browser.
// Setup: see workers/contact/README.md.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 100, email: 254, message: 5000 };

function json(body, status, origin) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', Vary: 'Origin' };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function validate({ name, email, message }) {
  const fields = {};
  if (!name) fields.name = 'Please enter your name.';
  else if (name.length > LIMITS.name || /[\r\n]/.test(name)) fields.name = 'Please enter a shorter name, on one line.';
  if (!email) fields.email = 'Please enter your email address.';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email) || /[\r\n]/.test(email)) fields.email = 'Please enter a valid email address.';
  if (!message) fields.message = 'Please enter your message.';
  else if (message.length > LIMITS.message) fields.message = 'Please shorten your message to 5,000 characters or fewer.';
  return fields;
}

async function passesTurnstile(token, env, fetchImpl, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (ip) body.set('remoteip', ip);
  const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = await response.json();
  return result.success === true;
}

export default {
  async fetch(request, env) {
    const fetchImpl = env.fetchImpl || fetch;
    const requestOrigin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN;

    if (requestOrigin && requestOrigin !== allowed) return json({ ok: false, error: 'origin_not_allowed' }, 403);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowed,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Accept',
          Vary: 'Origin',
        },
      });
    }
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405, allowed);

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ ok: false, error: 'invalid_request' }, 400, allowed);
    }
    const text = (key) => String(form.get(key) || '').trim();

    // Reported as a failure rather than a fake success, in case a browser's autofill ever fills the honeypot.
    if (text('company')) return json({ ok: false, error: 'rejected' }, 422, allowed);

    const data = { name: text('name'), email: text('email'), message: text('message') };
    const fields = validate(data);
    if (Object.keys(fields).length) return json({ ok: false, error: 'invalid_fields', fields }, 400, allowed);

    try {
      const human = await passesTurnstile(text('cf-turnstile-response'), env, fetchImpl, request.headers.get('CF-Connecting-IP'));
      if (!human) return json({ ok: false, error: 'spam_check_failed' }, 422, allowed);

      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: env.MAIL_FROM,
          to: [env.MAIL_TO],
          reply_to: data.email,
          subject: `Website message from ${data.name}`,
          text: `${data.message}\n\nFrom: ${data.name} <${data.email}>\nSent from the contact form on olympiccafe.co.uk`,
        }),
      });
      if (!response.ok) return json({ ok: false, error: 'delivery_failed' }, 502, allowed);
    } catch {
      return json({ ok: false, error: 'delivery_failed' }, 502, allowed);
    }

    return json({ ok: true }, 200, allowed);
  },
};
