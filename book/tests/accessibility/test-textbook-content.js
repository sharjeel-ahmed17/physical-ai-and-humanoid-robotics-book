// Accessibility test for textbook content
// Tests that textbook content is accessible and properly formatted

const { test, expect } = require('@playwright/test');

test.describe('Textbook Content Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Check for proper heading hierarchy
    const mainHeading = await page.$('h1');
    expect(mainHeading).toBeTruthy();

    // Verify there's only one h1
    const h1Count = await page.evaluate(() => document.querySelectorAll('h1').length);
    expect(h1Count).toBe(1);
  });

  test('should have proper navigation structure', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Check for sidebar navigation
    const sidebar = await page.$('.sidebar');
    expect(sidebar).toBeTruthy();

    // Check for course navigation
    const navLinks = await page.$$('.sidebar .menu__link');
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('should have proper content structure', async ({ page }) => {
    // Navigate to a module page
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Check for proper content structure
    const content = await page.$('.markdown');
    expect(content).toBeTruthy();

    // Check for proper heading structure in content
    const headings = await page.$$('.markdown h2, .markdown h3');
    expect(headings.length).toBeGreaterThan(0);
  });
});