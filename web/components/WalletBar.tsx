"use client";

import { useEffect, useState } from "react";
import { addOrSwitchStudionet, connectWallet, getProvider, getWalletState } from "@/lib/genlayer";
import { NETWORK, shortAddress } from "@/lib/config";
import { forgetWallet, isWalletForgotten } from "@/lib/wallet";

export function WalletBar() {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const state = await getWalletState();
      setAddress(state.address); setChainId(state.chainId);
    } catch { /* disconnected state is expected */ }
  }

  useEffect(() => {
    refresh();
    let provider: ReturnType<typeof getProvider> | undefined;
    const onAccounts = (accounts: unknown) => {
      const next = String((accounts as string[])[0] || "");
      setAddress(next && !isWalletForgotten(next) ? next : "");
    };
    const onChain = (next: unknown) => setChainId(String(next));
    try {
      provider = getProvider();
      provider.on?.("accountsChanged", onAccounts);
      provider.on?.("chainChanged", onChain);
    } catch { /* no injected wallet */ }
    return () => { provider?.removeListener?.("accountsChanged", onAccounts); provider?.removeListener?.("chainChanged", onChain); };
  }, []);

  async function connect() {
    setError("");
    try { const state = await connectWallet(); setAddress(state.address); setChainId(state.chainId); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet connection failed"); }
  }

  async function switchNetwork() {
    setError("");
    try { await addOrSwitchStudionet(); setChainId(NETWORK.hexId); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Network switch failed"); }
  }

  function forget() {
    if (!address) return;
    forgetWallet(address);
    setAddress("");
    setChainId("");
    setError("");
  }

  const wrongNetwork = Boolean(address) && chainId.toLowerCase() !== NETWORK.hexId;
  return (
    <div className="wallet-wrap">
      {wrongNetwork ? <button className="wallet-button secondary" onClick={switchNetwork}>Switch to Studionet</button> : null}
      {error ? <span className="network-warning" title={error}>Wallet error</span> : null}
      {!address ? <button className="wallet-button" onClick={connect}>Connect wallet</button> : <><span title={address}>{shortAddress(address)}</span><button className="wallet-button secondary forget-wallet" onClick={forget} title="Forget this wallet in VOWMARK">Forget</button><span className="wallet-note">VOWMARK-only disconnect</span></>}
    </div>
  );
}
