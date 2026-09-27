import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1200);

  // 1. Initial screen: hero text shifted 15px higher
  await page.screenshot({ path: '../screenshots/12_hero_text_15px_higher.png' });
  console.log('Saved 12_hero_text_15px_higher.png');

  // 2. Scroll through page to verify audience section is removed and page flows cleanly
  const scrollSteps = [600, 1200, 1800, 2400];
  for (const step of scrollSteps) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), step);
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '../screenshots/13_scrolled_without_audience_section.png', fullPage: true });
  console.log('Saved 13_scrolled_without_audience_section.png');

  await browser.close();
}

main().catch(console.error);
