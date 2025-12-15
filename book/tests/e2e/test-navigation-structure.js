// Navigation structure test for course structure
// Tests that the navigation structure exists and allows movement between modules and weeks

const { test, expect } = require('@playwright/test');

test.describe('Course Navigation Structure', () => {
  test('should display course structure in sidebar', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Check for the presence of all 4 modules in the sidebar
    await expect(page.locator('text=Module 1: The Robotic Nervous System (ROS 2)')).toBeVisible();
    await expect(page.locator('text=Module 2: Digital Twin & Simulation')).toBeVisible();
    await expect(page.locator('text=Module 3: AI-Robot Brain')).toBeVisible();
    await expect(page.locator('text=Module 4: Vision-Language-Action (VLA) Models')).toBeVisible();

    // Check for hardware requirements section
    await expect(page.locator('text=Hardware Requirements')).toBeVisible();
  });

  test('should allow navigation between modules', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Click on Module 1
    await page.click('text=Module 1: The Robotic Nervous System (ROS 2)');

    // Wait for navigation and check URL
    await page.waitForURL('**/docs/modules/module-1-ros2/**');

    // Verify we're in module 1 by checking for week content
    await expect(page.locator('text=Week 1-2: Introduction to Physical AI')).toBeVisible();
    await expect(page.locator('text=Week 3-5: ROS 2 Fundamentals')).toBeVisible();
  });

  test('should allow navigation between weeks within a module', async ({ page }) => {
    // Navigate to module 1 week 1
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Verify we're on the right page
    await expect(page.locator('h1')).toContainText('Week 1-2: Introduction to Physical AI');

    // Navigate to week 3-5 content (should be available in sidebar or through links)
    await page.click('text=Week 3-5: ROS 2 Fundamentals');

    // Wait for navigation and verify
    await page.waitForURL('**/docs/modules/module-1-ros2/week3-5-ros2-fundamentals');
    await expect(page.locator('h1')).toContainText('Week 3-5: ROS 2 Fundamentals');
  });

  test('should show complete course structure from any page', async ({ page }) => {
    // Navigate to a specific week in module 3
    await page.goto('http://localhost:3000/docs/modules/module-3-ai-robot-brain/week8-10-nvidia-isaac');

    // Check that all modules are still visible in the sidebar
    await expect(page.locator('text=Module 1: The Robotic Nervous System (ROS 2)')).toBeVisible();
    await expect(page.locator('text=Module 2: Digital Twin & Simulation')).toBeVisible();
    await expect(page.locator('text=Module 3: AI-Robot Brain')).toBeVisible();
    await expect(page.locator('text=Module 4: Vision-Language-Action (VLA) Models')).toBeVisible();
  });
});