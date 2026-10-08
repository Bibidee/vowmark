import type { Page } from "@playwright/test";

export const STUDIONET = "0xf22f";
export const DEFAULT_ACCOUNT = "0x1111111111111111111111111111111111111111";
export const DEFAULT_TX_HASH = `0x${"a".repeat(64)}`;
export const RETRY_TX_HASH = `0x${"b".repeat(64)}`;

type ProviderOptions = {
  accounts?: string[];
  chainId?: string;
  requestAccountsError?: { code: number; message: string };
  switchError?: { code: number; message: string };
  sendTransactionError?: { code: number; message: string };
  sendTransactionHash?: string;
};

export async function installMockProvider(page: Page, options: ProviderOptions = {}) {
  await page.addInitScript((config) => {
    const state = {
      accounts: config.accounts || [],
      chainId: config.chainId || "0x1",
      sendCount: 0,
    };
    const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    const emit = (event: string, ...args: unknown[]) => listeners.get(event)?.forEach((handler) => handler(...args));
    const provider = {
      request: async ({ method, params }: { method: string; params?: unknown[] }) => {
        if (method === "eth_accounts") return state.accounts;
        if (method === "eth_requestAccounts") {
          if (config.requestAccountsError) throw Object.assign(new Error(config.requestAccountsError.message), { code: config.requestAccountsError.code });
          return state.accounts;
        }
        if (method === "eth_chainId") return state.chainId;
        if (method === "wallet_switchEthereumChain") {
          if (config.switchError) throw Object.assign(new Error(config.switchError.message), { code: config.switchError.code });
          state.chainId = String((params?.[0] as { chainId?: string } | undefined)?.chainId || "0xf22f");
          emit("chainChanged", state.chainId);
          return null;
        }
        if (method === "wallet_addEthereumChain") {
          state.chainId = "0xf22f";
          emit("chainChanged", state.chainId);
          return null;
        }
        if (method === "eth_sendTransaction") {
          state.sendCount += 1;
          window.localStorage.setItem("vowmark.mock.retrySubmitted", "1");
          if (config.sendTransactionError) throw Object.assign(new Error(config.sendTransactionError.message), { code: config.sendTransactionError.code });
          return config.sendTransactionHash || "0x" + "a".repeat(64);
        }
        if (method === "eth_getTransactionCount") return "0x0";
        if (method === "eth_estimateGas") return "0x5208";
        if (method === "eth_gasPrice") return "0x1";
        if (method === "eth_call") return "0x";
        return "0x0";
      },
      on: (event: string, handler: (...args: unknown[]) => void) => {
        const handlers = listeners.get(event) || new Set<(...args: unknown[]) => void>();
        handlers.add(handler);
        listeners.set(event, handlers);
      },
      removeListener: (event: string, handler: (...args: unknown[]) => void) => listeners.get(event)?.delete(handler),
    };
    (window as Window & { ethereum?: unknown }).ethereum = provider;
    (window as Window & { __vowmarkMock?: unknown }).__vowmarkMock = {
      setAccounts: (accounts: string[]) => {
        state.accounts = accounts;
        emit("accountsChanged", accounts);
      },
      setChainId: (chainId: string) => {
        state.chainId = chainId;
        emit("chainChanged", chainId);
      },
      getSendCount: () => state.sendCount,
    };
  }, options);
}

export async function setMockAccounts(page: Page, accounts: string[]) {
  await page.evaluate((next) => {
    const mock = (window as Window & { __vowmarkMock?: { setAccounts: (value: string[]) => void } }).__vowmarkMock;
    mock?.setAccounts(next);
  }, accounts);
}

export async function getMockSendCount(page: Page) {
  return page.evaluate(() => {
    const mock = (window as Window & { __vowmarkMock?: { getSendCount: () => number } }).__vowmarkMock;
    return mock?.getSendCount() || 0;
  });
}
