# src v0.1 notes

This starter refactors the v0.3 Router Receipt implementation into a domain-agnostic distributed-learning core.

## Invariants

1. RII remains local learning.
2. Imported evidence never directly updates local RII.
3. Remote success may only become a local PILOT candidate.
4. A local outcome is required before a boundary update can become eligible.
5. `automatic_apply` is always false.
6. Unknown is retained rather than converted into failure.
7. Protocol lineage and context travel with imported evidence.

## Structural change from v0.3

The deterministic Coordinate Router is no longer the core dependency. It is represented through `ReplayableDecisionAdapter`, so Gemini, Claude, OpenAI models, deterministic routers, or other replayable decision systems can attach their own decision layer.

The core is dependency-free. Persistence is behind `ReceiptStore`, with `MemoryReceiptStore` as the reference implementation. Filesystem/Git/LAN adapters can be added without changing RII or distributed-transfer semantics.

The receipt integrity layer uses per-record `record_sha256` chaining instead of a whole-file prefix hash. This makes individual receipts portable and verifiable during delayed/offline exchange.
