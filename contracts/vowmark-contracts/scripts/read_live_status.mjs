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
const next = BigInt(await read(vault, "get_next_commitment_id"));
const items = [];
for (let id = 0n; id < next; id += 1n) {
  const commitment = plain(await read(registry, "get_commitment", [id]));
  const issuance = plain(await read(vault, "get_issuance", [id]));
  const settlement = plain(await read(vault, "get_settlement", [id]));
  items.push({ id: String(id), outcome: commitment.outcome, verdict: commitment.latest_verdict, deadline: String(commitment.final_review_deadline), settlementState: commitment.settlement_state, registered: issuance.registered, settled: settlement.settled });
}
const response = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [vault, "latest"] }) });
const balanceResult = await response.json();
const credits = {};
for (const address of [process.env.VOWMARK_ISSUER_ADDRESS, process.env.VOWMARK_REMEDY_ADDRESS]) {
  if (address) credits[address] = String(await read(vault, "get_credit", [address]));
}
console.log(JSON.stringify({ time: new Date().toISOString(), registry, vault, next: String(next), vaultBalanceWei: balanceResult.result ? String(BigInt(balanceResult.result)) : null, balanceError: balanceResult.error || null, credits, items }, null, 2));
