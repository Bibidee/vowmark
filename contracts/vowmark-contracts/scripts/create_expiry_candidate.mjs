import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS || "0x3Be513bB6CAe652826A6092C0715AF39E7189c71";
const VAULT = process.env.VOWMARK_VAULT_ADDRESS || "0xf8D89f89aD160546780eD76Cd64C550d91bAf501";
const REMEDY = process.env.VOWMARK_REMEDY_ADDRESS || "0xf883bce8fcb120f714b147446342d7e4545bc988";
const BOND = 100000000000000n;
const maturityDelay = BigInt(process.env.VOWMARK_MATURITY_DELAY_SECONDS || "60");
const reviewWindow = BigInt(process.env.VOWMARK_REVIEW_WINDOW_SECONDS || "900");
const evidencePath = new URL(process.env.VOWMARK_EVIDENCE_FILE || "../../../evidence/live_expiry_candidate_final.json", import.meta.url);
const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };

function json(value) { return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2); }
function plain(value) {
  if (value instanceof Map) return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [key, plain(item)]));
  if (Array.isArray(value)) return value.map(plain);
  return value;
}
function leader(receipt) { const raw = receipt.consensus_data?.leader_receipt; return Array.isArray(raw) ? raw[0] : raw; }
function successful(receipt) {
  const currentLeader = leader(receipt);
  const status = String(receipt.status_name ?? receipt.status).toUpperCase();
  const decodedStatus = currentLeader?.result && typeof currentLeader.result === "object" ? currentLeader.result.status : undefined;
  return (status === TransactionStatus.FINALIZED || status === "7") && currentLeader && currentLeader.error == null && currentLeader.execution_result === "SUCCESS" && (decodedStatus === undefined || decodedStatus === "return");
}
async function final(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  if (!successful(receipt)) throw new Error(`Finalized transaction did not execute successfully: ${json(receipt)}`);
  return receipt;
}
async function read(client, address, functionName, args = []) { return plain(await client.readContract({ address, functionName, args, stateStatus: TransactionStatus.FINALIZED })); }
async function write(client, address, functionName, args = [], value = 0n) {
  const hash = await client.writeContract({ address, functionName, args, value });
  const receipt = await final(client, hash);
  return { hash, receipt };
}
function decodeInteger(bytes) {
  let value = 0n; let shift = 0n; let index = 0;
  while (index < bytes.length) { const byte = bytes[index++]; value |= BigInt(byte & 0x7f) << shift; if ((byte & 0x80) === 0) break; shift += 7n; }
  if (index === 0 || (bytes[index - 1] & 0x80) !== 0) return undefined;
  const type = Number(value & 0x7n); const magnitude = value >> 3n;
  return type === 1 ? magnitude : type === 2 ? -1n - magnitude : undefined;
}
function decodeReturn(receipt) {
  const result = leader(receipt)?.result;
  if (result && typeof result === "object" && result.status === "return") {
    const readable = result.payload?.readable;
    if (typeof readable === "string" && /^-?\d+$/.test(readable.trim())) return BigInt(readable.trim());
    if (Array.isArray(result.payload?.raw)) return decodeInteger(Uint8Array.from(result.payload.raw));
  }
  return undefined;
}
async function waitFor(label, predicate, attempts = 120) {
  let lastError = "";
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { const result = await predicate(); if (result !== undefined) return result; } catch (error) { lastError = error instanceof Error ? error.message : String(error); }
    console.log(`${label}: waiting for finality/deadline...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`${label} was not observed: ${lastError}`);
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const client = createClient({ chain, endpoint: RPC, account });
await client.initializeConsensusSmartContract();
const now = BigInt(Math.floor(Date.now() / 1000));
const maturity = now + maturityDelay;
const deadline = maturity + reviewWindow;
const proofUrl = "https://vowmark-unavailable-proof.invalid/";
const created = await write(client, VAULT, "create_commitment", [
  "The commitment remains unresolved until the final review deadline.",
  "The frozen page must contain an unambiguous, time-bearing signal proving fulfillment by the recorded maturity timestamp.",
  maturity,
  deadline,
  REMEDY,
  [proofUrl],
  ["PUBLICATION"],
  ["unavailable evidence control for final expiry"],
], BOND);
const commitmentId = decodeReturn(created.receipt);
if (commitmentId === undefined) throw new Error(`Creation returned no commitment id: ${json(created.receipt)}`);
await waitFor(`Registry registration #${commitmentId}`, async () => { try { return await read(client, REGISTRY, "get_commitment", [commitmentId]); } catch { return undefined; } });
await waitFor(`Maturity #${commitmentId}`, async () => Math.floor(Date.now() / 1000) >= Number(maturity) ? true : undefined);
const reviewed = await write(client, REGISTRY, "review_commitment", [commitmentId]);
const commitment = await read(client, REGISTRY, "get_commitment", [commitmentId]);
const reviews = await read(client, REGISTRY, "get_reviews", [commitmentId, 0n, 25n]);
const evidence = { generatedAt: new Date().toISOString(), network: "GenLayer Studionet", chainId: 61999, registry: REGISTRY, vault: VAULT, account: account.address, commitmentId, maturity, deadline, createTx: created.hash, reviewTx: reviewed.hash, commitment, reviews, deployment: { registryTx: process.env.VOWMARK_REGISTRY_DEPLOYMENT_TX || null, vaultTx: process.env.VOWMARK_VAULT_DEPLOYMENT_TX || null, wiringTx: process.env.VOWMARK_WIRING_TX || null } };
fs.mkdirSync(new URL("../../../evidence", import.meta.url), { recursive: true });
fs.writeFileSync(evidencePath, json(evidence));
console.log(json(evidence));
