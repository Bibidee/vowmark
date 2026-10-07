import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { CalldataAddress, TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = "0x2590706b18a1385A23842bdEAe793EE4374a3bE4";
const REMEDY = "0x1111111111111111111111111111111111111111";
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
const anchor = "https://api.github.com/repos/jonschlinkert/is-number/commits/b0ceb52a380b20221e5be749160aeb13bf3904d0";
const createTx = await client.writeContract({
  address: REGISTRY,
  functionName: "create_commitment",
  args: [
    "The frozen GitHub commit record identifies commit b0ceb52a380b20221e5be749160aeb13bf3904d0 with an author timestamp of 2018-06-15T23:04:04Z, before maturity.",
    "FULFILLED means the frozen GitHub API record contains the exact commit SHA and shows its author timestamp before the recorded maturity timestamp. No other condition is required.",
    maturity,
    deadline,
    addressArg(REMEDY),
    [anchor],
    ["THIRD_PARTY_RECORD"],
    ["Immutable commit timestamp"],
  ],
  value: BOND,
});
const createReceipt = await client.waitForTransactionReceipt({hash: createTx, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000});
const total = await client.readContract({address: REGISTRY, functionName: "get_total_commitments", args: [], stateStatus: TransactionStatus.FINALIZED});
const commitmentId = BigInt(total) - 1n;
const reviewTx = await client.writeContract({address: REGISTRY, functionName: "review_commitment", args: [commitmentId], value: 0n});
const reviewReceipt = await client.waitForTransactionReceipt({hash: reviewTx, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000});
const commitment = await client.readContract({address: REGISTRY, functionName: "get_commitment", args: [commitmentId], stateStatus: TransactionStatus.FINALIZED});
const reviews = await client.readContract({address: REGISTRY, functionName: "get_reviews", args: [commitmentId], stateStatus: TransactionStatus.FINALIZED});

console.log(json({account: account.address, commitmentId, maturity, deadline, createTx, createResult: createReceipt.result_name, reviewTx, reviewResult: reviewReceipt.result_name, commitment, reviews}));

