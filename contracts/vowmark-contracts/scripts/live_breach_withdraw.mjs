import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { CalldataAddress, TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = "0x2590706b18a1385A23842bdEAe793EE4374a3bE4";
const VAULT = "0x921Ed9F83A89ED9aADD5A02fbDc818D1c244cE7e";
const REMEDY = "0x7eb2a4b4e913df62eae807ef60509b3b7284c7fa";
const BOND = 100000000000000n;
const chain = {
  id: 61999,
  name: "GenLayer Studionet",
  rpcUrls: {default: {http: [RPC]}},
  nativeCurrency: {name: "GEN Token", symbol: "GEN", decimals: 18},
  consensusMainContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3,
};

function addressArg(value) {
  return new CalldataAddress(Uint8Array.from(value.slice(2).match(/../g).map((pair) => parseInt(pair, 16))));
}
function json(value) {
  return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const client = createClient({chain, endpoint: RPC, account});
await client.initializeConsensusSmartContract();

const maturity = BigInt(Math.floor(Date.now() / 1000) + 15);
const deadline = maturity + 3600n;
const createTx = await client.writeContract({
  address: REGISTRY,
  functionName: "create_commitment",
  args: [
    "The public evidence page contains the exact phrase VOWMARK-DOES-NOT-EXIST by maturity.",
    "Fulfillment requires the exact phrase VOWMARK-DOES-NOT-EXIST to appear in the frozen page content; its absence is direct evidence of breach.",
    maturity,
    deadline,
    addressArg(REMEDY),
    ["https://example.com/"],
    ["PUBLICATION"],
    ["negative control page"],
  ],
  value: BOND,
});
const createReceipt = await client.waitForTransactionReceipt({hash: createTx, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000});
const total = await client.readContract({address: REGISTRY, functionName: "get_total_commitments", args: [], stateStatus: TransactionStatus.FINALIZED});
const commitmentId = BigInt(total) - 1n;
const reviewTx = await client.writeContract({address: REGISTRY, functionName: "review_commitment", args: [commitmentId], value: 0n});
const reviewReceipt = await client.waitForTransactionReceipt({hash: reviewTx, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000});
const commitment = await client.readContract({address: REGISTRY, functionName: "get_commitment", args: [commitmentId], stateStatus: TransactionStatus.FINALIZED});
const credit = await client.readContract({address: VAULT, functionName: "get_credit", args: [addressArg(REMEDY)], stateStatus: TransactionStatus.FINALIZED});

console.log(json({account: account.address, remedy: REMEDY, commitmentId, maturity, deadline, createTx, createResult: createReceipt.result_name, reviewTx, reviewResult: reviewReceipt.result_name, commitment, remedyCredit: credit}));
