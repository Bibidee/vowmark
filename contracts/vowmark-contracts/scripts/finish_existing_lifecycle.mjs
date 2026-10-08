import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS;
const VAULT = process.env.VOWMARK_VAULT_ADDRESS;
const COMMITMENT_ID = BigInt(process.env.VOWMARK_COMMITMENT_ID || "0");
const ACCOUNT_NAME = process.env.VOWMARK_ACCOUNT_NAME || "live-alice";
const EVIDENCE_FILE = process.env.VOWMARK_EVIDENCE_FILE || "../../../evidence/live_existing_lifecycle.json";
if (!REGISTRY || !VAULT) throw new Error("VOWMARK_REGISTRY_ADDRESS and VOWMARK_VAULT_ADDRESS are required");

const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };
const json = (value) => JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
function plain(value) {
  if (value instanceof Map) return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [key, plain(item)]));
  if (Array.isArray(value)) return value.map(plain);
  return value;
}
function leader(receipt) {
  const raw = receipt.consensus_data?.leader_receipt;
  return Array.isArray(raw) ? raw[0] : raw;
}
function successful(receipt) {
  const result = leader(receipt);
  const decodedStatus = result?.result && typeof result.result === "object" ? result.result.status : undefined;
  const status = String(receipt.status_name ?? receipt.status).toUpperCase();
  return (status === TransactionStatus.FINALIZED || status === "7") && result && result.error == null && result.execution_result === "SUCCESS" && (decodedStatus === undefined || decodedStatus === "return");
}
async function finalized(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  if (!successful(receipt)) throw new Error(`Finalized transaction did not execute successfully: ${json(receipt)}`);
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
async function waitFor(label, fn) {
  let lastError = "";
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const value = await fn();
      if (value !== undefined) return value;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`${label} was not observed: ${lastError}`);
}

const privateKey = await keytar.getPassword("genlayer-cli", `account:${ACCOUNT_NAME}`);
if (!privateKey) throw new Error(`${ACCOUNT_NAME} is not unlocked in the CLI keychain`);
const account = createAccount(privateKey);
const client = createClient({ chain, endpoint: RPC, account });
await client.initializeConsensusSmartContract();

let commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
const issuance = await read(client, VAULT, "get_issuance", [COMMITMENT_ID]);
let reviewTx = null;
let reconcileTx = null;
let withdrawalTx = null;
if (commitment.outcome === "OPEN" && Math.floor(Date.now() / 1000) >= Number(commitment.maturity_at) && Math.floor(Date.now() / 1000) < Number(commitment.final_review_deadline)) {
  reviewTx = await write(client, REGISTRY, "review_commitment", [COMMITMENT_ID]);
}
commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
const reviewCount = await read(client, REGISTRY, "get_review_count", [COMMITMENT_ID]);
const reviews = await read(client, REGISTRY, "get_reviews", [COMMITMENT_ID, 0n, 25n]);
let vaultSettlement;
if (commitment.outcome !== "OPEN") {
  vaultSettlement = await waitFor("Vault settlement", async () => {
    const value = await read(client, VAULT, "get_settlement", [COMMITMENT_ID]);
    return value.settled ? value : undefined;
  });
  if (commitment.settlement_state !== "CREDIT_CONFIRMED") reconcileTx = await write(client, REGISTRY, "reconcile_settlement", [COMMITMENT_ID]);
  commitment = await read(client, REGISTRY, "get_commitment", [COMMITMENT_ID]);
}
let withdrawal;
if (commitment.outcome === "FULFILLED" || commitment.outcome === "EXPIRED_UNRESOLVED") {
  const bond = BigInt(issuance.bond);
  const creditBefore = await read(client, VAULT, "get_credit", [account.address]);
  if (creditBefore >= bond) {
    withdrawalTx = await write(client, VAULT, "withdraw", [bond]);
    const creditAfter = await read(client, VAULT, "get_credit", [account.address]);
    withdrawal = { withdrawalTx, creditBefore, creditAfter };
  }
}
const evidence = {
  generatedAt: new Date().toISOString(),
  network: "GenLayer Studionet",
  chainId: 61999,
  accountName: ACCOUNT_NAME,
  registry: REGISTRY,
  vault: VAULT,
  account: account.address,
  commitmentId: COMMITMENT_ID,
  reviewTx,
  reconcileTx,
  reviewCount,
  reviews,
  commitment,
  issuance,
  vaultSettlement,
  withdrawal,
};
fs.mkdirSync(new URL("../../../evidence", import.meta.url), { recursive: true });
fs.writeFileSync(new URL(EVIDENCE_FILE, import.meta.url), json(evidence));
console.log(json(evidence));
