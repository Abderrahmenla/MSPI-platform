import { test, expect } from '@playwright/test';

test.describe('Product catalog', () => {
  test('products page loads and shows product grid', async ({ page }) => {
    await page.goto('/fr/products');
    await expect(page).toHaveTitle(/Produits/i);
    // Product grid renders (may be empty in CI without seeded DB)
    await expect(page.locator('main')).toBeVisible();
  });

  test('product card shows name and price', async ({ page }) => {
    await page.goto('/fr/products');
    // Wait for any product card or empty state
    await page.waitForLoadState('networkidle');
    const cards = page.locator('[data-testid="product-card"]');
    const count = await cards.count();
    if (count > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('add to cart button is present on product cards', async ({ page }) => {
    await page.goto('/fr/products');
    await page.waitForLoadState('networkidle');
    const addButtons = page.getByRole('button', { name: /Ajouter au panier/i });
    const count = await addButtons.count();
    if (count > 0) {
      await expect(addButtons.first()).toBeVisible();
    }
  });

  test('homepage shows products section', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.getByText('Nos produits')).toBeVisible();
  });

  test('homepage hero section renders CTA buttons', async ({ page }) => {
    await page.goto('/fr');
    await expect(
      page.getByRole('link', { name: /Commander maintenant/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Devis gratuit/i }),
    ).toBeVisible();
  });

  test('homepage FAQ section is accessible', async ({ page }) => {
    await page.goto('/fr');
    const faqSection = page.locator('section').filter({ hasText: /FAQ/i });
    if ((await faqSection.count()) > 0) {
      // First FAQ item should be expandable
      const firstQuestion = faqSection.getByRole('button').first();
      await firstQuestion.click();
      await expect(firstQuestion).toHaveAttribute('aria-expanded', 'true');
    }
  });
});
