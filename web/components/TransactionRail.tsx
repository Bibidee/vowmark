import { explorerTx, shortHash } from "@/lib/config";

export function TransactionRail({ hash, state = "Submitted" }: { hash?: string; state?: string }) {
  const normalized = state.toUpperCase();
  const finality = normalized.includes("FINAL") ? 3 : normalized.includes("SUBMIT") ? 1 : normalized.includes("ERROR") ? 0 : 2;
  return (
    <div className="rail transaction-rail">
      <h3>Transaction trace</h3>
      <div className="finality-steps" aria-label="Transaction finality stages"><span className={finality >= 1 ? "active" : ""}>01 SUBMITTED</span><span className={finality >= 2 ? "active" : ""}>02 ACCEPTED</span><span className={finality >= 3 ? "active" : ""}>03 FINALIZED</span></div>
      <div className="rail-row"><span>Protocol state</span><strong>{state}</strong></div>
      {hash ? <div className="rail-row"><span>Hash</span><a href={explorerTx(hash)} target="_blank" rel="noreferrer">{shortHash(hash)}</a></div> : <div className="rail-row"><span>Hash</span><span>Not submitted</span></div>}
      <p className="hint" style={{ margin: "14px 0 0" }}>ACCEPTED is provisional. Product outcomes are only shown after finality and canonical contract readback.</p>
    </div>
  );
}
