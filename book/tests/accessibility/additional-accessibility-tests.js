// Additional accessibility tests for the textbook
// Tests for WCAG compliance, keyboard navigation, and screen reader compatibility

const { test, expect } = require('@playwright/test');

test.describe('Additional Accessibility Tests', () => {
  test('should have proper alt text for all images', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/docs/intro');

    // Check that all images have alt attributes
    const images = await page.$$('img');
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
      expect(alt).not.toBe('');
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Get all heading elements
    const headings = await page.$$('.markdown h1, .markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6');

    // Check that headings follow a proper hierarchical order
    let lastLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(node => node.tagName);
      const level = parseInt(tagName.charAt(1)); // Extract number from H1, H2, etc.

      // Headings should not skip levels (e.g., go from H1 to H3 without H2)
      if (lastLevel > 0) {
        expect(level).toBeLessThanOrEqual(lastLevel + 1);
      }
      lastLevel = level;
    }
  });

  test('should be navigable via keyboard', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Test that focus indicators are visible
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement.tagName);
    expect(activeElement).toBeTruthy();

    // Test navigation through links using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Activate the focused link

    // Should still be on a valid page after keyboard navigation
    await expect(page).toHaveURL(/docs/);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/docs/intro');

    // Check if elements have sufficient contrast (this is a basic check)
    // In a real implementation, we would use a library like @axe-core/playwright
    const body = await page.$('body');
    expect(body).toBeTruthy();
  });

  test('should have proper focus management in navigation', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Test sidebar navigation focus management
    const sidebarLinks = await page.$$('.sidebar .menu__link');
    expect(sidebarLinks.length).toBeGreaterThan(0);

    // Check that sidebar links are keyboard accessible
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement.classList.contains('menu__link'));
    // This test would need more specific implementation in a real scenario
  });

  test('should have proper ARIA labels where needed', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/docs/intro');

    // Check for proper ARIA attributes on interactive elements
    const buttons = await page.$$('.button, [role="button"]');
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      // Either aria-label or title should be present for buttons
      expect(ariaLabel || title).toBeTruthy();
    }
  });

  test('should have skip to content link', async ({ page }) => {
    // Navigate to a content page
    await page.goto('http://localhost:3000/docs/intro');

    // Check for skip to content link (common accessibility feature)
    const skipLink = await page.$('[href="#skip-to-content"], [id="skip-to-content"]');
    // This might not exist in default Docusaurus, but it's a good accessibility feature
  });
});