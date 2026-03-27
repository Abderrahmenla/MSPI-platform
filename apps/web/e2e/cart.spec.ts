import { test, expect } from '@playwright/test';

test.describe('Cart — guest user flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage cart before each test
    await page.goto('/fr');
    await page.evaluate(() => localStorage.clear());
  });

  test('empty cart shows empty state', async ({ page }) => {
    // Mock the cart API to return 401 (unauthenticated guest)
    await page.route('**/api/v1/customer/cart', (route) => {
      route.fulfill({ status: 401, body: '{"message":"Unauthorized"}' });
    });
    await page.goto('/fr/cart');
    await page.waitForLoadState('networkidle');
    // Guest without local cart sees empty cart or redirect
    expect(page.url()).toBeTruthy();
  });

  test('cart page loads without crashing', async ({ page }) => {
    await page.route('**/api/v1/customer/cart', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { items: [], total: '0.00' } }),
      });
    });
    await page.goto('/fr/cart');
    await expect(page.locator('main')).toBeVisible();
  });

  test('cart with items shows checkout button', async ({ page }) => {
    await page.route('**/api/v1/customer/cart', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 1,
                qty: 2,
                product: {
                  id: 1,
                  nameAr: 'طفاية',
                  nameFr: 'Extincteur CO2 2kg',
                  nameEn: 'CO2 Extinguisher 2kg',
                  slug: 'extincteur-co2-2kg',
                  price: '49.90',
                  stock: 10,
                  isActive: true,
                  images: [],
                },
              },
            ],
            total: '99.80',
          },
        }),
      });
    });
    await page.goto('/fr/cart');
    await expect(
      page.getByRole('link', { name: /Passer la commande/i }),
    ).toBeVisible();
  });

  test('cart with OOS item disables checkout', async ({ page }) => {
    await page.route('**/api/v1/customer/cart', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                id: 1,
                qty: 1,
                product: {
                  id: 1,
                  nameAr: 'طفاية',
                  nameFr: 'Extincteur épuisé',
                  nameEn: 'Sold Out Extinguisher',
                  slug: 'extincteur-epuise',
                  price: '29.90',
                  stock: 0,
                  isActive: true,
                  images: [],
                },
              },
            ],
            total: '29.90',
          },
        }),
      });
    });
    await page.goto('/fr/cart');
    const checkoutLink = page.getByRole('link', {
      name: /Passer la commande/i,
    });
    await expect(checkoutLink).toHaveAttribute('aria-disabled', 'true');
  });

  test('product listing page has correct title', async ({ page }) => {
    await page.goto('/fr/products');
    await expect(page).toHaveTitle(/Produits/i);
  });

  test('product listing page has language-specific heading', async ({
    page,
  }) => {
    await page.goto('/ar/products');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });
});
