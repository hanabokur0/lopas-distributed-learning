# Receipts and Lineage

## Why receipts exist

Learning from outcomes requires more than the current rule set.

The system must be able to ask:

> What did this unit decide at that time, under which protocol and context?

A receipt is an auditable record of an event or derived learning object.

## Receipt envelope

The current portable envelope contains:

```text
schema_version
receipt_id
recorded_at
kind
payload
integrity.prev_hash
integrity.record_sha256
```

The receipt hash is calculated from canonical JSON of the unsigned record, where the integrity object contains only `prev_hash`.

```text
record_sha256 = SHA256(canonical_json(unsigned_receipt))
```

## Why each record carries its own hash

Earlier whole-file prefix hashing is less suitable for delayed/offline exchange because a single receipt is hard to move and verify independently.

Per-record hashing makes a receipt portable:

```text
Receipt N
  prev_hash      -> hash of Receipt N-1
  record_sha256  -> hash of Receipt N itself
```

A receiver can verify both record integrity and chain order when the relevant chain segment is available.

## Canonicalization

Object keys are sorted recursively before hashing.

This avoids accidental differences caused only by property insertion order.

Canonicalization is also used for stable IDs such as cross-unit evidence IDs and receipt IDs.

## What the current chain does and does not prove

The current hash chain detects accidental or unauthorized mutation **within the chain data being verified**.

It does not by itself provide:

- a trusted timestamp authority,
- public anchoring,
- digital signatures,
- author identity verification,
- Byzantine consensus,
- proof that the recorded real-world outcome is truthful.

Those are separate trust layers.

## Storage abstraction

`ReceiptStore` intentionally separates persistence from learning semantics.

Possible implementations include:

- in-memory storage,
- local filesystem,
- SQLite,
- Git repository,
- NAS / LAN service,
- object storage,
- removable media,
- delayed synchronization bundles.

The reference `MemoryReceiptStore` verifies the chain before appending.

## Protocol lineage

Cross-unit evidence may carry:

```text
source_receipt_refs
parent_protocol_refs
source_git_commit
source_git_tag
source_repository
```

This allows a receiver to distinguish:

```text
Protocol X as described today
```

from:

```text
Protocol X at the exact version that produced the imported outcome
```

## Git as lineage, not authority

Git is useful because it provides:

- commit identity,
- diffs,
- branches,
- forks,
- tags,
- release points,
- local-first operation.

But Git does not decide which protocol is correct.

A possible lineage is:

```text
commit A
  protocol x@v1
      |
      +--> local outcome: premature
      |
      +--> RII candidate: tighten boundary
      |
commit B
  protocol x@v2
```

Another unit may fork commit A or B independently.

## Delayed exchange

A future transport may exchange a portable bundle such as:

```text
bundle/
  protocol/
  context/
  receipts/
  schemas/
  lineage.json
```

The core does not currently mandate a bundle format. The important rule is that evidence, context, and lineage should remain linked when crossing units.
