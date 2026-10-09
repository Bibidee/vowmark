import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const registry = process.env.VOWMARK_REGISTRY_ADDRESS;
const vault = process.env.VOWMARK_VAULT_ADDRESS;
const remedy = process.env.VOWMARK_REMEDY_ADDRESS;
if (!registry || !vault || !remedy) throw new Error("VOWMARK_REGISTRY_ADDRESS, VOWMARK_VAULT_ADDRESS, and VOWMARK_REMEDY_ADDRESS are required");

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };
const client = createClient({ chain, endpoint: RPC, account });
const BOND = 100000000000000n;
const REJECTED = (1n << 256n) - 1n;

function decodeInteger(bytes) {
  let value = 0n; let shift = 0n; let index = 0;
  while (index < bytes.length) { const byte = bytes[index++]; value |= BigInt(byte & 0x7f) << shift; if ((byte & 0x80) === 0) break; shift += 7n; }
  if (index === 0 || (bytes[index - 1] & 0x80) !== 0) return undefined;
  const type = Number(value & 0x7n); const magnitude = value >> 3n;
  return type === 1 ? magnitude : type === 2 ? -1n - magnitude : undefined;
}
function decodeReturn(leader) {
  const result = leader?.result;
  if (result && typeof result === "object" && result.status === "return") {
    const readable = result.payload?.readable;
    if (typeof readable === "string" && /^-?\d+$/.test(readable.trim())) return BigInt(readable.trim());
    if (Array.isArray(result.payload?.raw)) return decodeInteger(Uint8Array.from(result.payload.raw));
  }
  return undefined;
}
async function read(functionName, args = []) {
  return client.readContract({ address: vault, functionName, args, stateStatus: TransactionStatus.FINALIZED });
}
async function finalized(hash) {
  return client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
}

const config = await client.readContract({ address: registry, functionName: "get_config", args: [], stateStatus: TransactionStatus.FINALIZED });
const configuredVault = config instanceof Map ? config.get("vault_address") : config.vault_address;
if (String(configuredVault).toLowerCase() !== vault.toLowerCase()) throw new Error("Registry/Vault wiring mismatch");
const nextBefore = await client.readContract({ address: vault, functionName: "get_next_commitment_id", args: [], stateStatus: TransactionStatus.FINALIZED });
const creditBefore = await read("get_credit", [account.address]);
const now = Math.floor(Date.now() / 1000);
const maturity = BigInt(now + 300);
const deadline = maturity + 1200n;
const url = "https://127.1/vowmark-v4-url-rejection";
const hash = await client.writeContract({
  address: vault,
  functionName: "create_commitment",
  args: [
    "The public evidence URL must pass V4 host validation.",
    "The frozen public page must show an unambiguous timestamp before maturity.",
    maturity,
    deadline,
    remedy,
    [url],
    ["PUBLICATION"],
    ["shortened numeric-IP rejection control"],
  ],
  value: BOND,
});
console.log(JSON.stringify({ stage: "submitted", hash, url }));
const receipt = await finalized(hash);
const leader = Array.isArray(receipt.consensus_data?.leader_receipt) ? receipt.consensus_data.leader_receipt[0] : receipt.consensus_data?.leader_receipt;
const returned = decodeReturn(leader);
const nextAfter = await read("get_next_commitment_id");
const creditAfterRejection = await read("get_credit", [account.address]);
const reason = await read("get_last_rejection_reason", [account.address]);
const status = String(receipt.status_name ?? receipt.status).toUpperCase();
if (!((status === TransactionStatus.FINALIZED || status === "7") && leader?.execution_result === "SUCCESS" && returned === REJECTED && String(nextBefore) === String(nextAfter) && BigInt(creditAfterRejection) === BigInt(creditBefore) + BOND && String(reason).includes("evidence URL host is not public"))) throw new Error("Recoverable URL rejection was not proven");
const withdrawalHash = await client.writeContract({ address: vault, functionName: "withdraw", args: [BOND], value: 0n });
const withdrawalReceipt = await finalized(withdrawalHash);
const withdrawalLeader = Array.isArray(withdrawalReceipt.consensus_data?.leader_receipt) ? withdrawalReceipt.consensus_data.leader_receipt[0] : withdrawalReceipt.consensus_data?.leader_receipt;
const creditAfterWithdrawal = await read("get_credit", [account.address]);
const evidence = { network: "GenLayer Studionet", chainId: 61999, registry, vault, account: account.address, hash, withdrawalHash, url, status, executionResult: leader?.execution_result, returned: String(returned), reason, nextBefore: String(nextBefore), nextAfter: String(nextAfter), creditBefore: String(creditBefore), creditAfterRejection: String(creditAfterRejection), creditAfterWithdrawal: String(creditAfterWithdrawal), withdrawalStatus: withdrawalReceipt.status_name ?? withdrawalReceipt.status, withdrawalExecutionResult: withdrawalLeader?.execution_result };
console.log(JSON.stringify(evidence, null, 2));
if (!(withdrawalLeader?.execution_result === "SUCCESS" && BigInt(creditAfterWithdrawal) === BigInt(creditBefore))) throw new Error("Rejected-value withdrawal was not proven");
