// Module switching test for course structure
// Tests that users can switch between different modules in the course

const { test, expect } = require('@playwright/test');

test.describe('Module Switching Functionality', () => {
  test('should allow switching from Module 1 to Module 2', async ({ page }) => {
    // Start at Module 1 Week 1
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Navigate to Module 2 through the sidebar
    await page.click('text=Module 2: Digital Twin & Simulation');

    // Wait for navigation to module 2 section
    await page.waitForURL('**/docs/modules/module-2-digital-twin/**');

    // Verify we're in the right module by checking for week content
    await expect(page.locator('text=Week 6-7: Gazebo & Unity Digital Twins')).toBeVisible();
  });

  test('should allow switching from Module 2 to Module 3', async ({ page }) => {
    // Start at Module 2 Week 6-7
    await page.goto('http://localhost:3000/docs/modules/module-2-digital-twin/week6-7-gazebo-unity');

    // Navigate to Module 3 through the sidebar
    await page.click('text=Module 3: AI-Robot Brain');

    // Wait for navigation to module 3 section
    await page.waitForURL('**/docs/modules/module-3-ai-robot-brain/**');

    // Verify we're in the right module by checking for week content
    await expect(page.locator('text=Week 8-10: NVIDIA Isaac for AI-Robot Brains')).toBeVisible();
  });

  test('should allow switching from Module 3 to Module 4', async ({ page }) => {
    // Start at Module 3 Week 8-10
    await page.goto('http://localhost:3000/docs/modules/module-3-ai-robot-brain/week8-10-nvidia-isaac');

    // Navigate to Module 4 through the sidebar
    await page.click('text=Module 4: Vision-Language-Action (VLA) Models');

    // Wait for navigation to module 4 section
    await page.waitForURL('**/docs/modules/module-4-vla/**');

    // Verify we're in the right module by checking for week content
    await expect(page.locator('text=Week 11-12: Humanoid Robot Development')).toBeVisible();
    await expect(page.locator('text=Week 13: Conversational Robotics')).toBeVisible();
  });

  test('should maintain navigation context when switching modules', async ({ page }) => {
    // Start at Module 1
    await page.goto('http://localhost:3000/docs/modules/module-1-ros2/week1-2-intro');

    // Switch to Module 4
    await page.click('text=Module 4: Vision-Language-Action (VLA) Models');
    await page.waitForURL('**/docs/modules/module-4-vla/**');

    // Switch back to Module 1
    await page.click('text=Module 1: The Robotic Nervous System (ROS 2)');
    await page.waitForURL('**/docs/modules/module-1-ros2/**');

    // Verify we're back at Module 1
    await expect(page.locator('h1')).toContainText('Week 1-2: Introduction to Physical AI');
  });

  test('should allow direct navigation to any module from intro', async ({ page }) => {
    // Start at intro
    await page.goto('http://localhost:3000/docs/intro');

    // Navigate directly to Module 3
    await page.click('text=Module 3: AI-Robot Brain');
    await page.waitForURL('**/docs/modules/module-3-ai-robot-brain/**');

    // Verify navigation worked
    await expect(page.locator('text=Week 8-10: NVIDIA Isaac for AI-Robot Brains')).toBeVisible();
  });
});