const FORGOTTEN_KEY = "vowmark.wallet.forgotten.v1";

function forgottenWallets(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(FORGOTTEN_KEY) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export function isWalletForgotten(address: string): boolean {
  return forgottenWallets().includes(address.toLowerCase());
}

export function rememberWallet(address: string) {
  if (typeof window === "undefined") return;
  const next = forgottenWallets().filter((item) => item !== address.toLowerCase());
  window.localStorage.setItem(FORGOTTEN_KEY, JSON.stringify(next));
}

export function forgetWallet(address: string) {
  if (typeof window === "undefined") return;
  const lower = address.toLowerCase();
  const next = Array.from(new Set([...forgottenWallets(), lower]));
  window.localStorage.setItem(FORGOTTEN_KEY, JSON.stringify(next));
}
