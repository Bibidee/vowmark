import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS || "0xb2Fb628484f7b1C10D35d11A49B660f0aE924F37";
const VAULT = process.env.VOWMARK_VAULT_ADDRESS || "0x59E28386C2804fbECCeC37D4A093b43f901af15b";
const rawCommitmentId = process.env.VOWMARK_EXPIRED_COMMITMENT_ID;
if (!rawCommitmentId) throw new Error("VOWMARK_EXPIRED_COMMITMENT_ID is required");
const COMMITMENT_ID = BigInt(rawCommitmentId);
const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };

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
function isSuccessfulFinalizedReceipt(receipt, leader) {
  const decodedStatus = leader?.result && typeof leader.result === "object" ? leader.result.status : undefined;
  const status = String(receipt.status_name ?? receipt.status).toUpperCase();
  return (status === TransactionStatus.FINALIZED || status === "7") && leader && leader.error == null && leader.execution_result === "SUCCESS" && (decodedStatus === undefined || decodedStatus === "return");
}

async function finalized(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  const leader = leaderReceipt(receipt);
  if (!isSuccessfulFinalizedReceipt(receipt, leader)) {
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

const registryConfig = await read(client, REGISTRY, "get_config");
const vaultRegistry = await read(client, VAULT, "get_registry");
if (String(registryConfig.vault_address).toLowerCase() !== VAULT.toLowerCase() || String(vaultRegistry).toLowerCase() !== REGISTRY.toLowerCase()) {
  throw new Error(`Registry/Vault deployment wiring does not match configured addresses: ${json({ registryConfig, vaultRegistry, REGISTRY, VAULT })}`);
}

let before = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
if (!["OPEN", "EXPIRED_UNRESOLVED"].includes(before.outcome)) {
  throw new Error(`Commitment #${COMMITMENT_ID} is ${before.outcome}; expiry runner only accepts OPEN or EXPIRED_UNRESOLVED`);
}
if (before.outcome === "OPEN") {
  await waitUntil(`Commitment #${COMMITMENT_ID}`, async () => {
    const commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
    return Math.floor(Date.now() / 1000) >= Number(commitment.final_review_deadline) ? commitment : undefined;
  });
}

before = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
if (before.outcome === "OPEN" && Math.floor(Date.now() / 1000) < Number(before.final_review_deadline)) {
  throw new Error(`Commitment #${COMMITMENT_ID} has not passed its final review deadline`);
}
const expireTx = before.outcome === "EXPIRED_UNRESOLVED" ? null : await write(client, REGISTRY, "expire_commitment", [COMMITMENT_ID]);
let commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
if (commitment.outcome !== "EXPIRED_UNRESOLVED") throw new Error(`Expected EXPIRED_UNRESOLVED, got ${commitment.outcome}`);
const issuance = await read(client, VAULT, "get_issuance", [COMMITMENT_ID]);
const BOND = BigInt(issuance.bond);

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
  deployment: { registry: REGISTRY, vault: VAULT, registryConfig, vaultRegistry },
  expireTx,
  reconcileTx,
  commitment,
  vaultSettlement: settlement,
  withdrawal: { withdrawalTx, creditBefore, creditAfter },
};
const evidencePath = new URL("../../../evidence/live_expired_pinned.json", import.meta.url);
fs.writeFileSync(evidencePath, json(evidence));
console.log(json(evidence));
