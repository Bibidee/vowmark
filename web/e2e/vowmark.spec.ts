import { expect, test, type Page } from "@playwright/test";
import { DEFAULT_ACCOUNT, installMockProvider, setMockAccounts } from "./provider";

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

  test("wallet signature rejection leaves the issue form recoverable without a hash", async ({ page }) => {
    await installMockProvider(page, { requestAccountsError: { code: 4001, message: "User rejected the wallet request" } });
    await page.goto("/issue");
    await page.getByLabel("The commitment").fill("Publish a dated release record");
    await page.getByLabel("The test").fill("A public dated record proves the release");
    await page.getByLabel("If you break it").fill("0x1111111111111111111111111111111111111111");
    await page.getByLabel("Evidence node // 01").fill("https://example.com/release");
    await page.getByLabel("What does this source prove?").fill("The dated release record");
    await page.getByRole("button", { name: /freeze and issue commitment/i }).click();
    await expect(page.locator(".error-box[role=alert]")).toContainText(/rejected|wallet/i);
    await expect(page.locator(".success-box")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /freeze and issue commitment/i })).toBeEnabled();
  });

  test("wrong network blocks issuance with explicit Studionet guidance", async ({ page }) => {
    await installMockProvider(page, { accounts: [DEFAULT_ACCOUNT], chainId: "0x1" });
    await page.goto("/issue");
    await page.getByLabel("The commitment").fill("Publish a dated release record");
    await page.getByLabel("The test").fill("A public dated record proves the release");
    await page.getByLabel("If you break it").fill("0x2222222222222222222222222222222222222222");
    await page.getByLabel("Evidence node // 01").fill("https://example.com/release");
    await page.getByLabel("What does this source prove?").fill("The dated release record");
    await page.getByRole("button", { name: /freeze and issue commitment/i }).click();
    await expect(page.locator(".error-box[role=alert]")).toContainText(/Studionet before signing/i);
    await expect(page.getByRole("button", { name: /switch to studionet/i })).toBeVisible();
  });

  test("network-switch failure never produces optimistic success", async ({ page }) => {
    await installMockProvider(page, { accounts: [DEFAULT_ACCOUNT], chainId: "0x1", switchError: { code: 4001, message: "Network switch rejected" } });
    await page.goto("/");
    await expect(page.getByRole("button", { name: /switch to studionet/i })).toBeVisible();
    await page.getByRole("button", { name: /switch to studionet/i }).click();
    await expect(page.getByText("Wallet error")).toHaveAttribute("title", /Network switch rejected/);
    await expect(page.locator(".success-box")).toHaveCount(0);
  });

  test("accountsChanged updates the displayed issuer and Forget is app-local", async ({ page }) => {
    const nextAccount = "0x3333333333333333333333333333333333333333";
    await installMockProvider(page, { accounts: [DEFAULT_ACCOUNT], chainId: "0xf22f" });
    await page.goto("/");
    await expect(page.getByTitle(DEFAULT_ACCOUNT)).toBeVisible();
    await setMockAccounts(page, [nextAccount]);
    await expect(page.getByTitle(nextAccount)).toBeVisible();
    await page.getByRole("button", { name: "Forget" }).click();
    await expect(page.getByRole("button", { name: "Connect wallet" })).toBeVisible();
    await expect(page.getByText("VOWMARK-only disconnect")).toHaveCount(0);
  });

  test("primary issue actions have labels, keyboard focus, and live validation announcements", async ({ page }) => {
    await page.goto("/issue");
    await page.getByLabel("The commitment").focus();
    await expect(page.locator(":focus")).toHaveAttribute("id", "statement");
    await expect(page.getByLabel("The test")).toBeVisible();
    await expect(page.getByLabel("Evidence node // 01")).toBeVisible();
    await page.getByRole("button", { name: /freeze and issue commitment/i }).click();
    await expect(page.locator("[role=alert][aria-live=assertive]")).toBeVisible();
  });
});
