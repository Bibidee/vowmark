import type { Page } from "@playwright/test";
import { DEFAULT_ACCOUNT, DEFAULT_TX_HASH, RETRY_TX_HASH } from "./provider";
import { E2E_REGISTRY as REGISTRY, E2E_VAULT as VAULT } from "./config";

type ActivityMode = "PENDING" | "ACCEPTED" | "FAILED" | "UNDETERMINED" | "REGISTRATION_PENDING";

function leb(value: bigint) {
  const bytes: number[] = [];
  do {
    let current = Number(value & 0x7fn);
    value >>= 7n;
    if (value > 0n) current |= 0x80;
    bytes.push(current);
  } while (value > 0n);
  return bytes;
}

function encode(value: unknown): number[] {
  if (value === null || value === undefined) return [0];
  if (value === false) return [8];
  if (value === true) return [16];
  if (typeof value === "bigint" || typeof value === "number") return leb((BigInt(value) << 3n) | 1n);
  if (typeof value === "string") {
    const bytes = Array.from(new TextEncoder().encode(value));
    return [...leb((BigInt(bytes.length) << 3n) | 4n), ...bytes];
  }
  if (Array.isArray(value)) {
    return [...leb((BigInt(value.length) << 3n) | 5n), ...value.flatMap(encode)];
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0);
  return [
    ...leb((BigInt(entries.length) << 3n) | 6n),
    ...entries.flatMap(([key, item]) => {
      const keyBytes = Array.from(new TextEncoder().encode(key));
      return [...leb(BigInt(keyBytes.length)), ...keyBytes, ...encode(item)];
    }),
  ];
}

function encoded(value: unknown) {
  return `0x${Buffer.from(encode(value)).toString("hex")}`;
}

export async function mockActivityRpc(page: Page, mode: ActivityMode, hash = DEFAULT_TX_HASH) {
  let registrationConfirmed = false;
  await page.route("https://studio.genlayer.com/api", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    const method = String(body.method || "");
    if (method === "eth_getTransactionByHash") {
      const requestedHash = String(body.params?.[0] || "");
      if (requestedHash === RETRY_TX_HASH || (mode === "REGISTRATION_PENDING" && requestedHash !== hash)) registrationConfirmed = true;
      const status = requestedHash === RETRY_TX_HASH || mode === "FAILED" || mode === "REGISTRATION_PENDING" ? "FINALIZED" : mode;
      const transaction = {
        hash: requestedHash,
        status,
        consensus_data: status === "FINALIZED" ? {
          leader_receipt: {
            error: null,
            execution_result: mode === "FAILED" ? "ROLLBACK" : "SUCCESS",
            result: { status: mode === "FAILED" ? "rollback" : "return" },
          },
        } : undefined,
      };
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result: transaction }) });
      return;
    }
    if (method === "eth_call") {
      const target = String(body.params?.[0]?.to || "").toLowerCase();
      if (mode === "REGISTRATION_PENDING" && target === VAULT) {
        const retrySubmitted = await page.evaluate(() => window.localStorage.getItem("vowmark.mock.retrySubmitted") === "1");
        const registered = registrationConfirmed || retrySubmitted;
        await route.fulfill({ contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result: encoded({ issuer: DEFAULT_ACCOUNT, registered }) }) });
        return;
      }
      if (mode === "REGISTRATION_PENDING" && target === REGISTRY) {
        await route.fulfill({ contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result: encoded({ commitment_id: 7n }) }) });
        return;
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result: encoded({}) }) });
      return;
    }
    if (method === "sim_getConsensusContract") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          result: {
            address: "0x2222222222222222222222222222222222222222",
            abi: [{
              type: "function",
              name: "addTransaction",
              inputs: [
                { name: "sender", type: "address" },
                { name: "recipient", type: "address" },
                { name: "validators", type: "uint256" },
                { name: "rotations", type: "uint256" },
                { name: "data", type: "bytes" },
              ],
              outputs: [],
              stateMutability: "payable",
            }],
          },
        }),
      });
      return;
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ jsonrpc: "2.0", id: body.id, result: null }) });
  });
  await page.addInitScript(({ activityHash, activityMode }) => {
    window.localStorage.setItem("vowmark.activity.v1", JSON.stringify([{
      hash: activityHash,
      label: "Issue commitment",
      kind: "issue",
      commitmentId: activityMode === "REGISTRATION_PENDING" ? "7" : undefined,
      issuer: "0x1111111111111111111111111111111111111111",
      state: activityMode,
      createdAt: "2026-10-08T12:00:00.000Z",
    }]));
  }, { activityHash: hash, activityMode: mode });
}
