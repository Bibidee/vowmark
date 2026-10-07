import { explorerTx, shortHash } from "@/lib/config";

export function TransactionRail({ hash, state = "Submitted" }: { hash?: string; state?: string }) {
  return (
    <div className="rail">
      <h3>Transaction rail</h3>
      <div className="rail-row"><span>Protocol state</span><strong>{state}</strong></div>
      {hash ? <div className="rail-row"><span>Hash</span><a href={explorerTx(hash)} target="_blank" rel="noreferrer">{shortHash(hash)}</a></div> : <div className="rail-row"><span>Hash</span><span>Not submitted</span></div>}
      <p className="hint" style={{ margin: "14px 0 0" }}>ACCEPTED is provisional. Product outcomes are only shown after finality and canonical contract readback.</p>
    </div>
  );
}
