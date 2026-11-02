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

  // 1. Inspect the Collection Promo Slider tags
  const sliderData = await page.evaluate(() => {
    const sliderSec = document.querySelector('section[aria-label="Promotional Collection Slider"]');
    if (!sliderSec) return { found: false };

    // Find all tags in the slider
    const tags = Array.from(sliderSec.querySelectorAll('.promo-tag-word')).map(el => el.innerText);
    const headings = Array.from(sliderSec.querySelectorAll('h3')).map(el => el.innerText);
    const pills = Array.from(sliderSec.querySelectorAll('.rounded-full.bg-white\\/5'));

    // Check if any numbered labels or bullets exist in the text of the entire right column
    const rightCols = Array.from(sliderSec.querySelectorAll('.lg\\:col-span-7')).map(el => el.innerText);

    return {
      found: true,
      tagWords: tags,
      headings,
      pillCount: pills.length,
      hasNumberedLabels: rightCols.some(t => /•\s*0[1-5]/.test(t) || /\b0[1-5]\b/.test(t)),
    };
  });

  console.log('Collection Slider Data:', sliderData);

  // Scroll to Collection Promo Slider
  await page.evaluate(() => {
    const sliderSec = document.querySelector('section[aria-label="Promotional Collection Slider"]');
    if (sliderSec) sliderSec.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(600);

  // Screenshot Slide 1 (Torches - FEATURED COLLECTION)
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_slider_slide1_new_heading.png') });

  // Click Next Slide to verify Slide 2 (Zatka Machines - FARM PERIMETER DEFENSE)
  await page.click('button[aria-label="Next Slide"]');
  await sleep(900); // Allow slide transition and text animation to run
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_slider_slide2_new_heading.png') });

  // Click Next Slide to verify Slide 3 (Solar Street Lights - AUTONOMOUS OUTDOOR LIGHTING)
  await page.click('button[aria-label="Next Slide"]');
  await sleep(900);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_slider_slide3_new_heading.png') });

  // 2. Check mobile view (375x667)
  await page.setViewport({ width: 375, height: 667 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await sleep(1000);

  await page.evaluate(() => {
    const sliderSec = document.querySelector('section[aria-label="Promotional Collection Slider"]');
    if (sliderSec) sliderSec.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(600);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'promo_slider_mobile_new_heading.png') });

  await browser.close();
  console.log('Verification completed successfully!');
}

verify().catch(console.error);
