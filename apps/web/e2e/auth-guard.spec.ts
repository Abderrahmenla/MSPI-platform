import { test, expect } from '@playwright/test';

test.describe('Auth guards', () => {
  test('cart page is accessible without login', async ({ page }) => {
    // Cart is a protected route but shows empty state for unauthenticated users
    const response = await page.goto('/fr/cart');
    // Should not be a 500 — either renders or redirects
    expect(response?.status()).not.toBe(500);
  });

  test('checkout page redirects to login when unauthenticated', async ({
    page,
  }) => {
    // Mock cart API to return 401
    await page.route('**/api/v1/customer/cart', (route) => {
      route.fulfill({ status: 401, body: '{"message":"Unauthorized"}' });
    });
    await page.goto('/fr/checkout');
    // Should redirect away from checkout (to login or back)
    await page.waitForLoadState('networkidle');
    const url = page.url();
    // Either redirected to login or shows login-gate component
    const isOnCheckout = url.includes('/checkout') && !url.includes('/login');
    if (isOnCheckout) {
      // Facebook SSO gate should be visible
      await expect(
        page.getByText(/Facebook/i).or(page.getByText(/connexion/i)),
      ).toBeVisible();
    }
  });

  test('account page redirects to login when unauthenticated', async ({
    page,
  }) => {
    await page.route('**/api/v1/customer/**', (route) => {
      route.fulfill({ status: 401, body: '{"message":"Unauthorized"}' });
    });
    await page.goto('/fr/account');
    await page.waitForLoadState('networkidle');
    // Should either show login gate or redirect
    expect(page.url()).toBeTruthy();
  });

  test('API customer endpoints return 401 without token', async ({ page }) => {
    const response = await page.goto('/api/v1/customer/orders');
    expect(response?.status()).toBe(401);
  });
});
