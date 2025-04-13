import { test, expect } from '@playwright/test';

test.describe('Optimize Page', () => {
  test('should load the optimize form', async ({ page }) => {
    // Navigate to the optimize page
    await page.goto('/optimize');

    // Take a screenshot of the optimize page
    await page.screenshot({ path: 'test-results/optimize-form.png' });

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);

    // Check that the page content is visible
    await expect(page.locator('.MuiContainer-root').first()).toBeVisible();

    // Check that the symbol input is visible
    await expect(page.locator('input[type="text"]').first()).toBeVisible();

    // Check that the configure optimization button is visible
    await expect(page.getByRole('button').filter({ hasText: /Configure Optimization/i })).toBeVisible();
  });

  test('should fill out the optimize form', async ({ page }) => {
    // Navigate to the optimize page
    await page.goto('/optimize');

    // Fill out the form
    await page.locator('input[type="text"]').first().fill('BTCUSDT');

    // Take a screenshot after filling out the form
    await page.screenshot({ path: 'test-results/optimize-form-filled.png' });

    // Click the configure optimization button
    await page.getByRole('button').filter({ hasText: /Configure Optimization/i }).click();

    // Take a screenshot after clicking the button
    await page.screenshot({ path: 'test-results/optimize-configuration.png' });
  });
});
