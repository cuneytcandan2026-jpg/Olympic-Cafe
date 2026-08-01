import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(dir, label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`))) n++;
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outputPath = path.join(dir, filename);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
const mobile = process.argv[4] === 'mobile';
const viewportWidth = mobile ? 390 : 1440;
const viewportHeight = mobile ? 844 : 900;
await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Chrome's screenshot compositor wraps/duplicates content past a texture height limit
// (~16384px). Cap deviceScaleFactor so tall, content-heavy pages capture in one clean pass.
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
const MAX_TEXTURE_HEIGHT = 16000;
if (pageHeight * 2 > MAX_TEXTURE_HEIGHT) {
  const safeScaleFactor = Math.max(1, Math.floor((MAX_TEXTURE_HEIGHT / pageHeight) * 10) / 10);
  await page.setViewport({ width: viewportWidth, height: viewportHeight, deviceScaleFactor: safeScaleFactor });
}

// Scroll through the page to trigger IntersectionObserver reveals, then return to top
await page.evaluate(async () => {
  await new Promise(resolve => {
    const distance = 500;
    const delay = 80;
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
        clearInterval(timer);
        window.scrollTo(0, 0);
        resolve();
      }
    }, delay);
  });
});
await new Promise(r => setTimeout(r, 600));

await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
