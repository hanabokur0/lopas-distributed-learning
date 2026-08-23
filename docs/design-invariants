# Design Invariants

These invariants are the behavioral core of `lopas-distributed-learning`.

An implementation may change storage, transport, model provider, user interface, language, or deployment topology without violating them.

## I1 — RII learning remains local

A unit's RII learning evidence comes from outcomes observed by that unit.

```text
remote outcome != local outcome
```

## I2 — Imported evidence cannot directly update local RII

For imported evidence:

```text
boundary_update_eligible = false
```

This remains true even when the remote outcome is `correct`.

## I3 — Remote success may become a local PILOT

The strongest current transfer verdict for remote success is:

```text
PILOT
```

not `EXECUTE`, not automatic adoption, and not boundary mutation.

## I4 — A local outcome is required before local BU can become eligible

The path is:

```text
imported evidence
-> local pilot
-> local outcome
-> local RII
-> possible BU eligibility
```

## I5 — Automatic boundary application is forbidden

Every current BU assessment carries:

```text
automatic_apply = false
```

An external policy layer may review a candidate, but auto-mutation is outside this core.

## I6 — Unknown is retained

`unknown` is not converted into `missed`, `premature`, or another failure class merely to force closure.

```text
unknown -> observe_more / retain
```

## I7 — Context travels with imported evidence

Imported evidence should preserve enough Context Binding to make transfer assumptions inspectable.

At minimum, the current interchange contracts preserve unit identity, protocol reference, source/local contexts, local unknowns, and optional similarity.

## I8 — Lineage survives transfer

A local pilot derived from imported evidence should retain its source evidence and protocol lineage so that a later local outcome can be traced back to the imported hypothesis.

## I9 — Newer is not automatically better

If a historical local decision was `correct` but replay changes under the current system, the protocol treats the difference as a possible regression:

```text
correct historical outcome
+ changed replay
-> review
```

## I10 — Aggregate RII mutation is not inferred from a single case

Current assessments return:

```text
aggregate_rii_score_update = null
```

Per-case evidence and score calibration are separate responsibilities.

## I11 — Receipt integrity is local and portable

Each receipt carries its own `record_sha256` and previous-record reference.

This supports delayed/offline exchange without requiring a single always-online ledger.

## I12 — Decision engines are replaceable

The learning core must not require one router or one model vendor.

Decision systems attach through a replayable adapter or compatible interchange data.

## Change policy

A change that violates one of these invariants is not a refactor. It changes the protocol semantics and should therefore:

1. be explicitly documented,
2. receive a new protocol version,
3. include updated schemas,
4. include updated positive and negative examples,
5. include tests demonstrating the new rule,
6. explain migration behavior for old receipts and evidence.
