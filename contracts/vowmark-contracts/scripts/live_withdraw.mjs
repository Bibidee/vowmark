import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const VAULT = "0x921Ed9F83A89ED9aADD5A02fbDc818D1c244cE7e";
const REMEDY = "0x7eb2a4b4e913df62eae807ef60509b3b7284c7fa";
const AMOUNT = 100000000000000n;
const chain = {
  id: 61999,
  name: "GenLayer Studionet",
  rpcUrls: {default: {http: [RPC]}},
  nativeCurrency: {name: "GEN Token", symbol: "GEN", decimals: 18},
  consensusMainContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3,
};

function json(value) {
  return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:live-alice");
if (!privateKey) throw new Error("live-alice is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const client = createClient({chain, endpoint: RPC, account});
await client.initializeConsensusSmartContract();
const before = await client.readContract({address: VAULT, functionName: "get_credit", args: [REMEDY], stateStatus: TransactionStatus.FINALIZED});
const tx = await client.writeContract({address: VAULT, functionName: "withdraw", args: [AMOUNT], value: 0n});
const receipt = await client.waitForTransactionReceipt({hash: tx, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000});
const after = await client.readContract({address: VAULT, functionName: "get_credit", args: [REMEDY], stateStatus: TransactionStatus.FINALIZED});
console.log(json({account: account.address, recipient: REMEDY, before, tx, result: receipt.result_name, after}));
