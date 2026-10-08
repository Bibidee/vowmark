/**
 * Small, dependency-free helpers for the separately authorized live smoke test.
 * They deliberately record protocol finality, execution, credit movement, and
 * native-balance observations as separate facts.
 */

function text(value) {
  return value === undefined || value === null ? null : String(value);
}

export function leaderReceipt(receipt) {
  const raw = receipt?.consensus_data?.leader_receipt;
  return Array.isArray(raw) ? raw[0] : raw;
}

export function summarizeFinalizedReceipt(receipt) {
  const leader = leaderReceipt(receipt);
  const result = leader?.result && typeof leader.result === "object" ? leader.result : undefined;
  return {
    protocolStatus: text(receipt?.status_name ?? receipt?.status),
    executionResult: text(leader?.execution_result),
    leaderError: leader?.error ?? null,
    decodedStatus: text(result?.status),
  };
}

export async function observeNativeBalance(client, address) {
  if (!client || typeof client.getBalance !== "function") {
    return {
      status: "TOOLING-LIMITED",
      value: null,
      reason: "The configured GenLayer client does not expose getBalance.",
    };
  }
  try {
    const value = await client.getBalance({ address });
    return { status: "OBSERVED", value: text(value), reason: null };
  } catch (error) {
    return {
      status: "TOOLING-LIMITED",
      value: null,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function observedBalanceDelta(before, after) {
  if (before?.status !== "OBSERVED" || after?.status !== "OBSERVED") return null;
  try {
    return (BigInt(after.value) - BigInt(before.value)).toString();
  } catch {
    return null;
  }
}

export function buildWithdrawalEvidence({
  recipient,
  amount,
  creditBefore,
  creditAfter,
  withdrawalTx,
  receipt,
  recipientBalanceBefore,
  recipientBalanceAfter,
}) {
  const balanceDelta = observedBalanceDelta(recipientBalanceBefore, recipientBalanceAfter);
  return {
    recipient,
    amount: text(amount),
    creditBefore: text(creditBefore),
    creditAfter: text(creditAfter),
    withdrawalTx,
    finalizedReceipt: summarizeFinalizedReceipt(receipt),
    recipientBalanceBefore,
    recipientBalanceAfter,
    balanceDelta,
    recipientBalanceVerification:
      balanceDelta === null ? "RECIPIENT BALANCE VERIFICATION: TOOLING-LIMITED" : "OBSERVED",
    feeInterpretation:
      "The recipient balance delta may include the withdrawal transaction fee when the recipient is also the sender; do not treat it as exact received value without fee semantics.",
  };
}
