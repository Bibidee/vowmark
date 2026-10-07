export const NETWORK = {
  id: 61999,
  hexId: "0xf22f",
  name: "GenLayer Studionet",
  rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api",
  explorerUrl:
    process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || "https://explorer-studio.genlayer.com",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
} as const;

export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS || "";
export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS || "";

export function explorerTx(hash: string) {
  return `${NETWORK.explorerUrl}/tx/${hash}`;
}

export function explorerAddress(address: string) {
  return `${NETWORK.explorerUrl}/address/${address}`;
}

export function shortAddress(address?: string) {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function shortHash(hash?: string) {
  if (!hash) return "—";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

export function parseGen(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{0,18})?$/.test(trimmed)) throw new Error("Enter a valid GEN amount");
  const [whole, fraction = ""] = trimmed.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0"));
}

export function formatGen(value: bigint | string | number): string {
  const raw = typeof value === "bigint" ? value : BigInt(value || 0);
  const whole = raw / 10n ** 18n;
  const fraction = (raw % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction} GEN` : `${whole} GEN`;
}
