import fs from "node:fs";
import keytar from "keytar";
import { createAccount, createClient } from "genlayer-js";

const RPC = "https://studio.genlayer.com/api";
const chain = {
  id: 61999,
  name: "GenLayer Studionet",
  rpcUrls: { default: { http: [RPC] } },
  nativeCurrency: { name: "GEN Token", symbol: "GEN", decimals: 18 },
  consensusMainContract: null,
  defaultNumberOfInitialValidators: 5,
  defaultConsensusMaxRotations: 3,
};

const privateKey = await keytar.getPassword("genlayer-cli", "account:thermo-sponsor");
if (!privateKey) throw new Error("thermo-sponsor is not unlocked in the CLI keychain");
const client = createClient({ chain, endpoint: RPC, account: createAccount(privateKey) });
await client.initializeConsensusSmartContract();
for (const name of ["vowmark_registry.py", "vowmark_vault.py"]) {
  const code = new Uint8Array(fs.readFileSync(new URL(`../contracts/${name}`, import.meta.url)));
  const schema = await client.getContractSchemaForCode(code);
  console.log(JSON.stringify({ name, schema }, null, 2));
}
