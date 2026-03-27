import { test, expect } from '@playwright/test';

test.describe('Quote form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/devis');
  });

  test('page loads with quote form', async ({ page }) => {
    await expect(page).toHaveTitle(/Devis/i);
    await expect(page.getByRole('form')).toBeVisible();
  });

  test('form shows required field errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /Envoyer/i }).click();
    await expect(page.getByText('Champ obligatoire').first()).toBeVisible();
  });

  test('invalid phone shows validation error', async ({ page }) => {
    await page.getByLabel(/Nom complet/i).fill('Test User');
    await page.getByLabel(/Téléphone/i).fill('123');
    await page
      .getByLabel(/Décrivez votre besoin/i)
      .fill('Test message for quote with enough characters to pass validation');
    await page.getByRole('button', { name: /Envoyer/i }).click();
    await expect(page.getByText(/Numéro de téléphone invalide/i)).toBeVisible();
  });

  test('message field shows character counter', async ({ page }) => {
    const textarea = page.getByLabel(/Décrivez votre besoin/i);
    await textarea.fill('Hello');
    await expect(page.getByText(/\/2000/)).toBeVisible();
  });

  test('message counter turns red near limit', async ({ page }) => {
    const textarea = page.getByLabel(/Décrivez votre besoin/i);
    // Fill 1950 characters
    await textarea.fill('a'.repeat(1950));
    const counter = page.getByText(/1950\/2000/);
    await expect(counter).toBeVisible();
    await expect(counter).toHaveClass(/text-red/);
  });

  test('valid form submits successfully (mocked API)', async ({ page }) => {
    // Mock the quotes API endpoint
    await page.route('**/api/v1/quotes', (route) => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 1 } }),
      });
    });

    await page.getByLabel(/Nom complet/i).fill('Mohamed Ben Ali');
    await page.getByLabel(/Téléphone/i).fill('21623456789');
    await page
      .getByLabel(/Décrivez votre besoin/i)
      .fill(
        'Installation de détecteurs incendie pour un entrepôt de 500 m² avec certification APSAD',
      );
    await page.getByRole('button', { name: /Envoyer/i }).click();

    await expect(page.getByText(/demande a été envoyée/i)).toBeVisible();
  });
});
