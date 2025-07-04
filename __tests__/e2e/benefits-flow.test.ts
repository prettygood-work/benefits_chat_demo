import { test, expect } from '@playwright/test';

test.describe('Benefits Assistant E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('complete benefits consultation flow', async ({ page }) => {
    // Start conversation
    const messageInput = page.getByRole('textbox', { name: /message/i });
    await messageInput.click();
    await messageInput.fill(
      'I need help choosing a health insurance plan for my family of 3'
    );
    
    const sendButton = page.getByRole('button', { name: /send/i });
    await sendButton.click();

    // Wait for AI response
    await expect(page.getByText(/help you choose/i)).toBeVisible({ timeout: 15000 });

    // Ask for plan comparison
    await messageInput.fill(
      'Can you show me a comparison of HMO and PPO plans?'
    );
    await sendButton.click();

    // Wait for plan comparison artifact
    await expect(page.getByText('Health Plan Comparison')).toBeVisible({ timeout: 20000 });

    // Verify plan details are shown
    await expect(page.getByText(/monthly/i)).toBeVisible();
    await expect(page.getByText(/deductible/i)).toBeVisible();
    await expect(page.getByText(/copay/i)).toBeVisible();

    // Select a plan
    const selectButton = page.getByRole('button', { name: /select this plan/i }).first();
    await selectButton.click();
    
    // Verify selection confirmation
    await expect(page.getByText(/great choice/i)).toBeVisible();
  });

  test('cost calculation functionality', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message/i });
    const sendButton = page.getByRole('button', { name: /send/i });
    
    await messageInput.fill(
      'Calculate the annual cost for a PPO plan for my family of 2'
    );
    await sendButton.click();

    // Wait for cost calculation response
    await expect(page.getByText(/annual/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/premium/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test('theme switching works correctly', async ({ page }) => {
    // Navigate to chat
    await page.goto('/');

    // Open theme switcher
    const themeButton = page.getByRole('button', { name: /theme/i });
    await themeButton.click();

    // Switch to Healthcare Green theme
    await page.getByText('Healthcare Green').click();

    // Verify theme change (check CSS variables or visual elements)
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    });

    expect(primaryColor.trim()).toBe('#00a86b');
  });

  test('analytics dashboard loads correctly', async ({ page }) => {
    await page.goto('/analytics');

    // Verify key metrics are displayed
    await expect(page.getByText('Total Conversations')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Avg Session Time')).toBeVisible();
    await expect(page.getByText('Satisfaction Score')).toBeVisible();

    // Verify charts are rendered
    await expect(page.locator('svg')).toBeVisible(); // Charts should render as SVG

    // Test export functionality
    const exportButton = page.getByRole('button', { name: /export data/i });
    await expect(exportButton).toBeVisible();
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');

    // Verify mobile layout
    const messageInput = page.getByRole('textbox', { name: /message/i });
    await expect(messageInput).toBeVisible();
    
    // Test plan comparison on mobile
    await messageInput.fill('Show me plan options');
    const sendButton = page.getByRole('button', { name: /send/i });
    await sendButton.click();

    await expect(page.getByText(/plan/i)).toBeVisible({ timeout: 15000 });
  });

  test('navigation between chat and analytics', async ({ page }) => {
    // Start on home page
    await page.goto('/');
    
    // Navigate to analytics via sidebar
    const analyticsLink = page.getByRole('link', { name: /analytics/i });
    await analyticsLink.click();
    
    // Verify analytics page loads
    await expect(page.getByText('Benefits Assistant Analytics')).toBeVisible();
    
    // Navigate back to chat
    const chatLink = page.getByRole('link', { name: /chatbot/i });
    await chatLink.click();
    
    // Verify chat interface is available
    await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible();
  });

  test('error handling and recovery', async ({ page }) => {
    // Test with potentially invalid input
    const messageInput = page.getByRole('textbox', { name: /message/i });
    await messageInput.fill('');
    
    const sendButton = page.getByRole('button', { name: /send/i });
    await sendButton.click();
    
    // Should handle empty message gracefully
    // The interface should remain functional
    await expect(messageInput).toBeVisible();
    
    // Test with valid input after error
    await messageInput.fill('Hello, I need help with benefits');
    await sendButton.click();
    
    // Should work normally
    await expect(page.getByText(/help/i)).toBeVisible({ timeout: 10000 });
  });

  test('accessibility features', async ({ page }) => {
    // Check for proper ARIA labels and keyboard navigation
    const messageInput = page.getByRole('textbox', { name: /message/i });
    
    // Verify input is focusable
    await messageInput.focus();
    await expect(messageInput).toBeFocused();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeFocused();
    
    // Test with screen reader simulation
    const inputLabel = await messageInput.getAttribute('aria-label');
    expect(inputLabel).toBeTruthy();
  });

  test('conversation persistence', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message/i });
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send first message
    await messageInput.fill('What are the differences between HMO and PPO?');
    await sendButton.click();
    
    // Wait for response
    await expect(page.getByText(/HMO/i)).toBeVisible({ timeout: 15000 });
    
    // Send follow-up message
    await messageInput.fill('Which one is better for a family?');
    await sendButton.click();
    
    // Verify conversation history is maintained
    await expect(page.getByText(/differences between HMO and PPO/i)).toBeVisible();
    await expect(page.getByText(/family/i)).toBeVisible({ timeout: 15000 });
  });

  test('plan comparison interaction flow', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: /message/i });
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Request plan comparison
    await messageInput.fill('Create a plan comparison for PPO and HMO plans');
    await sendButton.click();
    
    // Wait for artifact to appear
    await expect(page.getByText('Health Plan Comparison')).toBeVisible({ timeout: 20000 });
    
    // Interact with plan cards
    const planCards = page.locator('[data-testid="plan-card"]').or(page.locator('.cursor-pointer'));
    const firstCard = planCards.first();
    await firstCard.click();
    
    // Verify selection state changes
    await expect(page.getByText(/selected/i)).toBeVisible();
    
    // Test different plan selection
    const secondCard = planCards.nth(1);
    await secondCard.click();
    
    // Verify new selection
    await expect(page.getByText(/great choice/i)).toBeVisible();
  });

  test('performance and loading states', async ({ page }) => {
    // Monitor network requests
    const responses: any[] = [];
    page.on('response', response => {
      responses.push(response);
    });
    
    const messageInput = page.getByRole('textbox', { name: /message/i });
    const sendButton = page.getByRole('button', { name: /send/i });
    
    await messageInput.fill('Show me plan costs');
    
    const startTime = Date.now();
    await sendButton.click();
    
    // Wait for response
    await expect(page.getByText(/cost/i)).toBeVisible({ timeout: 15000 });
    const endTime = Date.now();
    
    // Verify reasonable response time
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(10000); // 10 seconds max
    
    // Verify no failed requests
    const failedResponses = responses.filter(r => r.status() >= 400);
    expect(failedResponses.length).toBe(0);
  });
});

test.describe('Analytics Dashboard E2E', () => {
  test('dashboard data visualization', async ({ page }) => {
    await page.goto('/analytics');
    
    // Wait for dashboard to load
    await expect(page.getByText('Benefits Assistant Analytics')).toBeVisible();
    
    // Verify all metric cards are present
    await expect(page.getByText('Total Conversations')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Avg Session Time')).toBeVisible();
    await expect(page.getByText('Satisfaction Score')).toBeVisible();
    
    // Verify charts render
    const charts = page.locator('svg');
    await expect(charts.first()).toBeVisible();
    
    // Test data export
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();
    
    // Note: In a real test, you might verify file download
  });

  test('dashboard responsiveness', async ({ page }) => {
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/analytics');
    
    await expect(page.getByText('Benefits Assistant Analytics')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    await expect(page.getByText('Benefits Assistant Analytics')).toBeVisible();
    
    // Verify metrics are still visible on mobile
    await expect(page.getByText('Total Conversations')).toBeVisible();
  });
});

test.describe('Edge Cases and Error Scenarios', () => {
  test('handles network failures gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    const messageInput = page.getByRole('textbox', { name: /message/i });
    await messageInput.fill('Test message');
    
    const sendButton = page.getByRole('button', { name: /send/i });
    await sendButton.click();
    
    // Should handle gracefully - interface remains functional
    await expect(messageInput).toBeVisible();
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('handles large conversation history', async ({ page }) => {
    await page.goto('/');
    
    const messageInput = page.getByRole('textbox', { name: /message/i });
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send multiple messages to build up history
    for (let i = 0; i < 5; i++) {
      await messageInput.fill(`Test message ${i + 1} about benefits`);
      await sendButton.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
    }
    
    // Verify interface remains responsive
    await expect(messageInput).toBeVisible();
    await expect(sendButton).toBeEnabled();
  });
});