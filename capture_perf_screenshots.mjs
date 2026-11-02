import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('./client/node_modules/puppeteer-core');
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/c092ace3-37df-4ddc-bf6b-af61091562b2';
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const TARGET_URL = 'https://mahadev-electro-hub.vercel.app';

async function capture() {
  console.log('Capturing visual verification screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Desktop Homepage
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'perf_live_homepage_desktop.png'), fullPage: false });
  console.log('Captured perf_live_homepage_desktop.png');

  // 2. Scroll to Reels & Categories
  await page.evaluate(() => {
    const el = document.getElementById('reels-showcase');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'perf_live_reels_section.png'), fullPage: false });
  console.log('Captured perf_live_reels_section.png');

  // 3. Mobile Viewport (iPhone 14 / Pixel: 390x844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'perf_live_mobile.png'), fullPage: false });
  console.log('Captured perf_live_mobile.png');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
