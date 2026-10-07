import { readFileSync } from "fs";
import path from "path";
import {
  Address,
  CalldataEncodable,
  TransactionHash,
  TransactionStatus,
  GenLayerClient,
} from "genlayer-js/types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

async function waitFinal(client: GenLayerClient<any>, hash: TransactionHash) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    retries: 240,
  });
  const rawLeaderReceipt = receipt.consensus_data?.leader_receipt as unknown;
  const leaderReceipt = Array.isArray(rawLeaderReceipt)
    ? rawLeaderReceipt[0] as { execution_result?: string; error?: string | null } | undefined
    : rawLeaderReceipt as { execution_result?: string; error?: string | null } | undefined;
  const executionResult = leaderReceipt?.execution_result;
  if (!leaderReceipt || leaderReceipt.error || typeof executionResult !== "string" || !["SUCCESS", "FINISHED_WITH_RETURN"].includes(executionResult)) {
    throw new Error(`Finalized transaction did not execute successfully: ${JSON.stringify(receipt)}`);
  }
  return receipt;
}

export default async function main(client: GenLayerClient<any>) {
  await client.initializeConsensusSmartContract();

  const registryCode = new Uint8Array(readFileSync(path.resolve(process.cwd(), "contracts/vowmark_registry.py")));
  const registryTx = await client.deployContract({
    code: registryCode,
    args: [ZERO_ADDRESS as CalldataEncodable],
  });
  const registryReceipt = await waitFinal(client, registryTx as TransactionHash);
  const registryAddress = registryReceipt.data?.contract_address as Address | undefined;
  if (!registryAddress) throw new Error("Registry deployment returned no contract address");

  const vaultCode = new Uint8Array(readFileSync(path.resolve(process.cwd(), "contracts/vowmark_vault.py")));
  const vaultTx = await client.deployContract({
    code: vaultCode,
    args: [registryAddress as CalldataEncodable],
  });
  const vaultReceipt = await waitFinal(client, vaultTx as TransactionHash);
  const vaultAddress = vaultReceipt.data?.contract_address as Address | undefined;
  if (!vaultAddress) throw new Error("Vault deployment returned no contract address");

  const wireTx = await client.writeContract({
    address: registryAddress,
    functionName: "set_vault_address",
    args: [vaultAddress as CalldataEncodable],
    value: 0n,
  });
  const wireReceipt = await waitFinal(client, wireTx as TransactionHash);

  console.log(JSON.stringify({
    network: "GenLayer Studionet",
    chain_id: 61999,
    registry_address: registryAddress,
    vault_address: vaultAddress,
    registry_deployment_tx: registryTx,
    vault_deployment_tx: vaultTx,
    wiring_tx: wireTx,
    registry_final_receipt: registryReceipt,
    vault_final_receipt: vaultReceipt,
    wiring_final_receipt: wireReceipt,
  }, null, 2));
}
