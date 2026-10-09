import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const hash = process.env.VOWMARK_TX_HASH;
if (!hash) throw new Error("VOWMARK_TX_HASH is required");
const RPC = "https://studio.genlayer.com/api";
const chain = { ...studionet, rpcUrls: { ...studionet.rpcUrls, default: { http: [RPC] } } };
const client = createClient({ chain, endpoint: RPC });
const tx = await client.getTransaction({ hash });
const leader = Array.isArray(tx.consensus_data?.leader_receipt) ? tx.consensus_data.leader_receipt[0] : tx.consensus_data?.leader_receipt;
const models = (tx.consensus_data?.leader_receipt || []).map((receipt) => ({ mode: receipt.mode, model: receipt.node_config?.primary_model?.model, executionResult: receipt.execution_result, error: receipt.error, genvmError: receipt.genvm_result?.raw_error || receipt.genvm_result?.error_description }));
console.log(JSON.stringify({ hash, status: tx.statusName ?? tx.status_name ?? tx.status, result: tx.result, from: tx.from_address, to: tx.to_address, value: tx.value, calldata: tx.data?.calldata?.readable, votes: tx.consensus_data?.votes, leader: { executionResult: leader?.execution_result, error: leader?.error, genvm: leader?.genvm_result, result: leader?.result, pendingTransactions: leader?.pending_transactions }, models }, (_, value) => typeof value === "bigint" ? value.toString() : value, 2));
