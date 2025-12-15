// Content rendering test for textbook
// Tests that textbook content renders properly and is accessible

const { test, expect } = require('@playwright/test');

test.describe('Textbook Content Rendering', () => {
  test('should render intro page correctly', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Physical AI & Humanoid Robotics/);

    // Check that the main heading is present
    const heading = page.locator('h1');
    await expect(heading).toContainText('Introduction to Physical AI & Humanoid Robotics');

    // Check that the content is present
    const content = page.locator('.markdown');
    await expect(content).toContainText('Physical AI');
  });

  test('should render module pages correctly', async ({ page }) => {
    // Navigate to a module page
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Check that the page loads
    await expect(page).toHaveURL(/.*\/docs\/modules\/module-1-ros2\/week1-2-intro/);

    // Check for proper content
    const heading = page.locator('h1');
    await expect(heading).toContainText('Week 1-2: Introduction to Physical AI');
  });

  test('should navigate between textbook sections', async ({ page }) => {
    // Start at intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Navigate to first module
    await page.click('text=Week 1-2: Introduction to Physical AI');

    // Check that we're on the right page
    await expect(page).toHaveURL(/.*\/docs\/modules\/module-1-ros2\/week1-2-intro/);

    // Check content is present
    const heading = page.locator('h1');
    await expect(heading).toContainText('Week 1-2: Introduction to Physical AI');
  });
});