import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const registry = process.env.VOWMARK_REGISTRY_ADDRESS;
const vault = process.env.VOWMARK_VAULT_ADDRESS;
if (!registry || !vault) throw new Error("VOWMARK_REGISTRY_ADDRESS and VOWMARK_VAULT_ADDRESS are required");
const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };
const client = createClient({ chain, endpoint: RPC });
const read = (address, functionName, args = []) => client.readContract({ address, functionName, args, stateStatus: TransactionStatus.FINALIZED });
const plain = (value) => value instanceof Map ? Object.fromEntries(value) : value;
const registryConfig = plain(await read(registry, "get_config"));
const vaultRegistry = String(await read(vault, "get_registry"));
const withdrawalPolicy = plain(await read(vault, "get_withdrawal_policy"));
const next = BigInt(await read(vault, "get_next_commitment_id"));
const items = [];
const wallets = new Set([process.env.VOWMARK_ISSUER_ADDRESS, process.env.VOWMARK_REMEDY_ADDRESS].filter(Boolean));
let lockedBondWei = 0n;
for (let id = 0n; id < next; id += 1n) {
  const commitment = plain(await read(registry, "get_commitment", [id]));
  const issuance = plain(await read(vault, "get_issuance", [id]));
  const settlement = plain(await read(vault, "get_settlement", [id]));
  wallets.add(String(issuance.issuer));
  wallets.add(String(issuance.remedy));
  if (!settlement.settled) lockedBondWei += BigInt(issuance.bond);
  items.push({ id: String(id), issuer: String(issuance.issuer), remedy: String(issuance.remedy), bondWei: String(issuance.bond), outcome: commitment.outcome, verdict: commitment.latest_verdict, deadline: String(commitment.final_review_deadline), registrySettlement: { state: commitment.settlement_state, recipient: commitment.settlement_recipient, attempts: String(commitment.settlement_attempts), lastAttemptAt: String(commitment.last_settlement_at) }, vaultSettlement: settlement, registered: issuance.registered });
}
const response = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [vault, "latest"] }) });
const balanceResult = await response.json();
const credits = {};
const rejectionReasons = {};
let outstandingCreditWei = 0n;
for (const address of wallets) {
  const credit = BigInt(await read(vault, "get_credit", [address]));
  credits[address] = String(credit);
  outstandingCreditWei += credit;
  const rejectionReason = String(await read(vault, "get_last_rejection_reason", [address]));
  if (rejectionReason) rejectionReasons[address] = rejectionReason;
}
console.log(JSON.stringify({ time: new Date().toISOString(), registry, vault, wiring: { registryVault: registryConfig.vault_address, vaultRegistry }, registryConfig, withdrawalPolicy, next: String(next), vaultBalanceWei: balanceResult.result ? String(BigInt(balanceResult.result)) : null, balanceError: balanceResult.error || null, lockedBondWei: String(lockedBondWei), outstandingCreditWei: String(outstandingCreditWei), accountedLiabilitiesWei: String(lockedBondWei + outstandingCreditWei), credits, rejectionReasons, items }, null, 2));
