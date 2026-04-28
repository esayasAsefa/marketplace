const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/handler/sign-in');
  await page.waitForLoadState('networkidle');
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    const html = await btn.innerHTML();
    if (text.includes('Sign in with Google')) {
      console.log('--- HTML for Google button ---');
      console.log(html);
    }
  }
  await browser.close();
})();
