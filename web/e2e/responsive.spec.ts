import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
}

test.describe("VOWMARK responsive contract", () => {
  test("board controls and wallet access stay inside the viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /make a vow/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("issue form labels, primary action, and evidence controls remain reachable", async ({ page }) => {
    await page.goto("/issue");
    await expect(page.getByLabel("The commitment")).toBeVisible();
    await expect(page.getByLabel("Evidence node // 01")).toBeVisible();
    await expect(page.getByRole("button", { name: /freeze and issue commitment/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
