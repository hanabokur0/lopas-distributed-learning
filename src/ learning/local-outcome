import type { LocalOutcomeEvidence, RIIBasis, RIIUpdateAssessment } from "../types.js";
import { assessRIIUpdate } from "./rii.js";

export function assessLocalOutcome(evidence: LocalOutcomeEvidence): RIIUpdateAssessment {
  const basis: RIIBasis = {
    evidence_scope: "local",
    decision_was: evidence.decision_was,
    replay_changed:
      evidence.then.state !== evidence.now.state || evidence.then.target !== evidence.now.target,
    then: evidence.then,
    now: evidence.now,
    context_binding: evidence.context_binding,
  };
  return assessRIIUpdate(basis);
}
