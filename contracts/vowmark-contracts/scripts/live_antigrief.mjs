import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS || "0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8";
const VAULT = process.env.VOWMARK_VAULT_ADDRESS || "0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841";
const REMEDY = process.env.VOWMARK_REMEDY_ADDRESS || "0xf883bce8fcb120f714b147446342d7e4545bc988";
const ANTI_GRIEF_URL = process.env.VOWMARK_ANTIGRIEF_URL || "https://raw.githubusercontent.com/Bibidee/vowmark/main/evidence/anti-grief-live.txt";
const BOND = 100000000000000n;
const chain = { id: 61999, name: "GenLayer Studionet", rpcUrls: { default: { http: [RPC] } }, nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }, consensusMainContract: null, defaultNumberOfInitialValidators: 5, defaultConsensusMaxRotations: 3 };

function json(value) { return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2); }
function plain(value) {
  if (value instanceof Map) return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [key, plain(item)]));
  if (Array.isArray(value)) return value.map(plain);
  return value;
}
function leader(receipt) {
  const raw = receipt.consensus_data?.leader_receipt;
  return Array.isArray(raw) ? raw[0] : raw;
}
function isSuccessfulFinalizedReceipt(receipt, currentLeader) {
  const decodedStatus = currentLeader?.result && typeof currentLeader.result === "object" ? currentLeader.result.status : undefined;
  return receipt.status === TransactionStatus.FINALIZED && currentLeader && currentLeader.error == null && currentLeader.execution_result === "SUCCESS" && (decodedStatus === undefined || decodedStatus === "return");
}
function decodeInteger(bytes) {
  let value = 0n;
  let shift = 0n;
  let index = 0;
  while (index < bytes.length) {
    const byte = bytes[index++];
    value |= BigInt(byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7n;
  }
  if (index === 0 || (bytes[index - 1] & 0x80) !== 0) return undefined;
  const type = Number(value & 0x7n);
  const magnitude = value >> 3n;
  return type === 1 ? magnitude : type === 2 ? -1n - magnitude : undefined;
}
function executionReturn(receipt) {
  const result = leader(receipt)?.result;
  if (result && typeof result === "object" && result.status === "return") {
    const readable = result.payload?.readable;
    if (typeof readable === "string" && /^-?\d+$/.test(readable.trim())) return BigInt(readable.trim());
    if (Array.isArray(result.payload?.raw)) return decodeInteger(Uint8Array.from(result.payload.raw));
  }
  return undefined;
}
async function finalized(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  const currentLeader = leader(receipt);
  if (!isSuccessfulFinalizedReceipt(receipt, currentLeader)) throw new Error(`Finalized transaction did not execute successfully: ${json(receipt)}`);
  return receipt;
}
async function read(client, address, functionName, args = []) {
  return plain(await client.readContract({ address, functionName, args, stateStatus: TransactionStatus.FINALIZED }));
}
async function write(client, address, functionName, args = [], value = 0n) {
  const hash = await client.writeContract({ address, functionName, args, value });
  const receipt = await finalized(client, hash);
  return { hash, receipt };
}
async function waitFor(label, fn, attempts = 120) {
  let lastError = "";
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { const value = await fn(); if (value !== undefined) return value; } catch (error) { lastError = error instanceof Error ? error.message : String(error); }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`${label} was not observed: ${lastError}`);
}

async function clientFor(name) {
  const privateKey = await keytar.getPassword("genlayer-cli", `account:${name}`);
  if (!privateKey) throw new Error(`${name} is not unlocked in the CLI keychain`);
  const account = createAccount(privateKey);
  return { account, client: createClient({ chain, endpoint: RPC, account }) };
}

const issuer = await clientFor("thermo-sponsor");
const reviewerA = await clientFor("live-alice");
const reviewerB = await clientFor("live-bob");
for (const item of [issuer, reviewerA, reviewerB]) await item.client.initializeConsensusSmartContract();

const existingCommitmentId = process.env.VOWMARK_EXISTING_COMMITMENT_ID ? BigInt(process.env.VOWMARK_EXISTING_COMMITMENT_ID) : undefined;
const maturity = BigInt(Math.floor(Date.now() / 1000) + Number(process.env.VOWMARK_MATURITY_DELAY_SECONDS || "90"));
const deadline = maturity + 7200n;
const createArgs = [
  "The anti-griefing control must remain inconclusive while two wallets submit changed public snapshots.",
  "The commitment remains OPEN and INCONCLUSIVE; the test passes only if reviewer B can submit after reviewer A without waiting for the per-reviewer cooldown.",
  maturity,
  deadline,
  REMEDY,
  [ANTI_GRIEF_URL],
  ["VERSIONED_SOURCE"],
  ["dynamic snapshot control"],
];
const create = existingCommitmentId === undefined ? await write(issuer.client, VAULT, "create_commitment", createArgs, BOND) : undefined;
let commitmentId = existingCommitmentId ?? (create && executionReturn(create.receipt));
let idResolution = existingCommitmentId === undefined ? "finalized_execution_return" : "existing_commitment_readback";
if (commitmentId === undefined) {
  // This is a post-submit readback fallback for the standalone evidence
  // runner only. The production frontend fails closed if the execution
  // return is absent and never predicts an ID before signing.
  const observedNextId = BigInt(await read(issuer.client, VAULT, "get_next_commitment_id"));
  if (observedNextId <= 0n) throw new Error("Issuance did not return a canonical commitment id");
  commitmentId = observedNextId - 1n;
  idResolution = "post_submit_next_id_readback";
}
await waitFor(`Registry registration #${commitmentId}`, async () => {
  try { return await read(issuer.client, REGISTRY, "get_commitment", [commitmentId]); } catch { return undefined; }
});
const issuance = await waitFor(`Vault registration #${commitmentId}`, async () => {
  const current = await read(issuer.client, VAULT, "get_issuance", [commitmentId]);
  return current.registered ? current : undefined;
});
const existingIssuance = existingCommitmentId === undefined ? undefined : await read(issuer.client, VAULT, "get_issuance", [commitmentId]);
const effectiveMaturity = existingCommitmentId === undefined ? maturity : BigInt(existingIssuance.maturity_at);
await waitFor(`Maturity #${commitmentId}`, async () => Math.floor(Date.now() / 1000) >= Number(effectiveMaturity) ? true : undefined);

const reviewA = await write(reviewerA.client, REGISTRY, "review_commitment", [commitmentId]);
const afterReviewA = await read(issuer.client, REGISTRY, "get_reviews", [commitmentId]);
if (afterReviewA.length !== 1) throw new Error(`Reviewer A transaction did not apply canonically: ${json(afterReviewA)}`);
const pauseBeforeReviewerB = Number(process.env.VOWMARK_PAUSE_BEFORE_REVIEW_B_SECONDS || "0");
if (pauseBeforeReviewerB > 0) await new Promise((resolve) => setTimeout(resolve, pauseBeforeReviewerB * 1000));
const reviewB = await write(reviewerB.client, REGISTRY, "review_commitment", [commitmentId]);
const commitment = await read(issuer.client, REGISTRY, "get_commitment", [commitmentId]);
const reviews = await read(issuer.client, REGISTRY, "get_reviews", [commitmentId]);
if (reviews.length !== 2 || reviews[0].requested_by.toLowerCase() !== reviewerA.account.address.toLowerCase() || reviews[1].requested_by.toLowerCase() !== reviewerB.account.address.toLowerCase() || commitment.attempt_count !== 2n || commitment.outcome !== "OPEN") {
  throw new Error(`Anti-griefing invariant failed: ${json({ commitment, reviews })}`);
}

const evidence = {
  generatedAt: new Date().toISOString(),
  network: "GenLayer Studionet",
  chainId: 61999,
  registry: REGISTRY,
  vault: VAULT,
  issuer: issuer.account.address,
  reviewerA: reviewerA.account.address,
  reviewerB: reviewerB.account.address,
  proof: {
    statement: createArgs[0],
    rule: createArgs[1],
    url: ANTI_GRIEF_URL,
    sourceKind: "VERSIONED_SOURCE",
    purpose: "mutable public snapshot control",
  },
  fixtureCommits: {
    beforeReviewerA: process.env.VOWMARK_ANTIGRIEF_BEFORE_COMMIT || null,
    beforeReviewerB: process.env.VOWMARK_ANTIGRIEF_AFTER_COMMIT || null,
  },
  commitmentId,
  idResolution,
  createTx: create?.hash || null,
  reviewATx: reviewA.hash,
  reviewBTx: reviewB.hash,
  maturity: effectiveMaturity,
  deadline: existingCommitmentId === undefined ? deadline : BigInt(existingIssuance.final_review_deadline),
  issuance,
  commitment,
  reviews,
};
fs.writeFileSync(new URL(process.env.VOWMARK_EVIDENCE_FILE || "../../../evidence/live_antigrief_final.json", import.meta.url), json(evidence));
console.log(json(evidence));
