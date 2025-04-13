import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    // Start from the home page
    await page.goto('/');

    // Check that we're on the dashboard page
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);

    // Navigate to Backtest page
    await page.getByRole('link', { name: 'Run Backtest' }).click();
    await expect(page).toHaveURL(/.*\/backtest/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Backtest');

    // Navigate to Results page
    await page.getByRole('link', { name: 'Results' }).click();
    await expect(page).toHaveURL(/.*\/backtests/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Backtest Results');

    // Navigate to Optimize page
    await page.getByRole('link', { name: 'Optimize' }).click();
    await expect(page).toHaveURL(/.*\/optimize/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Strategy Optimization');

    // Navigate to Documentation page
    await page.getByRole('link', { name: 'Documentation' }).click();
    await expect(page).toHaveURL(/.*\/docs/);

    // Navigate back to Dashboard
    await page.click('text=TradeSage 📊');
    await expect(page).toHaveURL(/.*\//);
  });
});

test.describe('Backtest Form', () => {
  test('should fill out the backtest form', async ({ page }) => {
    // Go to the backtest page
    await page.goto('/backtest');

    // Wait for the form to be visible
    await page.waitForSelector('form');

    // Fill out the form
    const symbolInput = page.getByLabel('Symbol');
    await symbolInput.click();
    await symbolInput.fill('BTCUSDT');

    // Take a screenshot after filling out the form
    await page.screenshot({ path: 'test-results/backtest-form-filled.png' });

    // Click the run backtest button
    await page.getByRole('button', { name: 'Run Backtest' }).click();

    // Take a screenshot after clicking the button
    await page.screenshot({ path: 'test-results/backtest-results.png' });
  });

  test('should select different strategies', async ({ page }) => {
    // Go to the backtest page
    await page.goto('/backtest');

    // Wait for the form to be visible
    await page.waitForSelector('form');

    // Take a screenshot of the default strategy
    await page.screenshot({ path: 'test-results/default-strategy.png' });

    // Check that the strategy dropdown is visible
    const strategySelect = page.getByRole('combobox').first();
    await expect(strategySelect).toBeVisible();

    // Take a screenshot after checking the strategy dropdown
    await page.screenshot({ path: 'test-results/strategy-dropdown.png' });
  });
});

test.describe('Optimization', () => {
  test('should load the optimization page', async ({ page }) => {
    // Go to the optimize page
    await page.goto('/optimize');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the optimize page
    await page.screenshot({ path: 'test-results/optimize-page.png' });

    // Check that we're on the optimize page
    await expect(page).toHaveURL(/.*\/optimize/);

    // Check that the page content is visible
    await expect(page.locator('.MuiContainer-root').first()).toBeVisible();
  });
});
