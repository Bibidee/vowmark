import { explorerTx, shortHash } from "@/lib/config";
import type { TransactionStage } from "@/lib/types";

const stageRank: Record<TransactionStage, number> = { IDLE: 0, SUBMITTED: 1, ACCEPTED: 2, FINALIZED: 3, ERROR: 0 };

export function TransactionRail({ hash, stage = "IDLE", detail }: { hash?: string; stage?: TransactionStage; detail?: string }) {
  const finality = stageRank[stage];
  return (
    <div className="rail transaction-rail">
      <h3>Transaction trace</h3>
      <div className={`finality-steps stage-${stage.toLowerCase()}`} aria-label="Transaction finality stages"><span className={finality >= 1 ? "active" : ""}>01 SUBMITTED</span><span className={finality >= 2 ? "active" : ""}>02 ACCEPTED</span><span className={finality >= 3 ? "active" : ""}>03 FINALIZED</span></div>
      <div className="rail-row"><span>Protocol state</span><strong>{detail || stage}</strong></div>
      {hash ? <div className="rail-row"><span>Hash</span><a href={explorerTx(hash)} target="_blank" rel="noreferrer">{shortHash(hash)}</a></div> : <div className="rail-row"><span>Hash</span><span>Not submitted</span></div>}
      <p className="hint" style={{ margin: "14px 0 0" }}>{stage === "ERROR" ? "Execution failed or canonical readback did not complete. FINALIZED is not claimed." : stage === "IDLE" ? "No transaction has been submitted." : "ACCEPTED is provisional. FINALIZED appears only after successful execution and the required canonical readback."}</p>
    </div>
  );
}
