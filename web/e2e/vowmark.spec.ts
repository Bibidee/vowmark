import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
}

test.describe("VOWMARK browser contract", () => {
  test("landing page exposes the public accountability journey", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /make a promise that can outlive your certainty/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /make a commitment/i })).toHaveAttribute("href", "/issue");
    await expect(page.getByRole("link", { name: /recover activity/i })).toHaveAttribute("href", "/activity");
    await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("issue form rejects an invalid review window before wallet access", async ({ page }) => {
    await page.goto("/issue");
    await page.getByLabel("The commitment").fill("Publish a dated release record");
    await page.getByLabel("The test").fill("A public dated record proves the release");
    await page.locator("#maturity").fill("2099-01-02T00:00");
    await page.locator("#deadline").fill("2099-01-02T00:01");
    await page.getByLabel("If you break it").fill("0x1111111111111111111111111111111111111111");
    await page.getByLabel("Evidence node // 01").fill("https://example.com/release");
    await page.getByLabel("What does this source prove?").fill("The dated release record");
    await expect(page.locator("#deadline")).toHaveValue("2099-01-02T00:01");
    await page.getByRole("button", { name: /freeze and issue commitment/i }).click();
    await expect(page.locator(".error-box")).toContainText("at least 15 minutes");
  });

  test("valid issue intent reaches the explicit wallet boundary", async ({ page }) => {
    await page.goto("/issue");
    await page.getByLabel("The commitment").fill("Publish a dated release record");
    await page.getByLabel("The test").fill("A public dated record proves the release");
    await page.getByLabel("If you break it").fill("0x1111111111111111111111111111111111111111");
    await page.getByLabel("Evidence node // 01").fill("https://example.com/release");
    await page.getByLabel("What does this source prove?").fill("The dated release record");
    await page.getByRole("button", { name: /freeze and issue commitment/i }).click();
    await expect(page.locator(".error-box")).toContainText(/injected wallet|wallet/i);
  });

  test("commitment route keeps canonical-read and transaction states explicit", async ({ page }) => {
    await page.goto("/commitment/1");
    const trace = page.locator(".transaction-rail");
    const readFailure = page.locator(".page > .error-box");
    await expect(trace.or(readFailure).first()).toBeVisible({ timeout: 20_000 });
    if (await trace.isVisible()) {
      await expect(trace.getByText(/transaction trace/i)).toBeVisible();
      await expect(page.getByText(/vault credit and withdrawal/i)).toBeVisible();
      await expect(page.locator(".record-grid aside").getByRole("button", { name: /connect wallet/i })).toBeVisible();
    } else {
      await expect(readFailure).toContainText(/unable to read|failed|fetch|network/i);
      await expect(page.getByRole("link", { name: /back to the board/i })).toBeVisible();
    }
  });

  test("mobile layout remains readable without horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /make a vow/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
