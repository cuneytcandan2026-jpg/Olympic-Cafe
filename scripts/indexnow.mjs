// Tells Bing and other IndexNow search engines that the site's pages have changed.
// Run it after a deploy has gone live: npm run indexnow
// It sends only the public page addresses from sitemap.xml. The key file at the site root proves we own the domain.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BUSINESS } from '../src/data/business.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keyFile = fs.readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file found at the repo root.');
const key = keyFile.replace('.txt', '');
const host = new URL(BUSINESS.baseUrl).host;

// Check the key file is live first, or the search engines will reject the submission.
const live = await fetch(`${BUSINESS.baseUrl}/${keyFile}`);
if (!live.ok || (await live.text()).trim() !== key) throw new Error(`${BUSINESS.baseUrl}/${keyFile} is not live yet. Deploy first, then run this again.`);

const urlList = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${BUSINESS.baseUrl}/${keyFile}`, urlList }),
});
console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URLs`);
if (response.status >= 400) process.exitCode = 1;
