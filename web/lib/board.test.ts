import assert from "node:assert/strict";
import { classifyCommitment, groupCommitments, type BoardCategory } from "./board";
import type { Commitment } from "./types";

const base: Commitment = {
  commitment_id: 1n,
  issuer: "0x1111111111111111111111111111111111111111",
  remedy: "0x2222222222222222222222222222222222222222",
  statement: "A visible promise",
  verification_rule: "The anchor proves the promise",
  created_at: 1n,
  maturity_at: 1_000n,
  final_review_deadline: 10_000n,
  bond: 1n,
  outcome: "OPEN",
  latest_verdict: "NONE",
  latest_snapshot_digest: "",
  latest_source_set_digest: "",
  attempt_count: 0n,
  last_attempt_at: 0n,
  review_epoch: 0n,
  review_epoch_attempts: 0n,
  late_review_attempts: 0n,
  settlement_state: "LOCKED",
  settlement_recipient: "",
  settlement_attempts: 0n,
  last_settlement_at: 0n,
  resolved_at: 0n,
};

function withFields(fields: Partial<Commitment>): Commitment { return { ...base, ...fields }; }

const now = 1_000n;
const cases: Array<[BoardCategory, Commitment]> = [
  ["UPCOMING", withFields({ commitment_id: 1n, maturity_at: 1_000_000n })],
  ["DUE_SOON", withFields({ commitment_id: 2n, maturity_at: 1_000n + 7n * 24n * 60n * 60n })],
  ["READY_FOR_REVIEW", withFields({ commitment_id: 3n, maturity_at: 900n })],
  ["INCONCLUSIVE_RETRYABLE", withFields({ commitment_id: 4n, maturity_at: 900n, latest_verdict: "INCONCLUSIVE" })],
  ["READY_TO_EXPIRE", withFields({ commitment_id: 5n, maturity_at: 900n, final_review_deadline: now })],
  ["RESOLVED", withFields({ commitment_id: 6n, outcome: "FULFILLED" })],
];

for (const [expected, commitment] of cases) assert.equal(classifyCommitment(commitment, now), expected);
const grouped = groupCommitments(cases.map(([, commitment]) => commitment), now);
assert.equal(Object.values(grouped).flat().length, cases.length);
assert.equal(new Set(Object.values(grouped).flat().map((item) => item.commitment_id.toString())).size, cases.length);
console.log(`board classification invariant passed (${cases.length} records, exactly one category each)`);
