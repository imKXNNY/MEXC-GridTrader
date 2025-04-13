import { test, expect } from '@playwright/test';

test.describe('Backtest Page', () => {
  test('should load the backtest form', async ({ page }) => {
    // Navigate to the backtest page
    await page.goto('/backtest');

    // Take a screenshot of the backtest page
    await page.screenshot({ path: 'test-results/backtest-form.png' });

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);

    // Check that the form is visible
    await expect(page.locator('form')).toBeVisible();

    // Check that the symbol input is visible
    await expect(page.locator('input[type="text"]').first()).toBeVisible();

    // Check that the run backtest button is visible
    await expect(page.getByRole('button').filter({ hasText: /Run Backtest/i })).toBeVisible();
  });

  test('should fill out the backtest form', async ({ page }) => {
    // Navigate to the backtest page
    await page.goto('/backtest');

    // Fill out the form
    await page.locator('input[type="text"]').first().fill('BTCUSDT');
    
    // Take a screenshot after filling out the form
    await page.screenshot({ path: 'test-results/backtest-form-filled.png' });

    // Click the run backtest button
    await page.getByRole('button').filter({ hasText: /Run Backtest/i }).click();

    // Take a screenshot after clicking the button
    await page.screenshot({ path: 'test-results/backtest-results.png' });
  });
});
