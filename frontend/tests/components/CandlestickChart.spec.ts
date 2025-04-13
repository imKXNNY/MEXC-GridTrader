import { test, expect } from '@playwright/test';
import { mockCandleData, mockOrders } from '../mocks/chartData';

test.describe('CandlestickChart Component', () => {
  test.beforeEach(async ({ page }) => {
    // Create a simple test page that renders the CandlestickChart component
    await page.goto('/');

    // Mock the API response for chart data
    await page.route('**/api/backtests/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            candles: mockCandleData,
            orders: mockOrders,
            params: {
              symbol: 'BTCUSDT',
              interval: '1h',
              strategy_type: 'momentum'
            }
          }
        })
      });
    });
  });

  test('should navigate to results page', async ({ page }) => {
    // Navigate to a result page that would show the chart
    await page.goto('/results/123456789');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual comparison
    await page.screenshot({ path: 'test-results/results-page.png' });

    // Check that we're on the results page
    await expect(page).toHaveURL(/.*\/results\/123456789/);
  });

  test('should navigate between pages', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');

    // Navigate to the backtest page
    await page.getByRole('link', { name: 'Run Backtest' }).click();
    await expect(page).toHaveURL(/.*\/backtest/);

    // Navigate to the backtests page
    await page.getByRole('link', { name: 'Results' }).click();
    await expect(page).toHaveURL(/.*\/backtests/);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/backtests-page.png' });
  });
});
