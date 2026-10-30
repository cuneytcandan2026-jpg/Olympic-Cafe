// End-to-end checks in real Chrome. Run with: npm test
// Builds a second copy of the site with the contact form on (pointed at the real Worker code with a fake
// mail provider), so both the published no-form state and the form's success and failure paths get tested.
import { execFileSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import worker from '../workers/contact/worker.js';
import { MENU, dishCount } from '../src/data/menu.mjs';
import { BUSINESS } from '../src/data/business.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PREVIEW = path.join(ROOT, '.preview');
const SHOTS = path.join(ROOT, 'docs/preview');
const SITE = 'http://127.0.0.1:3201';
const FORM_SITE = 'http://127.0.0.1:3202';
const PAGES = { home: '/', about: '/about.html', menu: '/menu.html', gallery: '/gallery.html', contact: '/contact.html' };
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const results = [];
function check(group, name, pass, detail = '') {
  results.push({ group, name, pass, detail });
  if (!pass) console.log(`  FAIL [${group}] ${name} ${detail}`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, stdio: 'ignore', env: { ...process.env, CONTACT_ENDPOINT: '/api/contact', SITE_NOTICE: 'Test notice', OUT_DIR: PREVIEW } });
execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, stdio: 'ignore', env: { ...process.env, CONTACT_ENDPOINT: '', SITE_NOTICE: '', OUT_DIR: '' } });
fs.cpSync(path.join(ROOT, 'assets/img'), path.join(PREVIEW, 'assets/img'), { recursive: true });

const servers = [
  spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, env: { ...process.env, PORT: '3201', SITE_ROOT: ROOT }, stdio: 'ignore' }),
  spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, env: { ...process.env, PORT: '3202', SITE_ROOT: PREVIEW, MOCK_CONTACT: '1' }, stdio: 'ignore' }),
];
await wait(800);

const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const axeSource = fs.readFileSync(path.join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');

async function open(url, { width = 1440, height = 900, js = true, reduced = false, mobile = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });
  await page.setJavaScriptEnabled(js);
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'load' });
  return page;
}

// ---------- Static HTML: what crawlers see before any JavaScript ----------
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const fileOf = (key) => (key === 'home' ? 'index.html' : `${key}.html`);
const seenTitles = new Set();
const seenDescriptions = new Set();
for (const [key, urlPath] of Object.entries(PAGES)) {
  const html = read(fileOf(key));
  const group = `SEO ${key}`;
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/name="description" content="(.*?)"/)[1];
  check(group, 'unique title', !seenTitles.has(title), title);
  check(group, 'unique description, 70-170 chars', !seenDescriptions.has(description) && description.length >= 70 && description.length <= 170, String(description.length));
  seenTitles.add(title);
  seenDescriptions.add(description);
  check(group, 'exactly one h1', (html.match(/<h1[\s>]/g) || []).length === 1);
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  check(group, 'heading levels never skip', levels.every((l, i) => i === 0 || l <= levels[i - 1] + 1), levels.join(''));
  const canonical = html.match(/rel="canonical" href="(.*?)"/)[1];
  check(group, 'canonical is production and page-specific', canonical === `${BUSINESS.baseUrl}${urlPath}`, canonical);
  check(group, 'og:url matches canonical', html.includes(`property="og:url" content="${canonical}"`));
  const ogImage = html.match(/property="og:image" content="(.*?)"/)[1];
  const local = path.join(ROOT, ogImage.replace(BUSINESS.baseUrl, ''));
  check(group, 'og:image is an absolute JPEG that exists', ogImage.startsWith('https://') && ogImage.endsWith('.jpg') && fs.existsSync(local), ogImage);
  const meta = await sharp(local).metadata();
  check(group, 'og:image is 1200x630 and under 300KB', meta.width === 1200 && meta.height === 630 && fs.statSync(local).size < 300 * 1024);
  check(group, 'no runtime Tailwind or Google Fonts', !/cdn\.tailwindcss|fonts\.googleapis|fonts\.gstatic/.test(html));
  check(group, 'no index.html links', !/href="[^"]*index\.html/.test(html));
  check(group, 'no staging or local URLs', !/github\.io|localhost/.test(html));
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  check(group, 'no Dinner or night owls wording', !/dinner|night owl/i.test(visibleText));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
  check(group, 'one JSON-LD block', blocks.length === 1);
  const ld = JSON.parse(blocks[0][1]);
  check(group, 'schema has stable @id, url and menu', ld['@type'] === 'CafeOrCoffeeShop' && ld['@id'] === `${BUSINESS.baseUrl}/#cafe` && ld.url === `${BUSINESS.baseUrl}/` && ld.hasMenu === `${BUSINESS.baseUrl}/menu.html`);
  check(group, 'schema has no ratings or reviews', !ld.aggregateRating && !ld.review);
  check(group, 'schema details are visible on the page', html.includes(BUSINESS.address.postcode) && html.includes(BUSINESS.phoneDisplay));
}
const sitemap = read('sitemap.xml');
check('SEO', 'sitemap lists the 5 pages with / as home', Object.values(PAGES).every((p) => sitemap.includes(`<loc>${BUSINESS.baseUrl}${p}</loc>`)) && !sitemap.includes('index.html') && !sitemap.includes('404'));
check('SEO', 'robots.txt points at the sitemap', read('robots.txt').includes(`Sitemap: ${BUSINESS.baseUrl}/sitemap.xml`));
check('SEO', '404 page is noindex', read('404.html').includes('name="robots" content="noindex"'));

const menuHtml = read('menu.html');
const missingDishes = MENU.flatMap((c) => c.items).filter((i) => !menuHtml.includes(`>${i.name.replace(/&/g, '&amp;')}<`));
check('Menu HTML', `all ${dishCount} dishes are in the initial HTML`, missingDishes.length === 0, missingDishes.map((d) => d.name).join(', '));
check('Menu HTML', 'all categories have a section and anchor', MENU.every((c) => menuHtml.includes(`<section id="${c.id}"`)));
const allPrices = MENU.flatMap((c) => c.items).flatMap((i) => (i.prices ? Object.values(i.prices) : [i.price]));
check('Menu HTML', 'all prices are in the initial HTML', allPrices.every((p) => menuHtml.includes(`\u00a3${p}`)));
check('Menu HTML', 'only verified dishes get a Vegetarian label', (menuHtml.match(/>Vegetarian<\/p>/g) || []).length === MENU.flatMap((c) => c.items).filter((i) => i.veg).length);
check('Menu HTML', 'no veg label on the sausage kids meal', !/Egg, Cumberland Sausage &amp; Chips<\/h3>[\s\S]{0,200}Vegetarian/.test(menuHtml));
check('Links', 'telephone link is correct everywhere', read('index.html').includes('href="tel:+441992631555"') && !/tel:0/.test(read('contact.html')));
check('Links', 'directions link targets the cafe address', read('index.html').includes('google.com/maps/dir/?api=1&destination=257%20High%20Street'));

// ---------- Internal links and every referenced file resolve ----------
{
  const seen = new Set();
  const broken = [];
  for (const key of [...Object.keys(PAGES), '404']) {
    const html = read(key === '404' ? '404.html' : fileOf(key));
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"#]*)/g)].map((m) => m[1]);
    for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) refs.push(...m[1].split(',').map((s) => s.trim().split(' ')[0]));
    for (const ref of refs) {
      if (seen.has(ref)) continue;
      seen.add(ref);
      const response = await fetch(SITE + ref);
      if (response.status !== 200) broken.push(`${ref} ${response.status}`);
    }
    // Assets are skipped: the logo's #ids are shapes inside logo.svg, not page anchors.
    for (const m of html.matchAll(/href="\/(?!assets\/)[^"]*#([\w-]+)"/g)) {
      if (!menuHtml.includes(`id="${m[1]}"`)) broken.push(`#${m[1]}`);
    }
  }
  check('Links', `all ${seen.size} internal URLs return 200`, broken.length === 0, broken.join(', '));
  const svg = read('assets/img/logo.svg');
  const logoIds = [...read(fileOf('home')).matchAll(/logo\.svg#([\w-]+)/g)].map((m) => m[1]);
  check('Links', 'every logo part exists in logo.svg', logoIds.length > 0 && logoIds.every((id) => svg.includes(`id="${id}"`)), logoIds.join());
  for (const key of [...Object.keys(PAGES), '404']) {
    const html = read(key === '404' ? '404.html' : fileOf(key));
    check('Links', `${key}: footer credits Laara Digital with a link`, /Website designed by <a href="https:\/\/laaradigital\.co\.uk\/"[^>]*>Laara Digital<\/a>/.test(html));
  }
  const missing = await fetch(`${SITE}/no-such-page`);
  check('Links', 'unknown URLs return a real 404', missing.status === 404);
}

// ---------- /index.html resolves to / ----------
{
  const page = await open(`${SITE}/index.html?x=1#y`);
  await wait(200);
  check('Links', '/index.html forwards to / (client-side, GitHub Pages has no 301)', new URL(page.url()).pathname === '/' && page.url().includes('?x=1#y'), page.url());
  await page.close();
}

// ---------- Creative components: real data and working links ----------
{
  const home = read('index.html');
  const homeText = home.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  const prices = [['set-breakfast', 'Mediterranean Breakfast'], ['set-breakfast', 'Full Olympic'], ['brunch', 'Avo Breeze'], ['brunch', 'Sicily Coast'], ['burgers', 'Chicken Burger'], ['jacket-potato', 'Tuna Mayo'], ['sweet-savoury', 'Red Ring'], ['sweet-savoury', 'Black Ring'], ['sweet-savoury', 'Yellow Ring'], ['sweet-savoury', 'Blue Ring'], ['sweet-savoury', 'Green Ring'], ['sunday-roast', 'Lamb'], ['sunday-roast', 'Chicken']];
  const wrong = prices.filter(([c, n]) => !homeText.includes(`\u00a3${MENU.find((m) => m.id === c).items.find((i) => i.name === n).price}`));
  check('Creative', 'homepage prices all come from the menu', wrong.length === 0, wrong.join());
  const tileLinks = [...home.matchAll(/class="table-tile" href="\/menu\.html#([\w-]+)"/g)];
  check('Creative', 'all six category tiles link to real categories', tileLinks.length === 6 && tileLinks.every((m) => MENU.some((c) => c.id === m[1])));
  check('Creative', 'no unverified popularity or bundle wording', !/bestseller|customer favourite|most popular|meal deal|free drink/i.test(homeText));
  check('Creative', 'pairings say they are priced separately', /ordered and priced separately/.test(homeText));
  check('Creative', 'no booking, ordering or delivery features', !/book a table|order online|delivery|whatsapp|newsletter/i.test(homeText));
  const page = await open(`${SITE}/`, { reduced: true });
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Europe/London' }).format(new Date());
  const marked = await page.evaluate(() => [...document.querySelectorAll('.visit .is-today')].map((r) => r.dataset.days));
  check('Creative', "today's opening hours are marked in UK time", marked.length === 1 && marked[0].includes(today), marked.join());
  await page.close();
  const noJs = await open(`${SITE}/`, { js: false });
  check('Creative', 'without JS no row claims to be today', await noJs.$$eval('.today-tag', (els) => els.every((el) => el.hidden)));
  await noJs.close();
  const menu = await open(`${SITE}/menu.html`, { reduced: true });
  await menu.evaluate(() => { window.__printed = false; window.print = () => { window.__printed = true; }; });
  await menu.click('#menu-print');
  check('Creative', 'print button opens the print dialog', await menu.evaluate(() => window.__printed));
  await menu.emulateMediaType('print');
  const printed = await menu.evaluate(() => ({ header: getComputedStyle(document.querySelector('.site-header')).display, thumb: getComputedStyle(document.querySelector('.dish-thumb')).display, bar: getComputedStyle(document.querySelector('.action-bar')).display, items: [...document.querySelectorAll('[data-search]')].filter((el) => el.offsetParent !== null).length }));
  check('Creative', 'printed menu drops page furniture and photos but keeps every dish', printed.header === 'none' && printed.thumb === 'none' && printed.bar === 'none' && printed.items === dishCount, JSON.stringify(printed));
  await menu.close();
  const strip = await open(`${SITE}/menu.html`, { width: 390, height: 844, mobile: true, reduced: true });
  await strip.click('.menu-strip a[href="#burgers"]');
  await wait(200);
  const stripSections = await strip.evaluate(() => [...document.querySelectorAll('[data-category]')].filter((el) => el.offsetParent !== null).map((el) => el.id));
  check('Creative', 'photo strip opens the chosen category', stripSections.join() === 'burgers', stripSections.join());
  await strip.close();
  const notice = read('.preview/index.html');
  check('Creative', 'temporary notice appears when set', notice.includes('class="site-notice"') && notice.includes('Test notice'));
  check('Creative', 'no notice on the published build', !home.includes('class="site-notice"'));
}

// ---------- Without JavaScript ----------
for (const [key, urlPath] of Object.entries(PAGES)) {
  const page = await open(SITE + urlPath, { js: false, width: 390, height: 844 });
  const hidden = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('main h1, main h2, main h3, main p, main li, main a').forEach((el) => {
      const s = getComputedStyle(el);
      if (s.opacity === '0') out.push(el.textContent.trim().slice(0, 30));
    });
    return out;
  });
  check('No JS', `${key}: nothing is transparent`, hidden.length === 0, hidden.join(' | '));
  const nav = await page.evaluate(() => getComputedStyle(document.getElementById('mobile-nav')).display);
  check('No JS', `${key}: navigation links are reachable`, nav === 'flex', nav);
  if (key === 'menu') {
    const counts = await page.evaluate(() => ({
      items: [...document.querySelectorAll('[data-search]')].filter((el) => el.offsetParent !== null).length,
      sections: [...document.querySelectorAll('[data-category]')].filter((el) => el.offsetParent !== null).length,
      jumpLinks: [...document.querySelectorAll('noscript')].length,
      controls: getComputedStyle(document.getElementById('menu-form')).display,
    }));
    check('No JS', `menu: all ${dishCount} items readable`, counts.items === dishCount, String(counts.items));
    check('No JS', 'menu: all categories readable', counts.sections === MENU.length, String(counts.sections));
    check('No JS', 'menu: search controls that cannot work are hidden', counts.controls === 'none', counts.controls);
    const jump = await open(`${SITE}/menu.html#lunch`, { js: false, width: 390, height: 844, reduced: true });
    await wait(200);
    const top = await jump.evaluate(() => document.getElementById('lunch').getBoundingClientRect().top);
    await jump.close();
    check('No JS', 'menu: anchor link jumps to the category', top < 200, String(top));
  }
  await page.close();
}

// ---------- Menu behaviour ----------
const visibleCount = (page) => page.evaluate(() => [...document.querySelectorAll('[data-search]')].filter((el) => el.offsetParent !== null).length);
const visibleSections = (page) => page.evaluate(() => [...document.querySelectorAll('[data-category]')].filter((el) => el.offsetParent !== null).map((el) => el.id));
const statusText = (page) => page.$eval('#menu-status', (el) => el.textContent);
{
  const page = await open(`${SITE}/menu.html`, { width: 390, height: 844, mobile: true });
  check('Menu', 'all categories shown by default', (await visibleSections(page)).length === MENU.length);

  await page.type('#menu-search', 'chicken');
  await wait(50);
  const searchSections = await visibleSections(page);
  check('Menu', 'search works across categories', searchSections.length >= 5, searchSections.join(','));
  check('Menu', 'status describes the search scope', /matching "chicken" in all categories/.test(await statusText(page)), await statusText(page));

  await page.select('#menu-category', 'brunch');
  await wait(600);
  check('Menu', 'choosing a category shows only that category', (await visibleSections(page)).join() === 'brunch');
  check('Menu', 'choosing a category clears the search', (await page.$eval('#menu-search', (el) => el.value)) === '');
  check('Menu', 'category is shareable in the URL', page.url().endsWith('#brunch'), page.url());
  const placement = await page.evaluate(() => ({
    heading: document.getElementById('brunch-heading').getBoundingClientRect().top,
    barBottom: document.getElementById('menu-controls').getBoundingClientRect().bottom,
    scrollY: window.scrollY,
  }));
  check('Menu', 'category heading is visible below the sticky bars', placement.heading >= placement.barBottom, JSON.stringify(placement));
  check('Menu', 'choosing a category does not jump to the top of the page', placement.scrollY > 0, JSON.stringify(placement));

  await page.select('#menu-category', '');
  await wait(100);
  check('Menu', '"All categories" restores everything', (await visibleSections(page)).length === MENU.length);

  await page.click('#menu-veg');
  await wait(50);
  const vegSections = await visibleSections(page);
  check('Menu', 'vegetarian filter covers all categories by default', vegSections.includes('veggie-breakfast') && vegSections.includes('burgers') && (await visibleCount(page)) === 5, `${vegSections} ${await visibleCount(page)}`);
  check('Menu', 'vegetarian scope is stated', /5 vegetarian items in all categories/.test(await statusText(page)), await statusText(page));

  await page.select('#menu-category', 'lunch');
  await wait(100);
  const emptyVisible = await page.$eval('#menu-empty', (el) => !el.hidden);
  check('Menu', 'filter with no matches shows the empty state', emptyVisible);
  check('Menu', 'empty state names the scope', /No vegetarian-labelled items in Lunch/.test(await page.$eval('#menu-empty-text', (el) => el.textContent)));
  await page.click('#menu-empty-reset');
  await wait(100);
  check('Menu', 'empty-state reset restores the full menu', (await visibleCount(page)) === dishCount && !(await page.$eval('#menu-veg', (el) => el.checked)));
  check('Menu', 'reset clears the category from the URL', !page.url().includes('#'), page.url());
  check('Menu', 'reset returns focus to search', (await page.evaluate(() => document.activeElement.id)) === 'menu-search');

  await page.type('#menu-search', 'zzzzz');
  await wait(50);
  check('Menu', 'unknown search shows the empty state', await page.$eval('#menu-empty', (el) => !el.hidden));
  check('Menu', 'status announces no results', /No items matching "zzzzz"/.test(await statusText(page)));
  await page.close();

  const shared = await open(`${SITE}/menu.html#sunday-roast`, { width: 390, height: 844, mobile: true });
  await wait(200);
  check('Menu', 'opening a shared category link filters to it', (await visibleSections(shared)).join() === 'sunday-roast');
  check('Menu', 'shared link selects the category control', (await shared.$eval('#menu-category', (el) => el.value)) === 'sunday-roast');
  await shared.close();

  const desktop = await open(`${SITE}/menu.html`);
  await desktop.click('[data-chip="burgers"]');
  await wait(700);
  check('Menu', 'desktop chip marks itself as current', (await desktop.$eval('[data-chip="burgers"]', (el) => el.getAttribute('aria-current'))) === 'true');
  check('Menu', 'only one chip is current', (await desktop.$$eval('[data-chip][aria-current]', (els) => els.length)) === 1);
  check('Menu', 'no leftover ARIA tabs', (await desktop.$$eval('[role=tab],[role=tablist]', (els) => els.length)) === 0);
  await desktop.goBack();
  await wait(200);
  check('Menu', 'browser back returns to all categories', (await visibleSections(desktop)).length === MENU.length);
  await desktop.close();
}

// ---------- Header and sticky controls across widths ----------
for (const width of [320, 375, 390, 430, 768, 820, 1024, 1099, 1100, 1180, 1280, 1440]) {
  const page = await open(`${SITE}/menu.html`, { width, height: 800 });
  const data = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const header = document.querySelector('.site-header').getBoundingClientRect();
    const items = [...document.querySelectorAll('.site-header-inner > a, .site-header-inner nav a, .site-header-inner > div > a, .site-header-inner > div > button')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => el.getBoundingClientRect());
    let overlaps = 0;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].left < items[j].right + 8 && items[j].left < items[i].right + 8 && items[i].top < items[j].bottom && items[j].top < items[i].bottom) overlaps += 1;
      }
    }
    const inner = document.querySelector('.site-header-inner');
    return {
      varH: parseFloat(root.getPropertyValue('--header-h')),
      headerH: header.height,
      stickyTop: getComputedStyle(document.getElementById('menu-controls')).top,
      overlaps,
      overflow: inner.scrollWidth > inner.clientWidth,
      desktopNav: getComputedStyle(document.querySelector('[aria-label="Primary"]')).display !== 'none',
      toggle: getComputedStyle(document.getElementById('menu-toggle')).display !== 'none',
    };
  });
  check('Header', `${width}px: header height equals --header-h`, Math.round(data.headerH) === data.varH, `${data.headerH} vs ${data.varH}`);
  check('Header', `${width}px: sticky offset comes from --header-h`, parseFloat(data.stickyTop) === data.varH, data.stickyTop);
  check('Header', `${width}px: compact (no more than 76px)`, data.headerH <= 76, String(data.headerH));
  check('Header', `${width}px: nothing collides or overflows`, data.overlaps === 0 && !data.overflow, JSON.stringify(data));
  check('Header', `${width}px: exactly one navigation mode`, data.desktopNav !== data.toggle, JSON.stringify(data));
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  await wait(60);
  const stuck = await page.evaluate(() => ({
    header: document.querySelector('.site-header').getBoundingClientRect().bottom,
    bar: document.getElementById('menu-controls').getBoundingClientRect().top,
  }));
  check('Header', `${width}px: sticky bar sits exactly under the header`, Math.abs(stuck.header - stuck.bar) <= 1, JSON.stringify(stuck));
  await page.close();
}

// ---------- Layout at every requested size, on every page ----------
const SIZES = [[320, 640], [375, 667], [390, 844], [430, 932], [768, 1024], [1440, 900], [844, 390], [667, 375], [720, 450]];
for (const [width, height] of SIZES) {
  for (const [key, urlPath] of Object.entries(PAGES)) {
    const page = await open(SITE + urlPath, { width, height, reduced: true });
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await wait(30);
    const data = await page.evaluate(() => {
      const bar = document.querySelector('.action-bar');
      const barTop = getComputedStyle(bar).display === 'none' ? innerHeight : bar.getBoundingClientRect().top;
      const footer = document.querySelector('footer').getBoundingClientRect();
      const wide = [...document.querySelectorAll('body *')].filter((el) => el.offsetParent !== null && el.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && !el.closest('#menu-chips') && !el.closest('.menu-strip') && !el.closest('.sr-only'));
      return {
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        footerClear: footer.bottom <= barTop + 1,
        wide: wide.slice(0, 3).map((el) => el.tagName + '.' + el.className),
      };
    });
    check('Layout', `${width}x${height} ${key}: no horizontal overflow`, data.scrollW <= data.clientW && data.wide.length === 0, JSON.stringify(data));
    check('Layout', `${width}x${height} ${key}: action bar never covers the page end`, data.footerClear, JSON.stringify(data));
    await page.close();
  }
}
{
  // Short screens must not lose most of the view to sticky bars.
  const page = await open(`${SITE}/menu.html`, { width: 844, height: 390 });
  const positions = await page.evaluate(() => [getComputedStyle(document.querySelector('.site-header')).position, getComputedStyle(document.getElementById('menu-controls')).position]);
  check('Layout', 'landscape: header and menu bar scroll away', positions.join() === 'static,static', positions.join());
  await page.close();
  const zoom = await open(`${SITE}/menu.html`, { width: 720, height: 450 });
  const zoomPositions = await zoom.evaluate(() => getComputedStyle(document.querySelector('.site-header')).position);
  check('Layout', '200% zoom (1440x900): header scrolls away', zoomPositions === 'static', zoomPositions);
  await zoom.close();
  const gallery = await open(`${SITE}/gallery.html`, { width: 390, height: 844 });
  const galleryData = await gallery.evaluate(() => ({
    sticky: [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).position === 'sticky').length,
    three: [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).perspective !== 'none' || getComputedStyle(el).transform.startsWith('matrix3d')).length,
    captions: [...document.querySelectorAll('main figcaption')].filter((el) => el.offsetParent !== null && el.textContent.trim()).length,
    tiles: document.querySelectorAll('.gallery-link').length,
  }));
  check('Layout', 'gallery: no pinned or 3D effects', galleryData.sticky === 0 && galleryData.three === 0, JSON.stringify(galleryData));
  check('Layout', 'gallery: every photo has a visible caption', galleryData.captions === galleryData.tiles, JSON.stringify(galleryData));
  await gallery.close();
  const home = await open(`${SITE}/`, { width: 390, height: 844 });
  const homeData = await home.evaluate(() => ({
    stickySections: [...document.querySelectorAll('main *')].filter((el) => getComputedStyle(el).position === 'sticky').length,
    ctaBottom: document.querySelector('main .btn-primary').getBoundingClientRect().bottom,
    h1Top: document.querySelector('h1').getBoundingClientRect().top,
    fold: innerHeight - 60,
  }));
  check('Layout', 'home: no pinned scroll storytelling', homeData.stickySections === 0);
  check('Layout', 'home mobile: headline and buttons are above the fold', homeData.ctaBottom < homeData.fold && homeData.h1Top > 68, JSON.stringify(homeData));
  await home.close();
}

// ---------- Touch targets and form controls on mobile ----------
for (const [key, urlPath] of Object.entries(PAGES)) {
  const base = key === 'contact' ? FORM_SITE : SITE;
  const page = await open(base + urlPath, { width: 390, height: 844, mobile: true });
  await page.evaluate(() => document.getElementById('menu-toggle').click());
  const small = await page.evaluate(() => [...document.querySelectorAll('a, button, select, input:not([type=checkbox]), textarea, label.veg-toggle')]
    .filter((el) => el.offsetParent !== null && !el.closest('.sr-only') && !el.closest('[aria-hidden=true]') && !el.closest('p:not(.keep)') )
    .map((el) => ({ t: el.textContent.trim().slice(0, 24), ...el.getBoundingClientRect().toJSON() }))
    .filter((r) => r.height < 44 || r.width < 44)
    .map((r) => `${r.t} ${Math.round(r.width)}x${Math.round(r.height)}`));
  check('Touch', `${key}: all controls are at least 44x44`, small.length === 0, small.join(' | '));
  const fonts = await page.evaluate(() => [...document.querySelectorAll('input:not([type=checkbox]), textarea, select')].filter((el) => !el.closest('[aria-hidden=true]')).map((el) => parseFloat(getComputedStyle(el).fontSize)));
  check('Touch', `${key}: inputs are 16px or larger`, fonts.every((f) => f >= 16), fonts.join());
  await page.close();
}
{
  const page = await open(`${FORM_SITE}/contact.html`, { width: 390, height: 844, mobile: true });
  const attrs = await page.evaluate(() => ({ name: document.getElementById('name').autocomplete, email: document.getElementById('email').autocomplete, type: document.getElementById('email').type }));
  check('Touch', 'contact form has autocomplete attributes', attrs.name === 'name' && attrs.email === 'email' && attrs.type === 'email', JSON.stringify(attrs));
  const css = await page.evaluate(() => ({ pad: getComputedStyle(document.querySelector('.action-bar')).paddingBottom, meta: document.querySelector('meta[name=viewport]').content }));
  check('Touch', 'safe-area spacing is enabled', css.meta.includes('viewport-fit=cover'), css.meta);
  await page.focus('#message');
  await wait(300);
  const bar = await page.evaluate(() => getComputedStyle(document.querySelector('.action-bar')).visibility);
  check('Touch', 'action bar steps aside while typing', bar === 'hidden', bar);
  await page.evaluate(() => document.activeElement.blur());
  await wait(300);
  check('Touch', 'action bar returns after typing', (await page.evaluate(() => getComputedStyle(document.querySelector('.action-bar')).visibility)) === 'visible');
  const links = await page.$$eval('.action-bar a', (els) => els.map((a) => a.getAttribute('href')));
  check('Touch', 'action bar has Menu, Call and Directions', links[0].startsWith('/menu.html') && links[1] === BUSINESS.phoneHref && links[2] === BUSINESS.directionsUrl, links.join(' '));
  await page.close();
}

// ---------- Mobile navigation ----------
{
  const page = await open(`${SITE}/about.html`, { width: 390, height: 844 });
  const state = () => page.$eval('#menu-toggle', (el) => [el.getAttribute('aria-expanded'), el.getAttribute('aria-label')].join('|'));
  check('Keyboard', 'mobile nav starts closed and labelled', (await state()) === 'false|Open navigation menu', await state());
  await page.focus('#menu-toggle');
  await page.keyboard.press('Enter');
  check('Keyboard', 'mobile nav opens by keyboard and updates its label', (await state()) === 'true|Close navigation menu', await state());
  check('Keyboard', 'current page is marked in mobile nav', (await page.$eval('#mobile-nav [aria-current=page]', (el) => el.textContent)) === 'About');
  await page.keyboard.press('Escape');
  check('Keyboard', 'Escape closes mobile nav', (await state()) === 'false|Open navigation menu', await state());
  check('Keyboard', 'focus returns to the toggle', (await page.evaluate(() => document.activeElement.id)) === 'menu-toggle');
  const hiddenNav = await page.$eval('#mobile-nav', (el) => getComputedStyle(el).display);
  check('Keyboard', 'closed nav is out of the tab order', hiddenNav === 'none', hiddenNav);
  await page.close();
}

// ---------- Gallery dialog ----------
{
  const page = await open(`${SITE}/gallery.html`);
  const closed = await page.evaluate(() => {
    const d = document.getElementById('lightbox');
    return { open: d.open, display: getComputedStyle(d).display };
  });
  check('Dialog', 'closed lightbox is hidden from AT and keyboard', !closed.open && closed.display === 'none', JSON.stringify(closed));
  const tabbed = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    tabbed.push(await page.evaluate(() => document.activeElement.id));
  }
  check('Dialog', 'Tab never lands in the closed lightbox', !tabbed.some((id) => id.startsWith('lightbox')));

  await page.focus('.gallery-link[data-index="2"]');
  await page.keyboard.press('Enter');
  await wait(200);
  const opened = await page.evaluate(() => {
    const img = document.getElementById('lightbox-img');
    return { open: document.getElementById('lightbox').open, focus: document.activeElement.id, modal: document.getElementById('lightbox').matches(':modal'), src: img.getAttribute('src'), caption: document.getElementById('lightbox-caption').textContent };
  });
  check('Dialog', 'opens as a modal with focus inside', opened.open && opened.modal && opened.focus === 'lightbox-close', JSON.stringify(opened));
  check('Dialog', 'shows the chosen photo and a caption', /full-english-fries/.test(opened.src) && /3 of 25/.test(opened.caption), JSON.stringify(opened));
  const inside = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    inside.push(await page.evaluate(() => document.activeElement.id));
  }
  check('Dialog', 'Tab stays inside the dialog', inside.every((id) => id.startsWith('lightbox-')), inside.join());
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  check('Dialog', 'Shift+Tab stays inside the dialog', (await page.evaluate(() => document.activeElement.id)).startsWith('lightbox-'));
  await page.keyboard.press('ArrowRight');
  check('Dialog', 'arrow keys change photo', /4 of 25/.test(await page.$eval('#lightbox-caption', (el) => el.textContent)));
  const menuLink = await page.$eval('#lightbox-menu', (el) => ({ hidden: el.hidden, href: el.getAttribute('href') }));
  check('Dialog', 'recognised dishes link to their menu category', !menuLink.hidden && menuLink.href.endsWith('#set-breakfast'), JSON.stringify(menuLink));
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Escape');
  await wait(100);
  const after = await page.evaluate(() => ({ open: document.getElementById('lightbox').open, index: document.activeElement.dataset.index }));
  check('Dialog', 'Escape closes and focus returns to the photo', !after.open && after.index === '2', JSON.stringify(after));
  await page.setViewport({ width: 390, height: 844 });
  await page.click('.gallery-link[data-index="0"]');
  await wait(150);
  const fit = await page.evaluate(() => {
    const r = document.getElementById('lightbox-img').getBoundingClientRect();
    return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight && r.height > 50;
  });
  check('Dialog', 'photo fits the screen on mobile', fit);
  await page.mouse.click(195, 30);
  await wait(100);
  check('Dialog', 'clicking the backdrop closes it', !(await page.$eval('#lightbox', (el) => el.open)));
  await page.close();
}

// ---------- Contact: published state with no endpoint ----------
{
  const page = await open(`${SITE}/contact.html`);
  const data = await page.evaluate(() => ({
    form: !!document.querySelector('form'),
    tel: [...document.querySelectorAll('main a[href^="tel:"]')].filter((a) => a.offsetParent).length,
    mail: [...document.querySelectorAll('main a[href^="mailto:"]')].filter((a) => a.offsetParent).length,
    success: !!document.getElementById('form-success'),
  }));
  check('Contact', 'no endpoint: no form and no success message are shown', !data.form && !data.success);
  check('Contact', 'no endpoint: phone and email links are prominent', data.tel >= 2 && data.mail >= 2, JSON.stringify(data));
  await page.close();
}

// ---------- Contact: form states against the real Worker code ----------
{
  const page = await open(`${FORM_SITE}/contact.html`, { width: 390, height: 844 });
  const box = (id) => page.$eval(id, (el) => ({ hidden: el.hidden, text: el.textContent.trim() }));
  await page.click('#form-submit');
  await wait(100);
  const empties = await page.evaluate(() => ['name', 'email', 'message'].map((id) => {
    const el = document.getElementById(id);
    return [el.getAttribute('aria-invalid'), !document.getElementById(`${id}-error`).hidden, el.getAttribute('aria-describedby').includes(`${id}-error`)].join();
  }));
  check('Contact', 'empty submit marks each field with a linked error', empties.every((v) => v === 'true,true,true'), empties.join(' / '));
  check('Contact', 'focus moves to the first invalid field', (await page.evaluate(() => document.activeElement.id)) === 'name');
  check('Contact', 'no success shown on invalid input', (await box('#form-success')).hidden);

  await page.type('#name', 'Sam Tester');
  await page.type('#email', 'not-an-email');
  await page.type('#message', 'Hello, simulate-provider-failure please.');
  await page.click('#form-submit');
  await wait(100);
  check('Contact', 'invalid email is caught', /valid email/.test((await box('#email-error')).text));
  check('Contact', 'error clears once the name is valid', (await box('#name-error')).hidden);

  await page.$eval('#email', (el) => { el.value = ''; });
  await page.type('#email', 'sam@example.com');
  await page.click('#form-submit');
  await wait(400);
  const providerFail = await page.evaluate(() => ({ err: !document.getElementById('form-error').hidden, ok: document.getElementById('form-success').hidden, msg: document.getElementById('message').value, name: document.getElementById('name').value, focus: document.activeElement.id, role: document.getElementById('form-error').getAttribute('role') }));
  check('Contact', 'provider failure shows an error, not success', providerFail.err && providerFail.ok, JSON.stringify(providerFail));
  check('Contact', 'entered text is kept on failure', providerFail.msg.includes('simulate-provider-failure') && providerFail.name === 'Sam Tester');
  check('Contact', 'failure is announced and focused', providerFail.role === 'alert' && providerFail.focus === 'form-error');
  check('Contact', 'failure offers phone and email', await page.$eval('#form-error', (el) => !!el.querySelector('a[href^="tel:"]') && !!el.querySelector('a[href^="mailto:"]')));
  check('Contact', 'submit works again after failure', !(await page.$eval('#form-submit', (el) => el.disabled)));

  await page.$eval('#message', (el) => { el.value = ''; });
  await page.type('#message', 'Hello, simulate-endpoint-offline please.');
  await page.click('#form-submit');
  await wait(500);
  const offline = await page.evaluate(() => ({ err: !document.getElementById('form-error').hidden, ok: document.getElementById('form-success').hidden, msg: document.getElementById('message').value }));
  check('Contact', 'endpoint offline shows an error and keeps the text', offline.err && offline.ok && offline.msg.includes('simulate-endpoint-offline'), JSON.stringify(offline));

  await page.$eval('#company', (el) => { el.value = 'spam'; });
  await page.$eval('#message', (el) => { el.value = 'A normal message.'; });
  await page.click('#form-submit');
  await wait(400);
  const honeypot = await page.evaluate(() => ({ err: !document.getElementById('form-error').hidden, ok: document.getElementById('form-success').hidden }));
  check('Contact', 'honeypot is rejected, not faked as success', honeypot.err && honeypot.ok, JSON.stringify(honeypot));
  await page.$eval('#company', (el) => { el.value = ''; });

  await page.click('#form-submit');
  await wait(400);
  const sent = await page.evaluate(() => ({ ok: !document.getElementById('form-success').hidden, text: document.getElementById('form-success').textContent, msg: document.getElementById('message').value, err: document.getElementById('form-error').hidden, focus: document.activeElement.id }));
  check('Contact', 'success appears only after the endpoint confirms', sent.ok && sent.err && /has been sent/.test(sent.text), JSON.stringify(sent));
  check('Contact', 'form clears only after success', sent.msg === '');
  check('Contact', 'success message receives focus', sent.focus === 'form-success');
  await page.close();

  const noJs = await open(`${FORM_SITE}/contact.html`, { js: false });
  const noJsData = await noJs.evaluate(() => ({ form: getComputedStyle(document.getElementById('contact-form').parentElement).display, text: document.body.innerText.includes('needs JavaScript') }));
  check('Contact', 'without JS the form gives way to phone and email', noJsData.form === 'none' && noJsData.text, JSON.stringify(noJsData));
  await noJs.close();
}

// ---------- Worker, directly ----------
{
  const env = (overrides = {}) => ({ ALLOWED_ORIGIN: 'https://olympiccafe.co.uk', RESEND_API_KEY: 'key', MAIL_TO: 'a@b.c', MAIL_FROM: 'x@y.z', fetchImpl: async () => new Response('{}', { status: 200 }), ...overrides });
  const post = (fields, headers = { Origin: 'https://olympiccafe.co.uk' }) => {
    const body = new FormData();
    Object.entries(fields).forEach(([k, v]) => body.set(k, v));
    return new Request('https://worker.test/', { method: 'POST', headers, body });
  };
  const good = { name: 'Sam', email: 'sam@example.com', message: 'Hi' };
  const status = async (req, e = env()) => (await worker.fetch(req, e)).status;
  check('Worker', 'valid message returns 200', (await status(post(good))) === 200);
  check('Worker', 'other sites are refused', (await status(post(good, { Origin: 'https://evil.test' }))) === 403);
  check('Worker', 'missing fields return 400 with field errors', (await status(post({ name: '', email: '', message: '' }))) === 400);
  check('Worker', 'header injection in the name is refused', (await status(post({ ...good, name: 'a\r\nBcc: x@y.z' }))) === 400);
  check('Worker', 'oversized message is refused', (await status(post({ ...good, message: 'x'.repeat(5001) }))) === 400);
  check('Worker', 'honeypot is refused', (await status(post({ ...good, company: 'x' }))) === 422);
  check('Worker', 'GET is refused', (await status(new Request('https://worker.test/'))) === 405);
  check('Worker', 'provider error is not reported as success', (await status(post(good), env({ fetchImpl: async () => new Response('{}', { status: 500 }) }))) === 502);
  check('Worker', 'provider outage is not reported as success', (await status(post(good), env({ fetchImpl: async () => { throw new Error('down'); } }))) === 502);
  check('Worker', 'Turnstile token is required when configured', (await status(post(good), env({ TURNSTILE_SECRET: 's' }))) === 422);
  check('Worker', 'failed Turnstile check is refused', (await status(post({ ...good, 'cf-turnstile-response': 't' }), env({ TURNSTILE_SECRET: 's', fetchImpl: async () => new Response('{"success":false}') }))) === 422);
  check('Worker', 'no credentials in the site files', !/RESEND_API_KEY|re_[A-Za-z0-9]{10}/.test(read('contact.html')));
}

// ---------- Reduced motion ----------
for (const [key, urlPath] of Object.entries(PAGES)) {
  const page = await open(SITE + urlPath, { reduced: true });
  const data = await page.evaluate(() => ({ scroll: getComputedStyle(document.documentElement).scrollBehavior, pending: document.querySelectorAll('.reveal-pending').length }));
  check('Motion', `${key}: reduced motion disables smooth scroll and reveals`, data.scroll === 'auto' && data.pending === 0, JSON.stringify(data));
  await page.close();
}
{
  const page = await open(`${SITE}/menu.html`, { reduced: true, width: 390, height: 844 });
  await page.select('#menu-category', 'lunch');
  await wait(30);
  const top = await page.evaluate(() => document.getElementById('lunch-heading').getBoundingClientRect().top - document.getElementById('menu-controls').getBoundingClientRect().bottom);
  check('Motion', 'menu jumps instantly with reduced motion', top >= 0 && top < 120, String(top));
  await page.close();
}
{
  // Decorative motion: reveals must finish, and leave nothing hidden, once scrolled past.
  const page = await open(`${SITE}/`);
  const before = await page.evaluate(() => document.querySelectorAll('.reveal-pending').length);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await wait(40);
  }
  const after = await page.evaluate(() => document.querySelectorAll('.reveal-pending').length);
  check('Motion', 'scroll reveals all complete', before > 0 && after === 0, `${before} -> ${after}`);
  await page.close();
}

// ---------- Images and layout stability ----------
for (const [key, urlPath] of Object.entries(PAGES)) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  const failed = [];
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(SITE)) failed.push(r.url()); });
  await page.goto(SITE + urlPath, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  });
  await wait(500);
  const data = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('main img, footer img, header img')].filter((i) => i.id !== 'lightbox-img');
    return {
      total: imgs.length,
      broken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      noDims: imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length,
      // The torch divider is decorative: empty alt inside aria-hidden.
      noAlt: imgs.filter((i) => !i.getAttribute('alt') && !i.closest('[aria-hidden=true]')).length,
      cls: window.__cls,
    };
  });
  check('Images', `${key}: no missing images (${data.total})`, data.broken.length === 0 && failed.length === 0, [...data.broken, ...failed].join(' '));
  check('Images', `${key}: all have dimensions and alt text`, data.noDims === 0 && data.noAlt === 0, JSON.stringify(data));
  check('Images', `${key}: layout shift under 0.1`, data.cls < 0.1, data.cls.toFixed(4));
  await page.close();
}
{
  const html = read('index.html');
  check('Images', 'hero image is prioritised and not lazy', /fetchpriority="high"/.test(html) && !/table-spread-overhead-1-800\.webp"[^>]*loading="lazy"/.test(html) && html.includes('rel="preload" as="image"'));
  check('Images', 'below-the-fold images are lazy', /titan-breakfast-800\.webp"[^>]*loading="lazy"/.test(html));
}

// ---------- Accessibility scan (axe, WCAG 2.2 AA tags) ----------
async function axe(page, label) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'], rules: { 'color-contrast': { enabled: true } } }));
  const violations = result.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0].target} ${v.nodes[0].failureSummary?.split('\n')[1] || ''}`);
  check('Axe', label, violations.length === 0, violations.join(' || '));
}
for (const [key, urlPath] of Object.entries(PAGES)) {
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const page = await open(SITE + urlPath, { width, height, reduced: true });
    await axe(page, `${key} at ${width}px`);
    await page.close();
  }
}
{
  const form = await open(`${FORM_SITE}/contact.html`, { width: 390, height: 844, reduced: true });
  await form.click('#form-submit');
  await wait(100);
  await axe(form, 'contact form showing errors');
  await form.close();
  const dialog = await open(`${SITE}/gallery.html`, { reduced: true });
  await dialog.click('.gallery-link');
  await wait(200);
  await axe(dialog, 'gallery dialog open');
  await dialog.close();
  const empty = await open(`${SITE}/menu.html`, { width: 390, height: 844, reduced: true });
  await empty.type('#menu-search', 'zzzz');
  await wait(50);
  await axe(empty, 'menu empty state');
  await empty.close();
  const nav = await open(`${SITE}/`, { width: 390, height: 844, reduced: true });
  await nav.click('#menu-toggle');
  await axe(nav, 'mobile nav open');
  await nav.close();
}

// ---------- Preview screenshots ----------
fs.mkdirSync(SHOTS, { recursive: true });
for (const [key, urlPath] of Object.entries(PAGES)) {
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 768, 1024], ['mobile', 390, 844]]) {
    const page = await open(SITE + urlPath, { width, height, reduced: true });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
      window.scrollTo(0, 0);
    });
    await wait(300);
    await page.screenshot({ path: path.join(SHOTS, `${key}-${name}-top.png`) });
    if (name !== 'tablet') await page.screenshot({ path: path.join(SHOTS, `${key}-${name}-full.png`), fullPage: true });
    await page.close();
  }
}
{
  const form = await open(`${FORM_SITE}/contact.html`, { width: 390, height: 844, reduced: true });
  await form.type('#name', 'Sam Tester');
  await form.type('#email', 'sam@example.com');
  await form.type('#message', 'Hello, simulate-provider-failure please.');
  await form.click('#form-submit');
  await wait(400);
  await form.screenshot({ path: path.join(SHOTS, 'contact-form-failure-mobile.png') });
  await form.close();
  const menu = await open(`${SITE}/menu.html#brunch`, { width: 390, height: 844, reduced: true });
  await wait(200);
  await menu.screenshot({ path: path.join(SHOTS, 'menu-category-mobile.png') });
  await menu.close();
  const lightbox = await open(`${SITE}/gallery.html`, { width: 390, height: 844, reduced: true });
  await lightbox.click('.gallery-link');
  await wait(300);
  await lightbox.screenshot({ path: path.join(SHOTS, 'gallery-dialog-mobile.png') });
  await lightbox.close();
  const landscape = await open(`${SITE}/`, { width: 844, height: 390, reduced: true });
  await landscape.screenshot({ path: path.join(SHOTS, 'home-landscape.png') });
  await landscape.close();
}

await browser.close();
servers.forEach((s) => s.kill());

const groups = {};
for (const r of results) {
  groups[r.group] ||= { pass: 0, fail: 0 };
  groups[r.group][r.pass ? 'pass' : 'fail'] += 1;
}
const failed = results.filter((r) => !r.pass);
console.log('\nGroup results:');
for (const [group, g] of Object.entries(groups)) console.log(`  ${group}: ${g.pass} passed${g.fail ? `, ${g.fail} FAILED` : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
fs.writeFileSync(path.join(ROOT, 'docs/test-results.json'), JSON.stringify({ date: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
process.exit(failed.length ? 1 : 0);
