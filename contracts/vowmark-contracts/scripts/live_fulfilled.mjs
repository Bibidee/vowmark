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
const createTx = await client.writeContract({
  address: REGISTRY,
  functionName: "create_commitment",
  args: [
    "The RFC Editor publication records show RFC 9110 was published in June 2022, a time-bearing fact before maturity.",
    "A conclusive FULFILLED result is warranted when both frozen RFC Editor records explicitly identify RFC 9110 and its June 2022 publication date; that historical date is before the recorded maturity timestamp, so do not require a 2026 event.",
    maturity,
    deadline,
    addressArg(REMEDY),
    ["https://www.rfc-editor.org/rfc/rfc9110.html", "https://www.rfc-editor.org/rfc/rfc9110.txt"],
    ["PUBLICATION", "PUBLICATION"],
    ["HTML publication date", "text publication date"],
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
