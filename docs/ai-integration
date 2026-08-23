# AI Integration

## Goal

Reasoning systems should be able to use `lopas-distributed-learning` without having to internalize the entire LoPAS repository or adopt a specific model vendor.

The integration surface is therefore intentionally small and explicit.

## Two integration modes

### 1. Implementation integration

A TypeScript or JavaScript system can import the core directly.

Useful public operations include:

- `assessRIIUpdate()`
- `assessLocalOutcome()`
- `normalizeCrossUnitEvidence()`
- `assessImportedEvidence()`
- `createImportedPilotBinding()`
- receipt sealing / verification

### 2. Contract-only integration

A model or external service does not need to execute the TypeScript implementation if it can produce and consume data matching `schemas/`.

This is important for:

- Gemini-based reasoning pipelines,
- Claude-based workflows,
- OpenAI-based workflows,
- local models,
- deterministic routers,
- non-TypeScript services,
- offline agents exchanging files.

## Decision adapter

The core expects a replayable decision layer rather than a specific model API.

```ts
interface ReplayableDecisionAdapter<TObservation> {
  framework: string;
  version: string;
  decide(observation: TObservation): DecisionSnapshot;
}
```

A model-backed adapter should make replay conditions as explicit as possible.

For deterministic routers, replay is naturally reproducible.

For probabilistic models, the adapter may need to record additional provenance outside the minimal core, for example:

- model identifier,
- prompt / system instruction version,
- temperature or decoding configuration,
- tool configuration,
- retrieval snapshot,
- policy version.

The current core does not define these fields as mandatory because model-specific provenance is adapter-level data.

## Reasoning rule for imported evidence

A reasoning model should follow this sequence:

```text
1. Identify evidence scope.
2. If imported, inspect Context Binding.
3. Preserve local unknowns.
4. Do not infer local BFR from remote outcome.
5. Do not make BU directly eligible.
6. Remote correct -> consider local PILOT.
7. Remote premature/missed/unknown -> OBSERVE_MORE or retain external evidence.
8. Wait for a local outcome.
9. Convert that local outcome into local RII evidence.
```

The critical transition is:

```text
imported evidence
    != local learning

imported evidence
    -> local pilot
    -> local outcome
    -> local learning
```

## Why schemas matter for reasoning models

README prose explains intent, but schemas remove ambiguity about fields and forbidden states.

For example, a conforming implementation cannot treat imported evidence as a direct local boundary update if it respects the interchange contract.

The repository therefore gives a model several levels of guidance:

```text
README / docs -> semantic intent
schemas       -> allowed data states
src           -> executable reference
examples      -> valid reasoning paths
tests         -> invariants that must remain true
```

## Recommended repository-reading strategy for an AI

When asked to evaluate or extend this protocol:

1. Read `README.md` for project scope.
2. Read `docs/design-invariants.md` before proposing behavior changes.
3. Read the relevant schema for exact data shape.
4. Read the matching example path.
5. Inspect `src/` only for executable semantics needed by the task.
6. Use tests to distinguish intentional behavior from incidental prose.

This reduces the chance that a model will flatten historical context, imported evidence, and local evidence into one undifferentiated confidence score.

## Suggested system-level instruction

A downstream reasoning harness may use a compact instruction such as:

```text
Treat local and imported evidence as different epistemic scopes.
Never convert imported evidence directly into a local boundary update.
Remote success may generate a local pilot hypothesis only.
Only locally observed outcomes can make local BU review eligible.
Preserve Unknown as unresolved evidence.
Never auto-apply a boundary update.
```

This is a convenience instruction. The schemas and executable core remain the stronger contract.
