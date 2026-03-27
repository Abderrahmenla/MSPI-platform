import { test, expect } from '@playwright/test';

test.describe('Navigation & locale switching', () => {
  test('homepage redirects / to /ar (default locale)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/ar/);
  });

  test('French homepage loads and shows nav', async ({ page }) => {
    await page.goto('/fr');
    await expect(page).toHaveTitle(/MSPI/);
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('Arabic homepage renders RTL', async ({ page }) => {
    await page.goto('/ar');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });

  test('English homepage loads', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/MSPI/);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'ltr');
  });

  test('nav links point to correct locale paths', async ({ page }) => {
    await page.goto('/fr');
    const productsLink = page.getByRole('link', { name: /Produits/i });
    await expect(productsLink).toHaveAttribute('href', /\/fr\/products/);
  });

  test('footer is visible on homepage', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('404 page for unknown route', async ({ page }) => {
    const response = await page.goto('/fr/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('User-agent');
    expect(body).toContain('Sitemap');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).toContain('/fr');
    expect(body).toContain('/ar');
  });
});
