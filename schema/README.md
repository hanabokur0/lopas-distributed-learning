# Schemas

Machine-readable contracts for the public boundaries of `lopas-distributed-learning`.

These schemas intentionally describe data that crosses module or unit boundaries. Internal helper types remain TypeScript-only until they become interchange contracts.

## Input contracts

- `rii-basis.schema.json` — direct input to `assessRIIUpdate()`.
- `cross-unit-evidence-input.schema.json` — external evidence before normalization.

## Normalized / derived contracts

- `cross-unit-evidence.schema.json` — normalized evidence imported from another unit.
- `imported-pilot-binding.schema.json` — lineage/context carried into a local pilot.
- `local-outcome-evidence.schema.json` — local observed outcome plus historical/current replay snapshots.
- `rii-update-assessment.schema.json` — HCD/BFR/BU/OR update candidate and disposition.
- `receipt-envelope.schema.json` — portable, per-record hash-chained receipt envelope.
- `common.schema.json` — shared definitions used by the contracts above.

## Core invariants encoded here

1. Imported evidence never directly updates local RII.
2. `automatic_apply` is always `false`.
3. Remote evidence can become `PILOT` or `OBSERVE_MORE`, not an automatic local rule change.
4. Context similarity is bounded to `[0,1]` when present.
5. Unknown remains a first-class outcome.
6. Receipt integrity travels with each record through `prev_hash` and `record_sha256`.

## Authority

The TypeScript implementation is the execution reference.

These schemas are the interchange contract: they define the shapes that other units, AI systems, filesystems, Git-based transports, LAN services, or future adapters may exchange without importing the implementation itself.

## Format

Canonical schemas use JSON rather than YAML so relative `$ref` resolution works with standard/offline JSON Schema validators without requiring a YAML-aware reference loader. YAML remains suitable for examples and exchanged evidence documents.
