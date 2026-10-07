import { createClient } from "genlayer-js";
import type { Address, CalldataEncodable, GenLayerTransaction, TransactionHash } from "genlayer-js/types";
import { TransactionStatus } from "genlayer-js/types";
import { NETWORK, REGISTRY_ADDRESS, VAULT_ADDRESS } from "@/lib/config";

type RequestArguments = { method: string; params?: unknown[] };
export type InjectedProvider = {
  request: (args: RequestArguments) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: InjectedProvider;
  }
}

const chain = {
  id: NETWORK.id,
  name: NETWORK.name,
  nativeCurrency: NETWORK.nativeCurrency,
  rpcUrls: { default: { http: [NETWORK.rpcUrl] } },
} as never;
type GLClient = ReturnType<typeof createClient>;

function requireRegistry() {
  if (!REGISTRY_ADDRESS) {
    throw new Error("VOWMARK registry address is not configured yet.");
  }
  return REGISTRY_ADDRESS as `0x${string}`;
}

function requireVault() {
  if (!VAULT_ADDRESS) throw new Error("VOWMARK vault address is not configured yet.");
  return VAULT_ADDRESS as `0x${string}`;
}

export function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet was found. Install MetaMask or Rabby.");
  }
  return window.ethereum;
}

export async function getWalletState() {
  const provider = getProvider();
  const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
  const chainId = String(await provider.request({ method: "eth_chainId" }));
  return { address: accounts[0] || "", chainId, isCorrectNetwork: chainId.toLowerCase() === NETWORK.hexId };
}

export async function connectWallet() {
  const provider = getProvider();
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  const chainId = String(await provider.request({ method: "eth_chainId" }));
  return { address: accounts[0] || "", chainId, isCorrectNetwork: chainId.toLowerCase() === NETWORK.hexId };
}

export async function addOrSwitchStudionet() {
  const provider = getProvider();
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: NETWORK.hexId }] });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: NETWORK.hexId,
        chainName: NETWORK.name,
        nativeCurrency: NETWORK.nativeCurrency,
        rpcUrls: [NETWORK.rpcUrl],
        blockExplorerUrls: [NETWORK.explorerUrl],
      }],
    });
  }
}

export function readClient() {
  return createClient({ chain }) as GLClient;
}

export function writeClient(address: string) {
  return createClient({ chain, account: address as `0x${string}` }) as GLClient;
}

export async function readRegistry(functionName: string, args: unknown[] = []) {
  return readClient().readContract({ address: requireRegistry() as Address, functionName, args: args as CalldataEncodable[], stateStatus: TransactionStatus.FINALIZED });
}

export async function readVault(functionName: string, args: unknown[] = []) {
  return readClient().readContract({ address: requireVault() as Address, functionName, args: args as CalldataEncodable[], stateStatus: TransactionStatus.FINALIZED });
}

export async function writeRegistry(address: string, functionName: string, args: unknown[], value?: bigint) {
  const client = writeClient(address);
  return client.writeContract({ address: requireRegistry() as Address, functionName, args: args as CalldataEncodable[], value: value ?? 0n });
}

export async function writeVault(address: string, functionName: string, args: unknown[], value?: bigint) {
  const client = writeClient(address);
  return client.writeContract({ address: requireVault() as Address, functionName, args: args as CalldataEncodable[], value: value ?? 0n });
}

export async function waitForFinality(hash: string) {
  const receipt = await readClient().waitForTransactionReceipt({ hash: hash as TransactionHash, status: TransactionStatus.FINALIZED, retries: 200 });
  const rawLeaderReceipt = receipt.consensus_data?.leader_receipt as unknown;
  const leaderReceipt = Array.isArray(rawLeaderReceipt) ? rawLeaderReceipt[0] as { execution_result?: string; error?: string | null } : rawLeaderReceipt as { execution_result?: string; error?: string | null } | undefined;
  const executionResult = leaderReceipt?.execution_result;
  const executionError = leaderReceipt?.error;
  if (!leaderReceipt || executionError || typeof executionResult !== "string" || !["SUCCESS", "FINISHED_WITH_RETURN"].includes(executionResult)) {
    throw new Error(`Finalized transaction did not execute successfully${executionError ? `: ${executionError}` : "."}`);
  }
  return receipt;
}

export async function getTransaction(hash: string): Promise<GenLayerTransaction | null> {
  return readClient().getTransaction({ hash: hash as TransactionHash });
}
