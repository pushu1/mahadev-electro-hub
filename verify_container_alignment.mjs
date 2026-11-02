import { createRequire } from 'module';
import path from 'path';

const clientRequire = createRequire('C:/Users/Hp/.gemini/antigravity/scratch/mahadev-electro-hub/client/package.json');
const puppeteer = clientRequire('puppeteer-core');
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const ARTIFACTS_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/c092ace3-37df-4ddc-bf6b-af61091562b2';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  // 1. Measure and compare containers of all 3 sections
  const alignmentComparison = await page.evaluate(() => {
    const getSectionMetrics = (selector) => {
      const sec = document.querySelector(selector);
      if (!sec) return null;
      const container = sec.querySelector('.max-w-7xl');
      const header = sec.querySelector('.border-b');
      const viewport = sec.querySelector('.overflow-hidden:not([aria-hidden])');
      
      const cRect = container ? container.getBoundingClientRect() : null;
      const hRect = header ? header.getBoundingClientRect() : null;
      const vRect = viewport ? viewport.getBoundingClientRect() : null;

      return {
        sectionTag: sec.getAttribute('aria-label'),
        container: cRect ? {
          left: Math.round(cRect.left),
          right: Math.round(cRect.right),
          width: Math.round(cRect.width),
        } : null,
        header: hRect ? {
          left: Math.round(hRect.left),
          right: Math.round(hRect.right),
          width: Math.round(hRect.width),
        } : null,
        viewport: vRect ? {
          left: Math.round(vRect.left),
          right: Math.round(vRect.right),
          width: Math.round(vRect.width),
        } : null,
      };
    };

    const shopByCategory = getSectionMetrics('section[aria-label="Shop by Category Slider"]');
    const featuredProducts = getSectionMetrics('section[aria-label="Featured Products"]');
    const newArrivals = getSectionMetrics('section[aria-label="New Arrivals"]');

    const pageWidth = document.documentElement.clientWidth;
    const documentScrollWidth = document.documentElement.scrollWidth;

    return {
      shopByCategory,
      featuredProducts,
      newArrivals,
      pageWidth,
      documentScrollWidth,
      hasHorizontalOverflow: documentScrollWidth > pageWidth,
      containersMatch: (
        featuredProducts.container.left === shopByCategory.container.left &&
        featuredProducts.container.right === shopByCategory.container.right &&
        featuredProducts.container.width === shopByCategory.container.width &&
        newArrivals.container.left === shopByCategory.container.left &&
        newArrivals.container.right === shopByCategory.container.right &&
        newArrivals.container.width === shopByCategory.container.width
      )
    };
  });

  console.log('Alignment Comparison:', JSON.stringify(alignmentComparison, null, 2));

  // 2. Verify sliders are actively moving
  const motionCheck = await page.evaluate(async () => {
    const featTrack = document.querySelector('section[aria-label="Featured Products"] .continuous-marquee-track');
    const naTrack = document.querySelector('section[aria-label="New Arrivals"] .continuous-marquee-track');

    const f0 = window.getComputedStyle(featTrack).transform;
    const n0 = window.getComputedStyle(naTrack).transform;

    await new Promise(r => setTimeout(r, 1000));

    const f1 = window.getComputedStyle(featTrack).transform;
    const n1 = window.getComputedStyle(naTrack).transform;

    return {
      featuredMoving: f0 !== f1,
      newArrivalsMoving: n0 !== n1,
    };
  });
  console.log('Motion Check:', motionCheck);

  // 3. Screenshots showing alignment
  // Category Grid
  await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="Shop by Category Slider"]');
    if (s) s.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'aligned_shop_by_category.png') });

  // Featured Products
  await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="Featured Products"]');
    if (s) s.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'aligned_featured_products.png') });

  // New Arrivals
  await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="New Arrivals"]');
    if (s) s.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'aligned_new_arrivals.png') });

  // Tablet Viewport (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="Featured Products"]');
    if (s) s.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'aligned_featured_tablet.png') });

  // Mobile Viewport (375px)
  await page.setViewport({ width: 375, height: 667 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.evaluate(() => {
    const s = document.querySelector('section[aria-label="New Arrivals"]');
    if (s) s.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'aligned_new_arrivals_mobile.png') });

  await browser.close();
  console.log('Alignment test completed successfully!');
}

verify().catch(console.error);
