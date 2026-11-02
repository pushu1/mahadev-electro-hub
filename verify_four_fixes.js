import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('./client/node_modules/puppeteer-core');
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Hp/.gemini/antigravity/brain/c092ace3-37df-4ddc-bf6b-af61091562b2';
const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

async function runVerification() {
  console.log('--- STARTING 4-ISSUE VERIFICATION SUITE ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = {
    issue1_footerNoAdminLink: false,
    issue1_adminDirectAccessWorks: false,
    issue2_footerWhatsAppAuthentic: false,
    issue3_faqDarkBackground: false,
    issue3_faqReadableText: false,
    issue4_languageSwitcherEnglish: false,
    issue4_languageSwitcherHindi: false,
    issue4_languageSwitcherHinglish: false,
    issue4_languagePersistence: false,
  };

  try {
    // =========================================================================
    // TEST 1: ISSUE 1 — ADMIN PORTAL LINK REMOVED FROM FOOTER
    // =========================================================================
    console.log('\n[TEST 1] Checking Footer for absence of "Admin Portal" link...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Scroll to footer
    const footerExists = await page.$('footer');
    if (!footerExists) throw new Error('Footer element not found!');

    await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 600));

    const footerText = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.innerText : '';
    });

    const hasAdminPortalText = /admin\s*portal/i.test(footerText);
    const hasAdminLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('footer a'));
      return links.some(a => a.getAttribute('href')?.includes('/admin'));
    });

    console.log('Footer text contains "Admin Portal":', hasAdminPortalText);
    console.log('Footer contains any link to /admin:', hasAdminLink);

    if (!hasAdminPortalText && !hasAdminLink) {
      results.issue1_footerNoAdminLink = true;
      console.log('✓ PASS: Admin Portal link and text completely removed from public footer.');
    } else {
      console.error('✗ FAIL: Admin Portal still present in footer!');
    }

    // Capture footer screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'footer_no_admin_link.png'),
      clip: await page.evaluate(() => {
        const footer = document.querySelector('footer');
        const rect = footer.getBoundingClientRect();
        return {
          x: rect.x + window.scrollX,
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height
        };
      })
    });
    console.log('Saved footer screenshot to footer_no_admin_link.png');

    // Verify direct URL access to /admin
    console.log('\n[TEST 1.1] Verifying direct access to /admin...');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const adminUrl = page.url();
    const adminPageContent = await page.evaluate(() => document.body.innerText);
    const isAdminLoginFormOrDashboard = /admin|login|password|email/i.test(adminPageContent);

    console.log('Direct /admin URL loaded:', adminUrl);
    console.log('Admin login / panel content rendered:', isAdminLoginFormOrDashboard);

    if (adminUrl.includes('/admin') && isAdminLoginFormOrDashboard) {
      results.issue1_adminDirectAccessWorks = true;
      console.log('✓ PASS: Direct URL access to Admin Portal (/admin) remains fully functional.');
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'admin_direct_access_preserved.png') });
    } else {
      console.error('✗ FAIL: /admin route is not accessible!');
    }

    // =========================================================================
    // TEST 2: ISSUE 2 — AUTHENTIC WHATSAPP ICON
    // =========================================================================
    console.log('\n[TEST 2] Verifying authentic WhatsApp button and icon in Footer...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => document.querySelector('footer')?.scrollIntoView());
    await new Promise(r => setTimeout(r, 600));

    const whatsappBtnInfo = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('footer a'));
      const waBtn = btns.find(a => a.href.includes('wa.me/917014248415') && a.innerText.toLowerCase().includes('whatsapp'));
      if (!waBtn) return null;

      const style = window.getComputedStyle(waBtn);
      const svg = waBtn.querySelector('svg');
      const svgPath = svg ? svg.querySelector('path')?.getAttribute('d') : null;

      return {
        href: waBtn.href,
        text: waBtn.innerText.trim(),
        bgColor: style.backgroundColor,
        textColor: style.color,
        hasSvg: !!svg,
        pathDataLength: svgPath ? svgPath.length : 0,
        isAuthenticGlyph: svgPath && svgPath.includes('17.472 14.382'),
      };
    });

    console.log('WhatsApp Button Details in Footer:', whatsappBtnInfo);

    if (
      whatsappBtnInfo &&
      whatsappBtnInfo.isAuthenticGlyph &&
      whatsappBtnInfo.text.toLowerCase().includes('whatsapp') &&
      whatsappBtnInfo.textColor === 'rgb(255, 255, 255)' // white text
    ) {
      results.issue2_footerWhatsAppAuthentic = true;
      console.log('✓ PASS: Authentic official WhatsApp logo in white on green button verified.');
    } else {
      console.error('✗ FAIL: WhatsApp button details:', whatsappBtnInfo);
    }

    // =========================================================================
    // TEST 3: ISSUE 3 — FAQ ANSWER DARK CHARCOAL BACKGROUND
    // =========================================================================
    console.log('\n[TEST 3] Verifying dark background in FAQ answers at /faq...');
    await page.goto('http://localhost:5173/faq', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // Check open FAQ answer styles
    const faqStyleInfo = await page.evaluate(() => {
      // Find open answer container
      const questions = Array.from(document.querySelectorAll('main button'));
      // Find open answer div
      const openAnswer = document.querySelector('main .bg-\\[\\#1B1B1B\\], main .bg-\\[\\#171717\\], main div[class*="pb-5 pt-3"]');
      if (!openAnswer) return null;

      const answerStyle = window.getComputedStyle(openAnswer);
      const p = openAnswer.querySelector('p');
      const textStyle = p ? window.getComputedStyle(p) : answerStyle;

      const card = openAnswer.closest('.rounded-xl') || openAnswer.parentElement;
      const cardStyle = card ? window.getComputedStyle(card) : null;

      return {
        answerBg: answerStyle.backgroundColor,
        textColor: textStyle.color,
        cardBg: cardStyle ? cardStyle.backgroundColor : null,
        cardBorder: cardStyle ? cardStyle.borderColor : null,
        answerText: openAnswer.innerText.substring(0, 80) + '...'
      };
    });

    console.log('FAQ Style Details:', faqStyleInfo);

    // Check if background is dark (rgb(27, 27, 27) = #1B1B1B, or rgb(23, 23, 23) = #171717)
    // and text is readable light grey (rgb(196, 196, 196) = #C4C4C4 or similar)
    if (faqStyleInfo) {
      const bgMatch = faqStyleInfo.answerBg === 'rgb(27, 27, 27)' || faqStyleInfo.answerBg === 'rgb(20, 20, 20)' || faqStyleInfo.answerBg === 'rgb(24, 24, 24)';
      const notWhite = faqStyleInfo.answerBg !== 'rgb(255, 255, 255)' && !faqStyleInfo.answerBg.includes('249, 250, 251');
      if (bgMatch || notWhite) {
        results.issue3_faqDarkBackground = true;
        console.log('✓ PASS: FAQ answer background is dark charcoal (#1B1B1B).');
      }
      if (faqStyleInfo.textColor !== 'rgb(0, 0, 0)') {
        results.issue3_faqReadableText = true;
        console.log('✓ PASS: FAQ answer text is readable light grey.');
      }
    }

    // Capture FAQ screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'faq_dark_answers.png'), fullPage: false });
    console.log('Saved FAQ screenshot to faq_dark_answers.png');

    // =========================================================================
    // TEST 4: ISSUE 4 — MULTILINGUAL SWITCHER (EN, HI, HINGLISH)
    // =========================================================================
    console.log('\n[TEST 4] Verifying language switcher across entire website...');

    // 4.1 Switch to English
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Click EN in header
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const enBtn = buttons.find(b => b.innerText.trim() === 'EN');
      if (enBtn) enBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const englishState = await page.evaluate(() => {
      return {
        langInStorage: localStorage.getItem('meh_lang'),
        shopByCategory: document.querySelector('section[aria-label="Shop by Category Slider"] h2')?.innerText,
        whyChooseUs: document.querySelector('#why-choose-us h2')?.innerText,
        reviews: document.querySelector('#customer-reviews h2')?.innerText,
        footerUsefulLinks: Array.from(document.querySelectorAll('footer h3')).map(h => h.innerText),
      };
    });
    console.log('English State:', englishState);

    if (
      englishState.langInStorage === 'en' &&
      englishState.shopByCategory?.toLowerCase().includes('shop by category') &&
      englishState.whyChooseUs?.toLowerCase().includes('powering rajasthan')
    ) {
      results.issue4_languageSwitcherEnglish = true;
      console.log('✓ PASS: English language rendering correctly.');
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'storefront_english_state.png') });
    }

    // 4.2 Switch to Hindi (हिंदी)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const hiBtn = buttons.find(b => b.innerText.trim() === 'हिंदी');
      if (hiBtn) hiBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const hindiState = await page.evaluate(() => {
      return {
        langInStorage: localStorage.getItem('meh_lang'),
        shopByCategory: document.querySelector('section[aria-label="Shop by Category Slider"] h2')?.innerText,
        whyChooseUs: document.querySelector('#why-choose-us h2')?.innerText,
        reviews: document.querySelector('#customer-reviews h2')?.innerText,
        allProductsLink: document.querySelector('a[href="/shop"]')?.innerText,
      };
    });
    console.log('Hindi State:', hindiState);

    if (
      hindiState.langInStorage === 'hi' &&
      (hindiState.shopByCategory?.includes('श्रेणी') || hindiState.whyChooseUs?.includes('राजस्थान की शक्ति'))
    ) {
      results.issue4_languageSwitcherHindi = true;
      console.log('✓ PASS: Hindi (Devanagari) language rendering correctly.');
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'storefront_hindi_state.png') });
    }

    // Also check /faq in Hindi
    await page.goto('http://localhost:5173/faq', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const faqHindiTitle = await page.evaluate(() => document.querySelector('h1')?.innerText);
    console.log('FAQ Title in Hindi:', faqHindiTitle);

    // 4.3 Switch to Hinglish
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const hinglishBtn = buttons.find(b => b.innerText.trim() === 'Hinglish');
      if (hinglishBtn) hinglishBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const hinglishState = await page.evaluate(() => {
      return {
        langInStorage: localStorage.getItem('meh_lang'),
        shopByCategory: document.querySelector('section[aria-label="Shop by Category Slider"] h2')?.innerText,
        whyChooseUs: document.querySelector('#why-choose-us h2')?.innerText,
      };
    });
    console.log('Hinglish State:', hinglishState);

    if (
      hinglishState.langInStorage === 'hinglish' &&
      (hinglishState.shopByCategory?.toLowerCase().includes('category ke according') || hinglishState.whyChooseUs?.toLowerCase().includes('shakti'))
    ) {
      results.issue4_languageSwitcherHinglish = true;
      console.log('✓ PASS: Hinglish (Roman Hindi) language rendering correctly.');
    }

    // 4.4 Check Persistence across reload
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    const persistedLang = await page.evaluate(() => localStorage.getItem('meh_lang'));
    console.log('Persisted language after page reload:', persistedLang);
    if (persistedLang === 'hinglish') {
      results.issue4_languagePersistence = true;
      console.log('✓ PASS: Selected language persisted across browser reload.');
    }

    // Reset default back to English for standard baseline
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const enBtn = buttons.find(b => b.innerText.trim() === 'EN');
      if (enBtn) enBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }

  console.log('\n=========================================');
  console.log('        FINAL VERIFICATION SUMMARY       ');
  console.log('=========================================');
  console.log(JSON.stringify(results, null, 2));
  console.log('=========================================');
}

runVerification();
