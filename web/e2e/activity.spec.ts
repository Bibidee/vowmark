import { expect, test } from "@playwright/test";
import { DEFAULT_TX_HASH, installMockProvider, DEFAULT_ACCOUNT, RETRY_TX_HASH } from "./provider";
import { mockActivityRpc } from "./rpc";

test.describe("VOWMARK transaction recovery", () => {
  test("pending submission survives a reload with the exact hash and no duplicate", async ({ page }) => {
    await mockActivityRpc(page, "PENDING");
    await page.goto("/activity");
    const hashLink = page.locator(`a[href*="${DEFAULT_TX_HASH}"]`);
    await expect(hashLink).toHaveCount(1);
    await expect(hashLink).toContainText("0xaaaaaaaa");
    await page.reload();
    await expect(page.locator(`a[href*="${DEFAULT_TX_HASH}"]`)).toHaveCount(1);
    await expect(page.getByText("Issue commitment")).toHaveCount(1);
  });

  test("ACCEPTED remains provisional and is not rendered as product success", async ({ page }) => {
    await mockActivityRpc(page, "ACCEPTED");
    await page.goto("/activity");
    await expect(page.locator(".status-chip")).toHaveText("ACCEPTED");
    await expect(page.getByText(/Provisional transaction state; finalized execution not observed/i)).toBeVisible();
    await expect(page.getByText(/FINALIZED EXECUTION OK/i)).toHaveCount(0);
  });

  test("finalized execution failure is surfaced as FAILED, not success", async ({ page }) => {
    await mockActivityRpc(page, "FAILED");
    await page.goto("/activity");
    await expect(page.locator(".status-chip")).toHaveText("FAILED");
    await expect(page.getByText(/ROLLBACK|Finalized transaction did not execute successfully/i)).toBeVisible();
    await expect(page.getByText(/FINALIZED EXECUTION OK/i)).toHaveCount(0);
  });

  test("UNDETERMINED stays distinct from VOWMARK INCONCLUSIVE", async ({ page }) => {
    await mockActivityRpc(page, "UNDETERMINED");
    await page.goto("/activity");
    await expect(page.locator(".status-chip")).toHaveText("UNDETERMINED");
    await expect(page.getByText(/Consensus did not produce a final product result/i)).toBeVisible();
    await expect(page.getByText("INCONCLUSIVE", { exact: true })).toHaveCount(0);
  });

  test("finalized issuance with registered=false exposes registration pending and retry", async ({ page }) => {
    await installMockProvider(page, { accounts: [DEFAULT_ACCOUNT], chainId: "0xf22f" });
    await mockActivityRpc(page, "REGISTRATION_PENDING");
    await page.goto("/activity");
    await expect(page.locator(".status-chip")).toHaveText("REGISTRATION PENDING");
    await expect(page.getByText(/REGISTRATION PENDING/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /retry registry registration/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /0xaaaaaaaa/i })).toHaveAttribute("href", /aaaaaaaa/);
  });

  test("registration retry reaches REGISTERED only after successful canonical readback", async ({ page }) => {
    await installMockProvider(page, { accounts: [DEFAULT_ACCOUNT], chainId: "0xf22f", sendTransactionHash: RETRY_TX_HASH });
    await mockActivityRpc(page, "REGISTRATION_PENDING");
    await page.goto("/activity");
    await page.getByRole("button", { name: /retry registry registration/i }).click();
    await expect(page.locator(".activity-row").filter({ hasText: "Issue commitment" }).locator(".status-chip")).toHaveText("REGISTERED", { timeout: 15_000 });
    await expect(page.getByText("CANONICAL REGISTERED")).toBeVisible();
    await expect(page.getByRole("button", { name: /retry registry registration/i })).toHaveCount(0);
  });

  test("canonical reconciliation wins over stale local REGISTERED state", async ({ page }) => {
    await mockActivityRpc(page, "UNDETERMINED");
    await page.addInitScript(() => {
      const record = JSON.parse(window.localStorage.getItem("vowmark.activity.v1") || "[]");
      record[0].state = "REGISTERED";
      window.localStorage.setItem("vowmark.activity.v1", JSON.stringify(record));
    });
    await page.goto("/activity");
    await expect(page.locator(".status-chip")).toHaveText("UNDETERMINED");
    await expect(page.locator(".activity-row")).not.toContainText("REGISTERED");
  });

  test("legacy activity does not query the current deployment or link to a mismatched canonical record", async ({ page }) => {
    await mockActivityRpc(page, "REGISTRATION_PENDING");
    await page.addInitScript(() => {
      const record = JSON.parse(window.localStorage.getItem("vowmark.activity.v1") || "[]");
      delete record[0].registryAddress;
      delete record[0].vaultAddress;
      window.localStorage.setItem("vowmark.activity.v1", JSON.stringify(record));
    });
    await page.goto("/activity");
    await expect(page.getByText(/HISTORICAL DEPLOYMENT/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /open canonical record/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /retry registry registration/i })).toHaveCount(0);
  });
});
