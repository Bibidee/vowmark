import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";
import { TransactionStatus } from "genlayer-js/types";

const RPC = "https://studio.genlayer.com/api";
const ZERO = "0x0000000000000000000000000000000000000000";
const chain = {
  id: 61999,
  name: "GenLayer Studionet",
  rpcUrls: { default: { http: [RPC] } },
  nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
  blockExplorers: { default: { name: "GenLayer Explorer", url: "https://explorer-studio.genlayer.com" } },
  testnet: true,
  consensusMainContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3,
};

function json(value) { return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2); }
function plain(value) {
  if (value instanceof Map) return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [key, plain(item)]));
  if (Array.isArray(value)) return value.map(plain);
  return value;
}

async function waitFinal(client, hash) {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 240, interval: 5000 });
  const rawLeader = receipt.consensus_data?.leader_receipt;
  const leader = Array.isArray(rawLeader) ? rawLeader[0] : rawLeader;
  const decodedStatus = leader?.result && typeof leader.result === "object" ? leader.result.status : undefined;
  if (receipt.status !== TransactionStatus.FINALIZED || !leader || leader.error != null || leader.execution_result !== "SUCCESS" || (decodedStatus !== undefined && decodedStatus !== "return")) {
    throw new Error(`Finalized transaction did not execute successfully: ${json(receipt)}`);
  }
  return receipt;
}

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const account = createAccount(privateKey);
const client = createClient({ chain, endpoint: RPC, account });
await client.initializeConsensusSmartContract();

const registryTx = await client.deployContract({ code: new Uint8Array(fs.readFileSync("contracts/vowmark_registry.py")), args: [ZERO] });
const registryReceipt = await waitFinal(client, registryTx);
const registry = registryReceipt.data?.contract_address || registryReceipt.txDataDecoded?.contractAddress;
if (!registry) throw new Error(`Registry deployment returned no address: ${json(registryReceipt)}`);

const vaultTx = await client.deployContract({ code: new Uint8Array(fs.readFileSync("contracts/vowmark_vault.py")), args: [registry] });
const vaultReceipt = await waitFinal(client, vaultTx);
const vault = vaultReceipt.data?.contract_address || vaultReceipt.txDataDecoded?.contractAddress;
if (!vault) throw new Error(`Vault deployment returned no address: ${json(vaultReceipt)}`);

const wiringTx = await client.writeContract({ address: registry, functionName: "set_vault_address", args: [vault], value: 0n });
const wiringReceipt = await waitFinal(client, wiringTx);

const registryConfig = plain(await client.readContract({ address: registry, functionName: "get_config", args: [], stateStatus: TransactionStatus.FINALIZED }));
const vaultRegistry = await client.readContract({ address: vault, functionName: "get_registry", args: [], stateStatus: TransactionStatus.FINALIZED });
if (registryConfig.vault_address?.toLowerCase() !== vault.toLowerCase() || String(registryConfig.review_cooldown_scope) !== "per_reviewer" || String(vaultRegistry).toLowerCase() !== registry.toLowerCase()) {
  throw new Error(`Fresh deployment wiring/config readback failed: ${json({ registryConfig, vaultRegistry })}`);
}
console.log(json({ network: "GenLayer Studionet", chain_id: 61999, account: account.address, registry, vault, registryTx, vaultTx, wiringTx, registryConfig, vaultRegistry, registryReceipt, vaultReceipt, wiringReceipt }));
