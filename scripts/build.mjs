// Static site build. Output goes to the repo root because GitHub Pages publishes master:/ as it stands.
// Set OUT_DIR to build somewhere else, such as the test build with the contact form enabled.
import { execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import esbuild from 'esbuild';
import sharp from 'sharp';
import { page } from '../src/templates/layout.mjs';
import { BUSINESS } from '../src/data/business.mjs';
import { CROPS } from '../src/data/crops.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.env.OUT_DIR || ROOT);
const IMG_SOURCE = path.join(ROOT, 'assets/img');
const IMG_OUT = path.join(OUT, 'assets/img');

const hash = (data) => crypto.createHash('sha256').update(data).digest('hex').slice(0, 10);

function writeHashed(dir, name, ext, data) {
  const folder = path.join(OUT, dir);
  fs.mkdirSync(folder, { recursive: true });
  for (const f of fs.readdirSync(folder)) {
    if (new RegExp(`^${name}\\.[0-9a-f]{10}\\.${ext}$`).test(f)) fs.unlinkSync(path.join(folder, f));
  }
  const filename = `${name}.${hash(data)}.${ext}`;
  fs.writeFileSync(path.join(folder, filename), data);
  return filename;
}

function buildCss() {
  const tmp = path.join(ROOT, 'node_modules/.cache-site.css');
  execFileSync(process.execPath, [
    path.join(ROOT, 'node_modules/tailwindcss/lib/cli.js'),
    '-c', path.join(ROOT, 'tailwind.config.cjs'),
    '-i', path.join(ROOT, 'src/css/site.css'),
    '-o', tmp,
    '--minify',
  ], { stdio: ['ignore', 'ignore', 'inherit'], cwd: ROOT });
  const css = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return writeHashed('assets/css', 'site', 'css', css);
}

async function buildJs() {
  const js = {};
  for (const name of ['site', 'menu', 'gallery', 'contact']) {
    const source = fs.readFileSync(path.join(ROOT, `src/js/${name}.js`), 'utf8');
    const { code } = await esbuild.transform(source, { minify: true, target: 'es2019' });
    js[name] = writeHashed('assets/js', name, 'js', code);
  }
  return js;
}

function copyFonts() {
  const dir = path.join(OUT, 'assets/fonts');
  fs.mkdirSync(dir, { recursive: true });
  const fonts = {
    'poppins-400.woff2': '@fontsource/poppins/files/poppins-latin-400-normal.woff2',
    'poppins-600.woff2': '@fontsource/poppins/files/poppins-latin-600-normal.woff2',
    'fredoka-600.woff2': '@fontsource/fredoka/files/fredoka-latin-600-normal.woff2',
    'special-elite-400.woff2': '@fontsource/special-elite/files/special-elite-latin-400-normal.woff2',
  };
  for (const [name, source] of Object.entries(fonts)) fs.copyFileSync(path.join(ROOT, 'node_modules', source), path.join(dir, name));
}

const isFresh = (output, input) => fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs;

async function buildImages() {
  const responsive = path.join(IMG_OUT, 'r');
  const og = path.join(IMG_OUT, 'og');
  fs.mkdirSync(responsive, { recursive: true });
  fs.mkdirSync(og, { recursive: true });

  const sources = fs.readdirSync(IMG_SOURCE).filter((f) => f.endsWith('.jpeg'));
  for (const file of sources) {
    const input = path.join(IMG_SOURCE, file);
    const base = file.replace('.jpeg', '');
    for (const width of [480, 800, 1200]) {
      const output = path.join(responsive, `${base}-${width}.webp`);
      if (isFresh(output, input)) continue;
      await sharp(input).resize({ width }).webp({ quality: width === 480 ? 68 : 72, effort: 6 }).toFile(output);
    }
  }

  // Art-directed crops. Rebuilt when the crop list changes, not only when a photo does.
  const crops = path.join(IMG_OUT, 'c');
  const cropList = path.join(ROOT, 'src/data/crops.mjs');
  fs.mkdirSync(crops, { recursive: true });
  for (const { name, src, left, top, width, height, widths } of CROPS) {
    const input = path.join(IMG_SOURCE, `${src}.jpeg`);
    for (const w of widths) {
      const output = path.join(crops, `${name}-${w}.webp`);
      if (isFresh(output, input) && isFresh(output, cropList)) continue;
      await sharp(input).extract({ left, top, width, height }).resize({ width: w }).webp({ quality: w <= 320 ? 70 : 74, effort: 6 }).toFile(output);
    }
  }

  // The visit section: the matcha photo with its own table extended to the right. The grain runs
  // horizontally, so stretching the last stretch of bare wood continues it with no visible join.
  const matcha = path.join(IMG_SOURCE, 'matcha-latte.jpeg');
  for (const w of [800, 1600]) {
    const output = path.join(crops, `table-visit-${w}.webp`);
    if (isFresh(output, matcha) && isFresh(output, cropList)) continue;
    const wood = await sharp(matcha).extract({ left: 1120, top: 0, width: 320, height: 810 }).resize(980, 810, { fit: 'fill' }).toBuffer();
    const base = await sharp(matcha).extract({ left: 0, top: 0, width: 1120, height: 810 }).toBuffer();
    const joined = await sharp({ create: { width: 2100, height: 810, channels: 3, background: '#000' } })
      .composite([{ input: base, left: 0, top: 0 }, { input: wood, left: 1120, top: 0 }])
      .png().toBuffer();
    await sharp(joined).resize({ width: w }).webp({ quality: 70, effort: 6 }).toFile(output);
  }

  const shares = { home: 'table-spread-overhead-1', menu: 'titan-breakfast', about: 'full-english-fries-2', gallery: 'full-english-hash-browns', contact: 'latte-art' };
  for (const [name, source] of Object.entries(shares)) {
    const input = path.join(IMG_SOURCE, `${source}.jpeg`);
    const output = path.join(og, `${name}.jpg`);
    if (isFresh(output, input)) continue;
    await sharp(input).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 78, mozjpeg: true }).toFile(output);
  }

  // The master artwork: the pack's "nav" versions crop the bottom of the tagline.
  const logo = path.join(ROOT, 'brand_assets/Photos/Logo Pack/olympic-cafe-logo-master-transparent.png');
  for (const width of [185, 370]) {
    await sharp(logo).resize({ width }).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(path.join(IMG_OUT, `logo-${width}.webp`));
  }
  // The approved torch icon, cut from the master logo for the small torch dividers.
  await sharp(logo).extract({ left: 622, top: 20, width: 124, height: 318 }).resize({ height: 96 }).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(path.join(IMG_OUT, 'torch.webp'));
  const favicon = path.join(ROOT, 'src/brand/favicon-256.png');
  await sharp(favicon).resize(64, 64).png({ compressionLevel: 9, palette: true }).toFile(path.join(IMG_OUT, 'favicon.png'));
  await sharp(favicon).resize(180, 180).flatten({ background: '#FBF4E7' }).png({ compressionLevel: 9, palette: true }).toFile(path.join(IMG_OUT, 'apple-touch-icon.png'));
}

function writeSeoFiles(pages) {
  const urls = pages.filter((p) => !p.noindex).map((p) => `  <url>\n    <loc>${BUSINESS.baseUrl}${p.path}</loc>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BUSINESS.baseUrl}/sitemap.xml\n`);
}

fs.mkdirSync(OUT, { recursive: true });
copyFonts();
await buildImages();
const assets = { css: buildCss(), js: await buildJs() };

const OUTPUT_NAMES = { home: 'index.html', about: 'about.html', menu: 'menu.html', gallery: 'gallery.html', contact: 'contact.html', notfound: '404.html' };
const pages = [];
for (const name of ['home', 'about', 'menu', 'gallery', 'contact', 'notfound']) {
  const { default: definition } = await import(pathToFileURL(path.join(ROOT, `src/pages/${name}.mjs`)).href);
  pages.push(definition);
  fs.writeFileSync(path.join(OUT, OUTPUT_NAMES[definition.key]), page(definition, assets));
}
writeSeoFiles(pages);
console.log(`Built ${pages.length} pages to ${OUT}. CSS ${assets.css}`);
