const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Dashboard
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000); // Wait for API calls
  await page.screenshot({ path: '../docs/screenshot-dashboard.png' });

  // Products
  await page.goto('http://localhost:5173/products');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshot-products.png' });

  // Sales
  await page.goto('http://localhost:5173/sales');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshot-sales.png' });

  // Reports
  await page.goto('http://localhost:5173/reports');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../docs/screenshot-reports.png' });

  // Dark Mode
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  // Click theme toggle
  await page.click('.theme-toggle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '../docs/screenshot-dark.png' });

  await browser.close();
})();
