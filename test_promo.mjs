import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot of CollectionPromoSlider
  const promoSlider = await page.$('section:has(.grid-cols-12)');
  if (promoSlider) {
    await promoSlider.screenshot({
      path: 'C:/Users/Hp/.gemini/antigravity/brain/c092ace3-37df-4ddc-bf6b-af61091562b2/promo_slider_live.png'
    });
    console.log('Saved promo_slider_live.png');
  } else {
    console.log('promoSlider element not found directly');
  }

  // Scroll to promo slider and screenshot viewport
  await page.evaluate(() => {
    window.scrollTo(0, 1800);
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: 'C:/Users/Hp/.gemini/antigravity/brain/c092ace3-37df-4ddc-bf6b-af61091562b2/homepage_promo_slider_viewport.png'
  });
  console.log('Saved homepage_promo_slider_viewport.png');

  await browser.close();
})();
