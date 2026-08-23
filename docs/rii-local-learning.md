# RII as Local Learning

## Principle

RII is treated here as **post-decision local learning**.

A unit may learn from what happened after its own decision. Another unit's outcome can inform what this unit should investigate, but it cannot by itself prove that this unit's decision boundary is wrong.

This distinction is encoded by:

```text
evidence_scope = local | imported
```

## RII components

The current implementation produces update candidates for four components.

### HCD — Hidden Cause Detection

What hidden condition may explain the observed result?

HCD is represented as candidate causes plus supporting evidence. It is not treated as proof that a hidden cause has been established.

### BFR — Boundary Failure Recognition

Did a local decision boundary fail, and if so, how?

Current failure modes are:

- `none_observed`
- `premature_closure`
- `missed_branch_or_boundary`
- `unresolved`

Imported evidence cannot establish a local BFR failure because the failure occurred under another unit's context.

### BU — Boundary Update

What local change should be considered?

Current actions include:

- `retain_boundary`
- `protect_previous_boundary`
- `review_tighten_boundary`
- `review_expand_branch_or_boundary`
- `observe_more`
- `pilot_locally`
- `retain_external_evidence`

Two fields are safety-critical:

```json
{
  "automatic_apply": false,
  "boundary_update_eligible": false
}
```

`automatic_apply` is always false in the current protocol.

`boundary_update_eligible` may become true only when local evidence supports a reviewable local change.

### OR — Outcome Reinterpretation

How should the original decision be re-read after reality is observed?

OR is especially important when replay differs from the historically validated decision. A newer rule or model is not automatically better simply because it is newer.

## Local outcome classes

The current core uses four outcome classes.

| Outcome | Meaning for learning |
|---|---|
| `correct` | The historical local decision was supported by observed reality. |
| `premature` | The system closed or routed before sufficient discriminating evidence was available. |
| `missed` | A relevant branch, candidate, condition, or boundary was absent or underweighted. |
| `unknown` | Evidence remains insufficient; preserve uncertainty. |

`unknown` is a first-class result, not a synonym for failure.

## Replay

A local outcome is evaluated against two decision snapshots:

```text
then = historical decision
now  = decision produced by the current replayable decision system
```

This creates four useful situations.

### Correct + same replay

The historical boundary remains supported.

```text
action = retain_boundary
```

### Correct + changed replay

The current system disagrees with a decision that reality previously supported.

```text
action = protect_previous_boundary
```

This is treated as a possible regression and sent to review.

### Premature

The system closed too early.

```text
action = review_tighten_boundary
boundary_update_eligible = true
```

Eligibility means “review may consider a local change,” not “apply the change.”

### Missed

The system lacked a relevant branch, candidate, condition, or boundary.

```text
action = review_expand_branch_or_boundary
boundary_update_eligible = true
```

### Unknown

The system retains uncertainty.

```text
action = observe_more
boundary_update_eligible = false
```

## Why the aggregate score remains null

The current implementation deliberately returns:

```json
{
  "aggregate_rii_score_update": null
}
```

One outcome is evidence about one decision episode. It is not automatically sufficient to recalibrate a global RII score.

A future calibration layer may aggregate repeated evidence, but that should be versioned separately from the per-case learning protocol.
