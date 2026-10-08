import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = process.env.VOWMARK_REGISTRY_ADDRESS;
const VAULT = process.env.VOWMARK_VAULT_ADDRESS;
if (!REGISTRY || !VAULT) throw new Error("VOWMARK_REGISTRY_ADDRESS and VOWMARK_VAULT_ADDRESS are required");
const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };

function json(value) { return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2); }
function leader(receipt) {
  const raw = receipt.consensus_data?.leader_receipt;
  return Array.isArray(raw) ? raw[0] : raw;
}
function errorText(receipt) {
  const currentLeader = leader(receipt);
  const payload = currentLeader?.result?.payload;
  return String(currentLeader?.error || currentLeader?.genvm_result?.raw_error || currentLeader?.genvm_result?.error_description || (currentLeader?.result?.status === "rollback" ? payload : "") || "");
}
async function clientFor(name) {
  const privateKey = await keytar.getPassword("genlayer-cli", `account:${name}`);
  if (!privateKey) throw new Error(`${name} is not unlocked in the CLI keychain`);
  const account = createAccount(privateKey);
  const client = createClient({ chain, endpoint: RPC, account });
  await client.initializeConsensusSmartContract();
  return { account, client };
}
async function rejected(item, label) {
  const hash = await item.client.writeContract({ address: REGISTRY, functionName: "set_vault_address", args: [VAULT], value: 0n });
  const receipt = await item.client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  const leaderReceipt = leader(receipt);
  const status = String(receipt.status_name ?? receipt.status).toUpperCase();
  if (status !== TransactionStatus.FINALIZED && status !== "7") throw new Error(`${label} did not finalize: ${json(receipt)}`);
  if (!errorText(receipt)) throw new Error(`${label} unexpectedly succeeded: ${json(receipt)}`);
  return { label, hash, error: errorText(receipt), status: receipt.status_name ?? receipt.status };
}

const unauthorized = await clientFor("live-alice");
const deployer = await clientFor("thermo-sponsor");
const unauthorizedAttempt = await rejected(unauthorized, "unauthorized wiring attempt");
const immutableAttempt = await rejected(deployer, "second wiring attempt");
console.log(json({ registry: REGISTRY, vault: VAULT, unauthorizedAttempt, immutableAttempt }));
