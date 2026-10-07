import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { CalldataAddress, TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const REGISTRY = "0x2590706b18a1385A23842bdEAe793EE4374a3bE4";
const VAULT = "0x921Ed9F83A89ED9aADD5A02fbDc818D1c244cE7e";
const ISSUER = "0x794678AD7e8B6c87dAb33303a3A512c821e6De9A";
const REMEDY = "0x1111111111111111111111111111111111111111";
const BOND = 100000000000000n;

const chain = {
  id: 61999,
  name: "GenLayer Studionet",
  rpcUrls: {default: {http: [RPC]}},
  nativeCurrency: {name: "GEN Token", symbol: "GEN", decimals: 18},
  blockExplorers: {default: {name: "GenLayer Explorer", url: "https://explorer-studio.genlayer.com"}},
  testnet: true,
  consensusMainContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3,
};

function addressArg(value) {
  const bytes = Uint8Array.from(value.slice(2).match(/../g).map((pair) => parseInt(pair, 16)));
  return new CalldataAddress(bytes);
}

async function waitFinal(client, hash) {
  return client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    retries: 240,
    interval: 5000,
  });
}

async function write(client, functionName, args, value = 0n) {
  const hash = await client.writeContract({
    address: REGISTRY,
    functionName,
    args,
    value,
  });
  const receipt = await waitFinal(client, hash);
  const leaderReceipt = receipt.consensus_data?.leader_receipt;
  const result = Array.isArray(leaderReceipt)
    ? leaderReceipt[0]?.execution_result
    : leaderReceipt?.execution_result;
  if (result && result !== "SUCCESS" && result !== "FINISHED_WITH_RETURN") {
    throw new Error(`${functionName} failed: ${JSON.stringify(receipt)}`);
  }
  return {hash, receipt};
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");

const account = createAccount(privateKey);
const client = createClient({chain, endpoint: RPC, account});
await client.initializeConsensusSmartContract();

const proofs = [
  {
    label: "fulfilled-candidate",
    statement: `The VOWMARK Registry contract ${REGISTRY} is deployed on GenLayer Studionet.`,
    rule: "The exact public explorer record must show this address as a deployed contract on chain 61999 before maturity.",
    url: `https://explorer-studio.genlayer.com/address/${REGISTRY}`,
    sourceKind: "ONCHAIN_RECORD",
    purpose: "public deployment record",
  },
  {
    label: "breached-candidate",
    statement: "The public evidence page contains the exact phrase VOWMARK-DOES-NOT-EXIST by maturity.",
    rule: "Fulfillment requires the exact phrase VOWMARK-DOES-NOT-EXIST to appear in the frozen page content; its absence is direct evidence of breach.",
    url: "https://example.com/",
    sourceKind: "PUBLICATION",
    purpose: "negative control page",
  },
  {
    label: "inconclusive-candidate",
    statement: "The commitment was fulfilled by maturity with a reliable time-bearing public proof.",
    rule: "The frozen page must contain an unambiguous, time-bearing signal proving fulfillment by the recorded maturity timestamp.",
    url: "https://example.com/",
    sourceKind: "PUBLICATION",
    purpose: "missing temporal evidence control",
  },
];

const created = [];
for (const proof of proofs) {
  const now = Math.floor(Date.now() / 1000);
  const maturity = BigInt(now + 15);
  const deadline = maturity + 3600n;
  const result = await write(
    client,
    "create_commitment",
    [
      proof.statement,
      proof.rule,
      maturity,
      deadline,
      addressArg(REMEDY),
      [proof.url],
      [proof.sourceKind],
      [proof.purpose],
    ],
    BOND,
  );
  const commitmentId = await client.readContract({
    address: REGISTRY,
    functionName: "get_total_commitments",
    args: [],
    stateStatus: TransactionStatus.FINALIZED,
  });
  created.push({
    ...proof,
    commitmentId: BigInt(commitmentId) - 1n,
    maturity,
    deadline,
    createTx: result.hash,
  });
}

for (const proof of created) {
  const result = await write(client, "review_commitment", [proof.commitmentId]);
  proof.reviewTx = result.hash;
  proof.commitment = await client.readContract({
    address: REGISTRY,
    functionName: "get_commitment",
    args: [proof.commitmentId],
    stateStatus: TransactionStatus.FINALIZED,
  });
  proof.reviews = await client.readContract({
    address: REGISTRY,
    functionName: "get_reviews",
    args: [proof.commitmentId],
    stateStatus: TransactionStatus.FINALIZED,
  });
}

const credit = await client.readContract({
  address: VAULT,
  functionName: "get_credit",
  args: [addressArg(ISSUER)],
  stateStatus: TransactionStatus.FINALIZED,
});

console.log(JSON.stringify({account: account.address, bond: BOND.toString(), proofs: created, issuerCredit: credit}, (_, value) => typeof value === "bigint" ? value.toString() : value, 2));
