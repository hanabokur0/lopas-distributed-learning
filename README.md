# LoPAS Distributed Learning

**Local learning. Asynchronous sharing. No forced global convergence.**

LoPAS Distributed Learning is a local-first protocol for exchanging learned decision structures across independent units without allowing remote evidence to automatically rewrite local decision boundaries.

The core principle is simple:

> **Do not synchronize conclusions. Synchronize the ability to inspect how conclusions were learned.**

A successful protocol from another place is not treated as a local truth.

It is treated as:

> **a better question for this place.**

---

## Status

Current release target:

```text
v0.1.1
```

This repository is an experimental protocol and reference implementation.

The current release focuses on:

- local RII learning
- cross-unit evidence exchange
- context binding
- local PILOT gating
- outcome-driven learning
- auditable receipts
- protocol lineage
- deterministic canonicalization
- executable safety invariants

This is not a production autonomous-learning system.

---

# Why this exists

Distributed systems often assume that successful knowledge should eventually converge.

That assumption is not always desirable.

Different regions, organizations, teams, environments, machines, or AI systems may operate under different:

- constraints
- thresholds
- histories
- contexts
- risks
- goals

A protocol that succeeds in one unit may fail in another.

Therefore:

```text
remote success != local truth
```

LoPAS Distributed Learning keeps learning local while allowing evidence to move.

The intended flow is:

```text
Unit A
  Observation
      ↓
  Decision
      ↓
  Outcome
      ↓
  Local learning
      ↓
  Mature protocol / evidence
      ↓
      ↓ asynchronous exchange
      ↓
Unit B
  Imported evidence
      ↓
  Context Binding
      ↓
  PILOT
      ↓
  Local outcome
      ↓
  Local RII
      ↓
  Local protocol update candidate
```

The important distinction is:

```text
evidence travels
authority does not
```

---

# Core invariants

The following rules are protocol-level invariants.

They should not be weakened casually.

## 1. RII remains local learning

RII describes learning from outcomes observed by the local unit.

Remote evidence does not directly become local learning.

```text
remote outcome
    ≠
local RII update
```

---

## 2. Imported evidence never directly updates local RII

Imported evidence always has:

```text
evidence_scope = imported
```

and must not directly authorize a local boundary update.

In particular:

```text
boundary_update_eligible = false
automatic_apply = false
```

---

## 3. Remote success becomes a PILOT candidate

A successful protocol observed elsewhere may justify local experimentation.

It does not justify automatic adoption.

```text
remote correct
    ↓
PILOT
    ↓
local execution
    ↓
local outcome
```

Only after a local outcome exists may local learning become eligible.

---

## 4. A local outcome is required before boundary learning

Imported success alone is insufficient.

The learning bridge is:

```text
Decision
    ↓
Outcome
    ↓
Replay
    ↓
RII update candidate
```

For imported protocols:

```text
Imported evidence
    ↓
PILOT
    ↓
Local outcome
    ↓
Local RII
```

---

## 5. Boundary changes are never automatically applied

Every RII update assessment keeps:

```text
automatic_apply = false
```

The system generates structured update candidates.

It does not silently rewrite decision boundaries.

---

## 6. Unknown is retained

Unknown evidence is not treated as failure.

```text
Unknown != Failed
```

When evidence is insufficient, the preferred action is:

```text
OBSERVE_MORE
```

rather than forcing an unsupported classification.

---

## 7. Context and lineage travel with evidence

Transferred evidence should preserve enough information to answer:

- where did this come from?
- under what context did it work?
- what protocol produced it?
- which prior receipt or Git state does it descend from?
- what local unknowns remain?

Evidence without provenance is weaker evidence.

---

# What is RII?

RII means:

**Reverse Inference Index**

It is used here as a structured method for reviewing a decision after an outcome becomes known.

RII is composed of four conceptual components:

```text
HCD — Hidden Cause Detection
BFR — Boundary Failure Recognition
BU  — Boundary Update
OR  — Outcome Reinterpretation
```

The conceptual formula is:

```text
RII =
  0.30 × HCD
+ 0.30 × BFR
+ 0.25 × BU
+ 0.15 × OR
```

The current repository does **not** automatically calculate or apply a global numeric RII score.

Instead, it produces structured RII update assessments.

Example:

```json
{
  "HCD": {
    "status": "candidate"
  },
  "BFR": {
    "status": "supported",
    "failure_mode": "premature_closure"
  },
  "BU": {
    "status": "candidate",
    "action": "review_tighten_boundary",
    "automatic_apply": false,
    "boundary_update_eligible": true
  },
  "OR": {
    "status": "supported"
  }
}
```

The repository deliberately separates:

```text
evidence
assessment
boundary eligibility
actual application
```

---

# Outcome classes

Local outcomes currently use four classes.

```text
correct
premature
missed
unknown
```

## correct

The previous decision was supported by the observed outcome.

Possible result:

```text
retain_boundary
```

If replay later disagrees with a previously correct decision, this may become a regression candidate.

---

## premature

The decision closed too early or acted before sufficient evidence existed.

Possible result:

```text
review_tighten_boundary
```

---

## missed

A relevant branch, route, or boundary was not recognized.

Possible result:

```text
review_expand_branch_or_boundary
```

---

## unknown

The observed result remains insufficient.

Possible result:

```text
observe_more
```

Unknown does not automatically become failure.

---

# Imported evidence behavior

Imported evidence is intentionally handled differently from local evidence.

## Imported correct outcome

A successful remote outcome may produce:

```text
pilot_locally
```

but:

```text
boundary_update_eligible = false
automatic_apply = false
```

---

## Imported premature or missed outcome

Negative remote evidence may be retained as transfer evidence.

It does not directly rewrite the local boundary.

Possible result:

```text
retain_external_evidence
```

---

## Imported unknown outcome

Unresolved external evidence remains unresolved.

Possible result:

```text
observe_more
```

---

# Architecture

The core implementation is intentionally small and dependency-light.

```text
src/
├─ learning/
│  ├─ rii.ts
│  └─ local-outcome.ts
│
├─ distributed/
│  ├─ evidence.ts
│  └─ pilot.ts
│
├─ receipts/
│  ├─ integrity.ts
│  └─ store.ts
│
├─ adapters/
│  └─ router.ts
│
├─ canonical.ts
├─ types.ts
└─ index.ts
```

---

## learning/

Contains local outcome and RII assessment logic.

Responsibilities include:

- interpreting local outcomes
- identifying possible boundary failures
- generating RII update candidates
- preserving Unknown Retention
- enforcing `automatic_apply = false`

---

## distributed/

Handles evidence that originated outside the current unit.

Responsibilities include:

- cross-unit evidence normalization
- context binding
- transferability state
- local PILOT gating
- imported evidence restrictions

Remote evidence cannot directly become local RII evidence.

---

## receipts/

Provides append-only receipt structures and integrity verification.

Responsibilities include:

- receipt envelopes
- previous-record chaining
- content hashing
- record hashing
- chain verification
- in-memory reference storage

---

## adapters/

Defines interfaces between this protocol and external decision systems.

The core does not require a specific AI model or router.

A compatible implementation can attach through a replayable decision adapter.

Possible external systems include:

```text
deterministic rules
AI model
RAG pipeline
agent
workflow engine
human decision process
```

The protocol is concerned with the evidence and learning boundary rather than the implementation of the original decision-maker.

---

# Replayable decision systems

A major design goal is to compare:

```text
what the system decided then
```

with:

```text
what the system would decide now
```

That enables:

```text
Decision
    ↓
Outcome
    ↓
Replay
    ↓
Difference
    ↓
RII update candidate
```

A previously correct decision that now replays differently may indicate a regression.

A previously missed route that now becomes visible may indicate successful learning.

---

# Cross-unit evidence

Cross-unit evidence records what happened in another unit without treating that result as local authority.

Example concept:

```json
{
  "kind": "cross_unit_evidence",
  "local_unit": "region-b",
  "source_unit": "region-a",
  "protocol_ref": "protocol-x@v1",
  "transferability": {
    "status": "remote_only",
    "local_verdict": "PILOT",
    "local_outcome_ref": null,
    "updates_local_rii": false
  }
}
```

The important field is:

```text
updates_local_rii = false
```

---

# Context Binding

Transferred protocols should not be evaluated independently of their environment.

Context Binding can include:

```text
origin unit
local unit
protocol reference
context similarity
source context
local context
local unknowns
```

Example:

```json
{
  "similarity": 0.67,
  "local_unknowns": [
    "cleanup_capacity",
    "rain_season"
  ]
}
```

Similarity is evidence for inspection.

It is not permission to bypass the PILOT stage.

---

# Local PILOT flow

A remote success can be transformed into a local pilot binding.

Conceptually:

```text
Cross-unit evidence
        ↓
Context Binding
        ↓
assertPilotAllowed()
        ↓
ImportedPilotBinding
        ↓
local execution
        ↓
LocalOutcomeEvidence
```

Only after this local outcome exists should the local RII path be evaluated.

---

# Receipts

The protocol uses receipts to preserve an auditable history of observations, evidence, decisions, outcomes, and learning assessments.

A receipt envelope contains:

```text
schema_version
receipt_id
recorded_at
kind
payload
integrity
```

Integrity currently separates three concepts.

## content_sha256

Identifies the content being recorded.

Conceptually:

```text
SHA256(
  canonical_json({
    kind,
    payload
  })
)
```

Two receipts containing the same semantic content may have the same:

```text
content_sha256
```

---

## receipt_id

Identifies a particular receipt event.

Two separate recordings of the same content should be allowed to have:

```text
same content_sha256
different receipt_id
```

---

## record_sha256

Identifies and protects the full receipt record.

It includes record-specific information such as:

```text
receipt_id
recorded_at
prev_hash
content_sha256
payload
```

This allows receipt records to form a chain.

---

# Receipt chain

Conceptually:

```text
genesis
   ↓
receipt A
record_sha256
   ↓
receipt B.prev_hash
   ↓
receipt B.record_sha256
   ↓
receipt C.prev_hash
```

If an earlier receipt changes, later verification should fail.

This is intended as lightweight tamper evidence.

It is not a blockchain and does not provide decentralized consensus.

---

# Canonicalization

Hashing requires deterministic serialization.

Objects are therefore canonicalized before hashing.

Equivalent objects with different key ordering should produce the same semantic representation.

Example:

```json
{
  "a": 1,
  "b": 2
}
```

and:

```json
{
  "b": 2,
  "a": 1
}
```

should canonicalize identically.

This is important for:

- stable evidence IDs
- content hashes
- receipt verification
- delayed/offline exchange

---

# Protocol lineage

Evidence may carry lineage such as:

```text
source receipt references
parent protocol references
source Git commit
source Git tag
source repository
```

This enables a protocol to answer:

```text
Where did this structure come from?
```

Git is particularly useful here.

A protocol may evolve like this:

```text
v0.1.0
   ↓
local observation
   ↓
outcome
   ↓
RII review
   ↓
commit
   ↓
fork
   ↓
local adaptation
   ↓
v0.1.1
```

Forks are not required to merge back.

Different units may legitimately preserve different descendants.

---

# Eventual resonance

This project does not require eventual consistency.

Instead, it explores:

> **eventual resonance**

Independent units may mature separately.

They may exchange evidence asynchronously.

Useful structures may be:

- copied
- tested
- rejected
- adapted
- forked
- rediscovered

without requiring every unit to converge to the same state.

Conceptually:

```text
local maturation
      ↓
delayed exchange
      ↓
local inspection
      ↓
PILOT / rejection / observation
      ↓
local outcome
      ↓
local fork
      ↓
possible re-sharing
```

The objective is not:

```text
one global answer
```

but:

```text
many inspectable local learning histories
that remain connectable
```

---

# Quick start

Install dependencies:

```bash
npm install
```

Run the complete local verification:

```bash
npm test
```

This should run:

```text
repository layout verification
TypeScript check
build
smoke tests
```

Individual commands are also available:

```bash
npm run verify:layout
npm run check
npm run build
npm run smoke
```

---

# Library usage

The current repository is a library core.

It does not currently expose the old experimental CLI interface.

Example imports may look like:

```typescript
import {
  normalizeCrossUnitEvidence,
  assessImportedEvidence,
  assertPilotAllowed,
  createImportedPilotBinding,
  MemoryReceiptStore,
} from "lopas-distributed-learning";
```

Example cross-unit evidence:

```typescript
const evidence = normalizeCrossUnitEvidence({
  framework: "example-framework",
  local_unit: "region-b",
  source_unit: "region-a",
  protocol_ref: "protocol-x@v1",

  context_binding: {
    similarity: 0.67,
    local_unknowns: [
      "local_condition_a",
      "local_condition_b"
    ]
  },

  source_outcome: {
    decision_was: "correct",
    what_happened:
      "The protocol produced a successful result in the source unit."
  }
});
```

Evaluate imported evidence:

```typescript
const assessment =
  assessImportedEvidence(evidence);
```

A successful remote result remains imported evidence.

It should therefore lead to a local pilot rather than a direct boundary update.

```typescript
assertPilotAllowed(evidence);

const pilot =
  createImportedPilotBinding(evidence);
```

Receipts may then be recorded:

```typescript
const store =
  new MemoryReceiptStore();

store.append(
  "cross_unit_evidence",
  evidence
);

store.append(
  "rii_update_candidate",
  assessment
);
```

---

# Schemas

Machine-readable protocol contracts live in:

```text
schemas/
```

Current schemas include:

```text
common.schema.json
rii-basis.schema.json
rii-update-assessment.schema.json
cross-unit-evidence-input.schema.json
cross-unit-evidence.schema.json
imported-pilot-binding.schema.json
local-outcome-evidence.schema.json
receipt-envelope.schema.json
```

Canonical schemas use JSON Schema Draft 2020-12.

JSON is used for canonical schema definitions because cross-file `$ref` resolution is simpler and more portable for offline validation.

YAML may still be used for human-authored protocol data in downstream applications.

---

# Examples

Reference examples live in:

```text
examples/
```

The examples demonstrate a complete transfer path:

```text
remote success
    ↓
cross-unit evidence
    ↓
imported RII assessment
    ↓
PILOT
    ↓
local outcome
    ↓
local RII
```

An intentional invalid example is also included:

```text
examples/invalid/
```

It attempts to make imported evidence directly eligible for a boundary update.

The schema must reject it.

This is deliberate.

---

# Tests and CI

The repository treats invariants as executable contracts.

## Core CI

```text
.github/workflows/ci.yml
```

Core CI verifies:

```text
repository layout
TypeScript
build
smoke tests
```

The repository-layout check is intended to detect packaging mistakes such as:

```text
leading whitespace in directory names
missing extensions
misplaced GitHub workflows
missing required files
```

---

## Contract CI

```text
.github/workflows/contracts.yml
```

Contract CI verifies:

- JSON syntax
- JSON Schema validity
- positive examples
- intentional invalid examples
- receipt content hashes
- receipt record hashes

A prohibited structure passing validation should fail CI.

---

# Repository layout

```text
lopas-distributed-learning/
├─ README.md
├─ LICENSE
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ SRC_NOTES.md
│
├─ src/
│  ├─ learning/
│  │  ├─ rii.ts
│  │  └─ local-outcome.ts
│  │
│  ├─ distributed/
│  │  ├─ evidence.ts
│  │  └─ pilot.ts
│  │
│  ├─ receipts/
│  │  ├─ integrity.ts
│  │  └─ store.ts
│  │
│  ├─ adapters/
│  │  └─ router.ts
│  │
│  ├─ canonical.ts
│  ├─ types.ts
│  └─ index.ts
│
├─ tests/
│  └─ smoke.mjs
│
├─ scripts/
│  └─ verify-layout.mjs
│
├─ schemas/
├─ examples/
├─ docs/
│
└─ .github/
   └─ workflows/
      ├─ ci.yml
      └─ contracts.yml
```

---

# Design principles

## Local first

Each unit learns primarily from its own observed outcomes.

---

## Share evidence, not authority

External success is evidence for evaluation.

It is not permission to overwrite local boundaries.

---

## Preserve uncertainty

Unknown states should survive until evidence becomes sufficient.

---

## Fork before forced merge

Different contexts may require different protocol descendants.

Divergence is not automatically failure.

---

## Generator != grader != gate != executor

A system that generates a decision does not automatically gain authority to:

- judge its correctness
- approve its own boundary change
- execute the resulting action

These roles should remain separable.

---

## Receipts before memory claims

A learning claim should preferably point to:

```text
decision
outcome
evidence
receipt
lineage
```

rather than depending only on narrative memory.

---

# Non-goals

This repository is not:

- federated neural-network training
- global model synchronization
- blockchain consensus
- autonomous self-modifying AI
- a universal decision engine
- a scientific proof of RII
- a centralized policy authority
- a production-grade distributed database

It is a protocol experiment and reference implementation for local-first, auditable distributed learning.

---

# Experimental status

RII and related LoPAS constructs are experimental.

They should currently be understood as:

```text
protocol design constructs
```

rather than externally validated scientific metrics.

The project is intended to make hypotheses inspectable and executable.

It does not claim that the current weights, categories, or learning rules are universally optimal.

---

# AI integration

AI systems may participate in this architecture, but AI is not required.

Possible roles include:

```text
observation extraction
candidate generation
decision replay
context comparison
uncertainty discovery
protocol explanation
```

AI output should remain distinguishable from:

```text
observed outcome
local evidence
boundary authority
execution authority
```

In particular:

```text
AI recommendation
    ≠
automatic_apply
```

---

# Security position

The current receipt hash chain provides tamper evidence.

It does not provide:

- identity authentication
- digital signatures
- Byzantine consensus
- secure distributed replication
- confidential storage

Future implementations may attach:

```text
signatures
key identities
Git signed commits
external timestamping
append-only storage
```

without changing the core local-learning rule.

---

# Git as protocol lineage

Git can act as a natural lineage layer.

Useful relationships include:

```text
receipt
    ↓
protocol candidate
    ↓
commit
    ↓
tag
    ↓
fork
    ↓
local outcome
    ↓
next candidate
```

A receipt may eventually reference:

```yaml
protocol:
  repository: hanabokur0/lopas-distributed-learning
  release: v0.1.1
  commit: <git-sha>
```

This makes the protocol state used by a decision inspectable later.

---

# Release lineage

## v0.1.0

Initial standalone public release.

Established the main design concepts:

- local RII
- imported evidence restrictions
- context binding
- PILOT-before-learning
- receipts
- eventual resonance

The initial public package also exposed repository-layout and documentation inconsistencies.

Those issues are retained as part of the project lineage rather than rewriting the release history.

---

## v0.1.1

Packaging and contract repair release.

Primary goals:

- align repository paths with the actual TypeScript imports
- activate GitHub Actions from the correct root path
- align README with the current library API
- add repository layout validation
- separate receipt event identity from content identity
- strengthen receipt contract validation

This release demonstrates the same outcome-review loop the repository is designed to model:

```text
release
    ↓
external review
    ↓
observed failure
    ↓
boundary failure recognition
    ↓
protocol repair
    ↓
new release
```

---

# Future directions

Possible future work includes:

## Cross-unit resonance aggregation

Observe whether the same protocol structure succeeds independently in multiple environments without converting those results into a global mandatory rule.

---

## Protocol promotion

Define explicit criteria for:

```text
candidate
→ pilot
→ locally validated
→ mature
→ shareable
```

---

## Offline exchange

Support:

```text
filesystem
LAN
Git bundles
NAS
delayed synchronization
```

for disconnected environments.

---

## Git-native lineage

Tie receipts, protocol versions, commits, forks, and release tags more directly together.

---

## Multi-unit replay

Compare historical decisions across multiple independent contexts while preserving local authority.

---

# Philosophy

The project does not assume that distributed intelligence should become one mind.

A different possibility is:

```text
many local systems
learning independently
sharing inspectable evidence
without surrendering local context
```

The goal is not perfect synchronization.

The goal is continued compatibility between independently evolving systems.

In short:

> **Local learning. Shared evidence. Inspectable lineage. No forced convergence.**

---

# License

MIT License.

See:

```text
LICENSE
```
