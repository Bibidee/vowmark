import type { Outcome, Verdict } from "@/lib/types";

export function StatusBadge({ value }: { value: Outcome | Verdict | "PROVISIONAL" }) {
  const label = value.replaceAll("_", " ");
  const className = value === "FULFILLED" ? "status-fulfilled" : value === "BREACHED" ? "status-breached" : value === "EXPIRED_UNRESOLVED" ? "status-expired" : value === "PROVISIONAL" ? "status-provisional" : value === "INCONCLUSIVE" ? "status-inconclusive" : "status-open";
  return <span className={`status ${className}`}>{label}</span>;
}
