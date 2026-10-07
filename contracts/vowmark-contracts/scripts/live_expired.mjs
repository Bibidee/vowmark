import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS || "0xDe9B1B4E148D8CE973f2268c177A5A4F4e6Db0b2";
const VAULT = process.env.VOWMARK_VAULT_ADDRESS || "0x830D772E6cc3a993345020f28a83980365Be2471";
const COMMITMENT_ID = BigInt(process.env.VOWMARK_EXPIRED_COMMITMENT_ID || "0");
const BOND = 100000000000000n;
const chain = {
  id: 61999,
  name: "GenLayer Studionet",
  rpcUrls: { default: { http: [RPC] } },
  nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
  blockExplorers: { default: { name: "GenLayer Explorer", url: "https://explorer-studio.genlayer.com" } },
  testnet: true,
  consensusMainContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3,
};

function plain(value) {
  if (value instanceof Map) return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [key, plain(item)]));
  if (Array.isArray(value)) return value.map(plain);
  return value;
}

function json(value) {
  return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
}

function leaderReceipt(receipt) {
  const raw = receipt.consensus_data?.leader_receipt;
  return Array.isArray(raw) ? raw[0] : raw;
}

async function finalized(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  const leader = leaderReceipt(receipt);
  if (!leader || leader.error || !["SUCCESS", "FINISHED_WITH_RETURN"].includes(leader.execution_result)) {
    throw new Error(`Finalized transaction did not execute successfully: ${json(receipt)}`);
  }
  return receipt;
}

async function read(client, address, functionName, args = []) {
  return plain(await client.readContract({ address, functionName, args, stateStatus: TransactionStatus.FINALIZED }));
}

async function write(client, address, functionName, args = [], value = 0n) {
  const hash = await client.writeContract({ address, functionName, args, value });
  await finalized(client, hash);
  return hash;
}

async function waitUntil(label, predicate, intervalMs = 30000) {
  let last;
  while (true) {
    last = await predicate();
    if (last !== undefined) return last;
    console.log(`${label}: waiting for the enforced deadline...`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const client = createClient({ chain, endpoint: RPC, account });
await client.initializeConsensusSmartContract();

const before = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
if (before.outcome === "OPEN") {
  await waitUntil(`Commitment #${COMMITMENT_ID}`, async () => {
    const commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
    return Math.floor(Date.now() / 1000) >= Number(commitment.final_review_deadline) ? commitment : undefined;
  });
}

const expireTx = before.outcome === "EXPIRED_UNRESOLVED" ? null : await write(client, REGISTRY, "expire_commitment", [COMMITMENT_ID]);
let commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
if (commitment.outcome !== "EXPIRED_UNRESOLVED") throw new Error(`Expected EXPIRED_UNRESOLVED, got ${commitment.outcome}`);

const settlement = await waitUntil(`Vault settlement #${COMMITMENT_ID}`, async () => {
  const value = await read(client, VAULT, "get_settlement", [COMMITMENT_ID]);
  return value.settled ? value : undefined;
});
const reconcileTx = commitment.settlement_state === "CREDIT_CONFIRMED" ? null : await write(client, REGISTRY, "reconcile_settlement", [COMMITMENT_ID]);
commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
const creditBefore = await read(client, VAULT, "get_credit", [account.address]);
const withdrawalTx = await write(client, VAULT, "withdraw", [BOND]);
const creditAfter = await read(client, VAULT, "get_credit", [account.address]);

const evidence = {
  generatedAt: new Date().toISOString(),
  network: "GenLayer Studionet",
  chainId: 61999,
  registry: REGISTRY,
  vault: VAULT,
  account: account.address,
  commitmentId: COMMITMENT_ID,
  expireTx,
  reconcileTx,
  commitment,
  vaultSettlement: settlement,
  withdrawal: { withdrawalTx, creditBefore, creditAfter },
};
const evidencePath = new URL("../../../evidence/live_expired_pinned.json", import.meta.url);
fs.writeFileSync(evidencePath, json(evidence));
console.log(json(evidence));
