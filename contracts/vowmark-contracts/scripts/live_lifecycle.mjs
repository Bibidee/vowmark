import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS || "0x76DE9332010D5F03660Fa2216cb5cc76585dFFE8";
const VAULT = process.env.VOWMARK_VAULT_ADDRESS || "0x536B5E36d52aC1EFA72d00fFa63B932EfBf42841";
const REMEDY = process.env.VOWMARK_REMEDY_ADDRESS || "0xf883bce8fcb120f714b147446342d7e4545bc988";
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

function json(value) { return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2); }
function plain(value) {
  if (value instanceof Map) return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [key, plain(item)]));
  if (Array.isArray(value)) return value.map(plain);
  return value;
}
function address(value) { return value; }
function sameNumber(left, right) { return BigInt(left) === BigInt(right); }
function successfulLeader(receipt) {
  const raw = receipt.consensus_data?.leader_receipt;
  return Array.isArray(raw) ? raw[0] : raw;
}
function decodeReturn(receipt) {
  const result = successfulLeader(receipt)?.result;
  if (result && typeof result === "object" && result.status === "return") {
    const readable = result.payload?.readable;
    if (typeof readable === "string" && /^-?\d+$/.test(readable.trim())) return BigInt(readable.trim());
    const raw = result.payload?.raw;
    if (Array.isArray(raw)) return decodeInteger(Uint8Array.from(raw));
  }
  if (typeof result === "string") {
    const bytes = Uint8Array.from(atob(result), (character) => character.charCodeAt(0));
    if (bytes[0] !== 0) return undefined;
    return decodeInteger(bytes.slice(1));
  }
  return undefined;
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
async function final(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  const leader = successfulLeader(receipt);
  if (!leader || leader.error || !["SUCCESS", "FINISHED_WITH_RETURN"].includes(leader.execution_result)) throw new Error(`Execution failed for ${hash}: ${json(receipt)}`);
  return receipt;
}
async function read(client, addressValue, functionName, args = []) {
  return plain(await client.readContract({ address: addressValue, functionName, args, stateStatus: TransactionStatus.FINALIZED }));
}
async function write(client, addressValue, functionName, args = [], value = 0n) {
  const hash = await client.writeContract({ address: addressValue, functionName, args, value });
  const receipt = await final(client, hash);
  return { hash, receipt };
}
async function waitFor(client, label, fn, attempts = 120) {
  let lastError = "";
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { const value = await fn(); if (value !== undefined) return value; } catch (error) { lastError = error instanceof Error ? error.message : String(error); }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`${label} was not observed after ${attempts} polls: ${lastError}`);
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const client = createClient({ chain, endpoint: RPC, account });
await client.initializeConsensusSmartContract();
const allProofs = [
  {
    label: "fulfilled-github-commit",
    statement: "The frozen GitHub commit record identifies commit b0ceb52a380b20221e5be749160aeb13bf3904d0 with an author timestamp before maturity.",
    rule: "FULFILLED means the frozen GitHub API record contains the exact commit SHA and shows its author timestamp before the recorded maturity timestamp.",
    url: "https://api.github.com/repos/jonschlinkert/is-number/commits/b0ceb52a380b20221e5be749160aeb13bf3904d0",
    sourceKind: "THIRD_PARTY_RECORD",
    purpose: "immutable GitHub commit timestamp",
  },
  {
    label: "fulfilled-github-release-candidate",
    statement: "The pinned GitHub release record was published before maturity.",
    rule: "FULFILLED means the frozen GitHub release JSON contains a published_at timestamp earlier than the recorded maturity timestamp. No other condition is required.",
    url: "https://api.github.com/repos/jonschlinkert/is-number/releases/tags/7.0.0",
    sourceKind: "THIRD_PARTY_RECORD",
    purpose: "immutable GitHub release timestamp",
  },
  {
    label: "fulfilled-publication-fixture",
    statement: "The versioned VOWMARK public proof fixture was published before maturity.",
    rule: "FULFILLED means the frozen versioned publication contains the exact fulfillment_time marker 2026-10-07T18:48:00Z, which is earlier than the recorded maturity timestamp.",
    url: process.env.VOWMARK_PROOF_URL || "https://raw.githubusercontent.com/Bibidee/vowmark/ce9121035c3bb7defae49abed8f0e487aa34ab3d/evidence/fulfilled-proof-fixture.txt",
    sourceKind: "VERSIONED_SOURCE",
    purpose: "versioned publication timestamp",
  },
  {
    label: "breached-candidate",
    statement: "The public evidence page contains the exact phrase VOWMARK-DOES-NOT-EXIST by maturity.",
    rule: "FULFILLED requires the exact phrase VOWMARK-DOES-NOT-EXIST to appear in the frozen page content; its absence is direct evidence of breach.",
    url: "https://example.com/",
    sourceKind: "PUBLICATION",
    purpose: "negative control page",
  },
  {
    label: "inconclusive",
    statement: "The commitment was fulfilled by maturity with a reliable time-bearing public proof.",
    rule: "The frozen page must contain an unambiguous, time-bearing signal proving fulfillment by the recorded maturity timestamp.",
    url: "https://vowmark-unavailable-proof.invalid/",
    sourceKind: "PUBLICATION",
    purpose: "unavailable evidence control",
  },
];
const selectedProof = {
  "fulfilled-rfc": allProofs[2],
  breached: allProofs[3],
  inconclusive: allProofs[4],
}[process.env.VOWMARK_PROOF_SET];
const proofs = selectedProof ? [selectedProof] : allProofs;

const results = [];
for (const proof of proofs) {
  const maturity = BigInt(Math.floor(Date.now() / 1000) + 300);
  const deadline = maturity + 7200n;
  const created = await write(client, VAULT, "create_commitment", [proof.statement, proof.rule, maturity, deadline, address(REMEDY), [proof.url], [proof.sourceKind], [proof.purpose]], BOND);
  const commitmentId = decodeReturn(created.receipt);
  if (commitmentId === undefined || commitmentId < 0n) throw new Error(`Issuance ${created.hash} returned no canonical commitment id`);
  let issuance = await read(client, VAULT, "get_issuance", [commitmentId]);
  if (!sameNumber(issuance.commitment_id, commitmentId) || issuance.issuer.toLowerCase() !== account.address.toLowerCase() || issuance.remedy.toLowerCase() !== REMEDY.toLowerCase() || issuance.statement !== proof.statement || issuance.verification_rule !== proof.rule || !sameNumber(issuance.maturity_at, maturity) || !sameNumber(issuance.final_review_deadline, deadline) || !sameNumber(issuance.bond, BOND)) throw new Error(`Vault issuance ${commitmentId} did not match the submitted terms`);
  await waitFor(client, `Registry registration #${commitmentId}`, async () => {
    try { return await read(client, REGISTRY, "get_commitment", [commitmentId]); } catch { return undefined; }
  });
  issuance = await read(client, VAULT, "get_issuance", [commitmentId]);
  await waitFor(client, `Maturity #${commitmentId}`, async () => Math.floor(Date.now() / 1000) >= Number(maturity) ? true : undefined, 120);
  const reviewed = await write(client, REGISTRY, "review_commitment", [commitmentId]);
  const commitment = await read(client, REGISTRY, "get_commitment", [commitmentId]);
  const reviews = await read(client, REGISTRY, "get_reviews", [commitmentId]);
  let vaultSettlement;
  if (commitment.outcome !== "OPEN") {
    vaultSettlement = await waitFor(client, `Vault settlement #${commitmentId}`, async () => {
      const settlement = await read(client, VAULT, "get_settlement", [commitmentId]);
      return settlement.settled ? settlement : undefined;
    });
    const reconciliation = await write(client, REGISTRY, "reconcile_settlement", [commitmentId]);
    const reconciledCommitment = await read(client, REGISTRY, "get_commitment", [commitmentId]);
    results.push({ label: proof.label, proof, commitmentId, maturity, deadline, createTx: created.hash, reviewTx: reviewed.hash, reconcileTx: reconciliation.hash, commitment: reconciledCommitment, reviews, issuance, vaultSettlement });
    continue;
  }
  results.push({ label: proof.label, proof, commitmentId, maturity, deadline, createTx: created.hash, reviewTx: reviewed.hash, commitment, reviews, issuance, vaultSettlement });
}

const fulfilled = results.find((item) => item.commitment?.outcome === "FULFILLED");
let withdrawal;
if (fulfilled?.commitment?.outcome === "FULFILLED") {
  const creditBefore = await read(client, VAULT, "get_credit", [account.address]);
  const withdrawalTx = await write(client, VAULT, "withdraw", [BOND]);
  const creditAfter = await read(client, VAULT, "get_credit", [account.address]);
  withdrawal = { withdrawalTx: withdrawalTx.hash, creditBefore, creditAfter };
}

const evidence = { generatedAt: new Date().toISOString(), network: "GenLayer Studionet", chainId: 61999, registry: REGISTRY, vault: VAULT, account: account.address, bond: BOND, deployment: { registryTx: process.env.VOWMARK_REGISTRY_DEPLOYMENT_TX || null, vaultTx: process.env.VOWMARK_VAULT_DEPLOYMENT_TX || null, wiringTx: process.env.VOWMARK_WIRING_TX || null }, results, withdrawal };
fs.mkdirSync(new URL("../../../evidence", import.meta.url), { recursive: true });
fs.writeFileSync(new URL(process.env.VOWMARK_EVIDENCE_FILE || "../../../evidence/live_lifecycle_latest.json", import.meta.url), json(evidence));
console.log(json(evidence));
