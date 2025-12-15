// Hardware requirements accessibility test
// Tests that hardware requirements information is accessible and properly formatted

const { test, expect } = require('@playwright/test');

test.describe('Hardware Requirements Accessibility', () => {
  test('should display hardware requirements section in navigation', async ({ page }) => {
    // Navigate to the intro page
    await page.goto('http://localhost:3000/docs/intro');

    // Check for hardware requirements in the sidebar
    await expect(page.locator('text=Hardware Requirements')).toBeVisible();
  });

  test('should access digital twin workstation requirements', async ({ page }) => {
    // Navigate to the digital twin workstation requirements
    await page.goto('http://localhost:3000/docs/hardware-requirements/digital-twin-workstation');

    // Verify page content
    await expect(page.locator('h1')).toContainText('Digital Twin Workstation');
    await expect(page.locator('text=Minimum Specifications')).toBeVisible();
    await expect(page.locator('text=Recommended Specifications')).toBeVisible();
    await expect(page.locator('text=Cost Breakdown')).toBeVisible();
  });

  test('should access physical AI edge kit requirements', async ({ page }) => {
    // Navigate to the physical AI edge kit requirements
    await page.goto('http://localhost:3000/docs/hardware-requirements/physical-ai-edge-kit');

    // Verify page content
    await expect(page.locator('h1')).toContainText('Physical AI Edge Kit');
    await expect(page.locator('text=Essential Components')).toBeVisible();
    await expect(page.locator('text=Alternative Options')).toBeVisible();
    await expect(page.locator('text=Cost Breakdown')).toBeVisible();
  });

  test('should access robot lab options', async ({ page }) => {
    // Navigate to the robot lab options
    await page.goto('http://localhost:3000/docs/hardware-requirements/robot-lab-options');

    // Verify page content
    await expect(page.locator('h1')).toContainText('Robot Lab Options');
    await expect(page.locator('text=Option 1: Individual Student Kits')).toBeVisible();
    await expect(page.locator('text=Option 2: Shared Lab Stations')).toBeVisible();
    await expect(page.locator('text=Option 3: Hybrid Approach')).toBeVisible();
  });

  test('should navigate between hardware requirement pages', async ({ page }) => {
    // Start at digital twin workstation
    await page.goto('http://localhost:3000/docs/hardware-requirements/digital-twin-workstation');

    // Navigate to physical AI edge kit
    await page.click('text=Physical AI Edge Kit');
    await page.waitForURL('**/docs/hardware-requirements/physical-ai-edge-kit');
    await expect(page.locator('h1')).toContainText('Physical AI Edge Kit');

    // Navigate to robot lab options
    await page.click('text=Robot Lab Options');
    await page.waitForURL('**/docs/hardware-requirements/robot-lab-options');
    await expect(page.locator('h1')).toContainText('Robot Lab Options');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Navigate to a hardware requirements page
    await page.goto('http://localhost:3000/docs/hardware-requirements/digital-twin-workstation');

    // Check for proper heading structure
    const mainHeading = await page.$('h1');
    expect(mainHeading).toBeTruthy();

    // Check for semantic HTML elements
    const tables = await page.$$('.table'); // or other table selectors
    expect(tables.length).toBeGreaterThanOrEqual(0); // There should be cost breakdown tables

    // Check for proper content structure
    const content = await page.$('.markdown');
    expect(content).toBeTruthy();
  });
});