# VOWMARK Final Smoke Test Plan

This plan is prepared but not executed. It is for a separately authorized live
Studionet smoke test only.

1. Verify GenLayer Studionet chain `61999`.
2. Verify canonical Registry `0x3Be513bB6CAe652826A6092C0715AF39E7189c71` and Vault `0xf8D89f89aD160546780eD76Cd64C550d91bAf501`.
3. Connect the intended unlocked wallet.
4. Issue one small real commitment with a controlled, versioned evidence fixture.
5. Record the issue transaction hash.
6. Verify issue protocol finality and successful execution separately.
7. Read the finalized Vault issuance.
8. Read finalized Registry registration.
9. Verify the canonical commitment page.
10. Wait for maturity.
11. Request one review.
12. Record the review transaction hash.
13. Verify review protocol finality and successful execution separately.
14. Reread the canonical Registry outcome.
15. Verify the settlement recipient derived from the outcome.
16. Verify expected finalized Vault credit.
17. Perform a small withdrawal only if safe and separately authorized.
18. Verify withdrawal protocol finality and successful execution.
19. Record Vault credit before and after withdrawal.
20. Record recipient native balance before and after where supported, accounting for transaction fees before interpreting the delta.
21. Refresh/reload the frontend and confirm canonical state recovery.
22. Verify no duplicate transaction was created by reload or retry.
23. Archive all hashes, finalized receipts, reads, screenshots, and limitations.
24. Confirm `https://the-vowmark.vercel.app/` remains healthy and unchanged.

The final evidence must distinguish:

```text
protocol finality
execution success
canonical readback
internal credit movement
recipient balance movement
```

If the client cannot observe native balances, record exactly:
`RECIPIENT BALANCE VERIFICATION: TOOLING-LIMITED`.

No smoke-test transaction should be sent until separately authorized.
