# Distributed Transfer

## Principle

The transfer rule is:

> Imported evidence is transferable evidence. Local outcome is learning evidence.

A remote unit may provide a mature protocol, a successful outcome, a failure, an unresolved case, context, and lineage. The receiving unit still has to determine whether the structure is meaningful under local conditions.

## Import pipeline

```text
CrossUnitEvidenceInput
        |
        v
normalizeCrossUnitEvidence()
        |
        v
CrossUnitEvidence
        |
        +--> Context Binding
        |
        +--> imported RII assessment
                 |
                 +--> PILOT
                 +--> OBSERVE_MORE
```

## Cross-unit evidence

Normalized evidence records:

- `source_unit`
- `local_unit`
- `protocol_ref`
- source context
- local context
- optional similarity
- local unknowns
- source outcome
- lineage

The normalized transferability block is intentionally restrictive:

```json
{
  "status": "remote_only",
  "local_verdict": "PILOT",
  "local_outcome_ref": null,
  "updates_local_rii": false
}
```

For remote `correct`, the receiving unit may produce `PILOT`.

For remote `premature`, `missed`, or `unknown`, the current implementation produces `OBSERVE_MORE` rather than execution authority.

## Context Binding

Context Binding carries the difference between “worked elsewhere” and “works here.”

Current fields include:

```text
local_unit
origin_unit
protocol_ref
similarity
local_unknowns
imported_context
local_context
```

`similarity` is bounded to `[0,1]` when present, but it is not a permission score. Even a similarity of `1.0` does not make imported evidence local evidence.

`local_unknowns` are intentionally preserved. They are conditions that may control transferability and should survive transport rather than being filled by assumption.

## Remote success

Remote success produces a transferable hypothesis:

```text
remote correct
      |
      v
possible transferable structure
      |
      v
pilot_locally
```

It does not produce:

```text
remote correct
      X
      v
local boundary mutation
```

## Remote failure

Remote failure is useful negative transfer evidence.

A remote premature outcome may suggest:

- the protocol's transfer conditions are narrower than reported,
- required discriminating evidence was missing,
- context matters more than the protocol description reveals.

A remote missed outcome may suggest incomplete branch coverage.

Neither establishes that the receiving unit's local boundary failed.

## Local pilot lineage

When a receiving unit accepts a remote success as pilot-ready, `ImportedPilotBinding` preserves:

- source evidence ID,
- protocol reference,
- origin unit,
- local unit,
- context binding,
- imported/local context,
- protocol lineage.

When that local pilot later produces a real local outcome, the outcome retains `source_evidence_id` and Context Binding.

The path therefore remains traceable:

```text
remote outcome
  -> cross-unit evidence
  -> local pilot
  -> local outcome
  -> local RII
```

## Transfer is not merge

A receiving unit may:

- test the protocol unchanged,
- fork it,
- partially reuse it,
- reject it,
- retain it as unknown,
- create a local variant and share that variant later.

The protocol does not require a global canonical branch.
