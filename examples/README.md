# Examples

These examples form one coherent distributed-learning story and are intended to be read in numerical order.

The central invariant is:

```text
remote outcome -> imported evidence -> local PILOT -> local outcome -> local RII
```

Remote evidence can change a local **question**, but it cannot directly change a local decision boundary.

## Walkthrough

| File | Schema | Purpose |
|---|---|---|
| `01-local-premature-rii-basis.json` | `rii-basis.schema.json` | A purely local decision was judged premature. |
| `02-local-premature-rii-assessment.json` | `rii-update-assessment.schema.json` | Local evidence may make a boundary update eligible, but `automatic_apply` remains false. |
| `03-imported-success-input.json` | `cross-unit-evidence-input.schema.json` | River Town B receives a successful protocol from Coastal Town A. |
| `04-cross-unit-evidence-normalized.json` | `cross-unit-evidence.schema.json` | The remote result is normalized as portable cross-unit evidence. |
| `05-imported-success-rii-basis.json` | `rii-basis.schema.json` | The external success is evaluated with `evidence_scope=imported`. |
| `06-imported-success-rii-assessment.json` | `rii-update-assessment.schema.json` | Imported success produces `pilot_locally`, never direct BU. |
| `07-imported-pilot-binding.json` | `imported-pilot-binding.schema.json` | Lineage and context are attached to the local pilot. |
| `08-local-outcome-after-imported-pilot.json` | `local-outcome-evidence.schema.json` | The local unit records its own real-world outcome. |
| `09-local-rii-basis-after-pilot.json` | `rii-basis.schema.json` | Only now does the evidence scope become local. |
| `10-local-rii-assessment-after-pilot.json` | `rii-update-assessment.schema.json` | Local RII may now retain/review a local boundary. |
| `11-local-unknown-rii-basis.json` | `rii-basis.schema.json` | A local unresolved case. |
| `12-local-unknown-rii-assessment.json` | `rii-update-assessment.schema.json` | Unknown is retained rather than converted into failure. |
| `13-receipt-envelope-cross-unit.json` | `receipt-envelope.schema.json` | Portable receipt with a valid per-record SHA-256. |
| `invalid/imported-direct-boundary-update.INVALID.json` | should FAIL `rii-update-assessment.schema.json` | Demonstrates the forbidden imported -> direct BU path. |

## The distributed-learning path

```text
Coastal Town A
  successful local protocol
          |
          v
03 imported input
          |
          v
04 cross-unit evidence
          |
          v
05/06 imported RII assessment
          |
          +---- boundary_update_eligible = false
          |
          v
07 local PILOT binding
          |
          v
08 River Town B local outcome
          |
          v
09/10 local RII
          |
          +---- boundary_update_eligible may now be true
```

This is the distinction the repository is designed to preserve:

```text
Imported evidence is transferable evidence.
Local outcome is learning evidence.
```

## Receipt integrity

`13-receipt-envelope-cross-unit.json` is sealed using the same rule as `src/receipts/integrity.ts`:

```text
record_sha256 = SHA256(canonical_json(unsigned_receipt))
```

where `unsigned_receipt.integrity` contains only `prev_hash`.

Current example hash:

```text
107eccfbce9ed2059b36687d2be3c2e06c24d31ec2c16dd8100ae98bcdb0a7e4
```

## Invalid example

The file under `invalid/` deliberately sets:

```json
{
  "evidence_scope": "imported",
  "BU": {
    "boundary_update_eligible": true
  }
}
```

A conforming validator must reject it.

The failure is intentional: another unit's success is not permission to mutate this unit's boundary.
