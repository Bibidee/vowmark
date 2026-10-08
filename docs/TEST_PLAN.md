# VOWMARK Verification Matrix

The final suite should emphasize invariants and adversarial behavior, not vanity test count.

## Creation and immutability

1. create valid commitment with one anchor
2. create valid commitment with five anchors
3. zero bond rejected
4. zero/issuer remedy address rejected
5. malformed remedy address rejected
6. empty/oversized commitment rejected
7. empty/oversized verification rule rejected
8. maturity not in future rejected
9. review deadline not after maturity rejected
10. inadequate review window rejected if the final design enforces a minimum
11. zero evidence anchors rejected
12. more than maximum anchors rejected
13. duplicate normalized URL rejected
14. non-HTTPS rejected
15. localhost/loopback/private host rejected as far as practical
16. unsupported source kind rejected
17. terms immutable after issuance
18. evidence anchors immutable after issuance
19. remedy address immutable after issuance
20. exact value/bond accounting on creation

## Authorization and lifecycle

21. review before maturity rejected
22. review after final deadline rejected
23. review after fulfilled rejected
24. review after breached rejected
25. expire before final deadline rejected
26. expire after deadline succeeds only if unresolved
27. anyone may trigger allowed review
28. anyone may trigger allowed expiry
29. unauthorized caller cannot redirect settlement
30. no admin override path

## Evidence and judgment

31. accessible durable evidence proving timely completion -> fulfilled
32. accessible evidence proving late completion/non-fulfillment -> breached
33. unavailable source -> inconclusive, not breach
34. contradictory sources -> inconclusive where unresolved
35. stale source -> inconclusive where timing cannot be established
36. mutable page with no reliable timestamp does not prove timely fulfillment
37. malformed response -> safe inconclusive or protocol failure, never fabricated positive
38. oversized response not silently truncated into approval
39. prompt injection inside evidence ignored
40. embedded secondary URL not automatically followed
41. validator snapshot mismatch prevents false conclusive state
42. malformed model output never defaults to fulfilled/breached
43. unknown verdict token rejected
44. explanations do not override consensus-critical verdict
45. repeated identical snapshot does not create unbounded duplicate history
46. retry after inconclusive obeys cooldown
47. new changed snapshot can be reviewed when retry is legal

Review-history scalability requirement: the Registry exposes a separate count and bounded newest-first pages. Every page is capped at 25 records, and the frontend must request older pages explicitly rather than loading an unbounded array.

## Outcome and economics

48. fulfilled credits exactly bond amount to issuer
49. breached credits exactly bond amount to remedy address
50. inconclusive does not credit either party
51. expired unresolved credits exactly bond amount to issuer
52. one bond resolves once
53. conclusive review cannot be economically applied twice
54. withdrawal cannot exceed credit
55. double withdrawal rejected
56. debit occurs before external value send
57. multiple commitments remain accounting-isolated
58. aggregate locked + credited balance invariant holds
59. model never chooses wei amount
60. model never chooses settlement recipient

The supported withdrawal boundary is a direct EOA caller: sender and origin must match, the finalized credit is debited before the external transfer, and no arbitrary contract-recipient recovery guarantee is claimed.

## GenLayer protocol/finality

61. submitted hash captured immediately
62. accepted shown provisional
63. accepted with runtime/execution failure does not show product success
64. protocol undetermined does not create VOWMARK inconclusive
65. finalized review rereads canonical state
66. settlement/credit finality boundary proven on Studionet
67. if finalized-only vault is used, non-registry settlement call rejected
68. duplicate finalized settlement message rejected
69. child/finalized settlement transaction verified final before UI says fully settled

## Frontend

70. MetaMask/injected wallet connect
71. Rabby/injected wallet connect where available
72. disconnect/in-app disconnected state
73. account change reflected
74. wrong network disables writes
75. switch/add Studionet guidance
76. signature rejection handled
77. submission error handled
78. refresh during pending recovers exact hash
79. refresh after final reads contract state
80. returning visitor can open commitment without localStorage
81. issuer page reconstructs from chain state
82. activity page never overrides canonical state
83. responsive phone/tablet/desktop
84. keyboard navigation and labels
85. status meaning not color-only

## Originality/adversarial review

86. no buyer/seller/deal/delivery/jury/dispute product flow
87. no copied reference routes or page hierarchy
88. no copied reference visual identity
89. no hidden backend
90. no centralized AI endpoint
91. no server wallet
92. no fake transaction/finality/demo state in production
93. no stale 61997/Studio-dev source configuration
94. no unverified deployment or explorer claim in docs
