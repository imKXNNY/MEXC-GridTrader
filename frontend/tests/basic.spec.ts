import { test, expect } from '@playwright/test';

test('basic application loading', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);

  // Take a screenshot of the home page
  await page.screenshot({ path: 'test-results/home-page.png' });

  // Check that we can navigate to the backtest page
  await page.goto('/backtest');
  await page.screenshot({ path: 'test-results/backtest-page.png' });

  // Check that we can navigate to the backtests page
  await page.goto('/backtests');
  await page.screenshot({ path: 'test-results/backtests-page.png' });

  // Check that we can navigate to the optimize page
  await page.goto('/optimize');
  await page.screenshot({ path: 'test-results/optimize-page.png' });
});
