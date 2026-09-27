import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), '../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PAGES = [
  { name: '01_dashboard.png', url: 'http://localhost:5173/' },
  { name: '02_transform_new.png', url: 'http://localhost:5173/transform/new' },
  { name: '03_projects.png', url: 'http://localhost:5173/projects' },
  { name: '04_project_detail.png', url: 'http://localhost:5173/projects/proj_default' },
  { name: '05_knowledge_base.png', url: 'http://localhost:5173/knowledge-base' },
  { name: '06_templates.png', url: 'http://localhost:5173/templates' },
  { name: '07_artifacts.png', url: 'http://localhost:5173/artifacts' },
  { name: '08_activity.png', url: 'http://localhost:5173/activity' },
  { name: '09_settings.png', url: 'http://localhost:5173/settings' }
];

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  for (const item of PAGES) {
    try {
      console.log(`Navigating to ${item.url}...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const filePath = path.join(SCREENSHOT_DIR, item.name);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${item.name}`);
    } catch (err) {
      console.error(`Error on ${item.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Finished capturing all screenshots.');
}

run();
