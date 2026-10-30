# Contact form endpoint

GitHub Pages only serves static files, so the form needs a small endpoint hosted elsewhere. Until one is live, the contact page shows phone and email only and no form.

Needs: a free Cloudflare account, a free Resend account, and the `olympiccafe.co.uk` domain verified in Resend for sending.

## 1. Deploy the Worker

```sh
cd workers/contact
npx wrangler deploy worker.js --name olympic-cafe-contact --compatibility-date 2026-10-01
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET   # optional but recommended, see step 2
```

Set these as plain variables on the Worker in the Cloudflare dashboard:

| Variable | Value |
| --- | --- |
| `ALLOWED_ORIGIN` | `https://olympiccafe.co.uk` |
| `MAIL_TO` | The inbox that should receive messages, once confirmed by the owner |
| `MAIL_FROM` | `Olympic Cafe Website <website@olympiccafe.co.uk>` |

Add a Cloudflare rate-limit rule on the Worker route, for example 5 POST requests per minute per IP.

## 2. Spam protection

The form always includes a hidden honeypot field. For stronger protection, create a Cloudflare Turnstile widget for `olympiccafe.co.uk`, store its secret as `TURNSTILE_SECRET` above, and use its site key in step 3.

## 3. Rebuild the site with the endpoint

```sh
CONTACT_ENDPOINT=https://olympic-cafe-contact.<account>.workers.dev TURNSTILE_SITE_KEY=<site key> npm run build
```

Commit and deploy the rebuilt files. The form now appears on the contact page.

## 4. Test before announcing it

Send a real message and confirm it arrives in `MAIL_TO`, and that replying goes to the visitor's address. The page only says "sent" after this Worker reports that Resend accepted the email.
