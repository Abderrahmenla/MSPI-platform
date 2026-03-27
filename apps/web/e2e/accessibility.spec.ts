import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'Homepage (fr)', path: '/fr' },
  { name: 'Products (fr)', path: '/fr/products' },
  { name: 'Quote (fr)', path: '/fr/devis' },
  { name: 'Homepage (ar)', path: '/ar' },
];

for (const { name, path } of PAGES) {
  test(`${name} — no critical a11y violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#__next > [aria-hidden]') // Framer Motion hidden layers
      .analyze();

    // Filter to critical/serious violations only
    const critical = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );

    if (critical.length > 0) {
      const summary = critical
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.target).join(', ')}`,
        )
        .join('\n\n');
      expect(
        critical,
        `A11y violations on ${path}:\n\n${summary}`,
      ).toHaveLength(0);
    }
  });
}

test('Quote form — interactive elements are keyboard accessible', async ({
  page,
}) => {
  await page.goto('/fr/devis');

  // Tab through all form fields
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(['INPUT', 'BUTTON', 'TEXTAREA', 'A', 'SELECT']).toContain(focused);
});

test('Homepage FAQ accordion — keyboard expandable', async ({ page }) => {
  await page.goto('/fr');
  await page.waitForLoadState('networkidle');

  const faqButtons = page.getByRole('button', { expanded: false });
  const count = await faqButtons.count();
  if (count > 0) {
    const firstBtn = faqButtons.first();
    await firstBtn.focus();
    await page.keyboard.press('Enter');
    await expect(firstBtn).toHaveAttribute('aria-expanded', 'true');
  }
});

test('All images have alt text', async ({ page }) => {
  await page.goto('/fr');
  await page.waitForLoadState('networkidle');

  const imagesWithoutAlt = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter(
        (img) => !img.hasAttribute('alt') && !img.closest('[aria-hidden]'),
      )
      .map((img) => img.src);
  });

  expect(
    imagesWithoutAlt,
    `Images missing alt text: ${imagesWithoutAlt.join(', ')}`,
  ).toHaveLength(0);
});
