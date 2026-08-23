import { stableId } from "../canonical.js";
import type {
  ContextBinding,
  CrossUnitEvidence,
  CrossUnitEvidenceInput,
  RIIBasis,
  RIIUpdateAssessment,
} from "../types.js";
import { assessRIIUpdate } from "../learning/rii.js";

export function normalizeCrossUnitEvidence(input: CrossUnitEvidenceInput): CrossUnitEvidence {
  const similarity = input.context_binding?.similarity ?? null;
  if (similarity !== null && (similarity < 0 || similarity > 1)) {
    throw new Error(`context similarity must be within [0,1]: ${similarity}`);
  }

  const normalized = {
    framework: input.framework,
    local_unit: input.local_unit,
    source_unit: input.source_unit,
    protocol_ref: input.protocol_ref,
    lineage: input.lineage,
    source_context: input.source_context ?? {},
    local_context: input.local_context ?? {},
    context_binding: {
      similarity,
      local_unknowns: [...(input.context_binding?.local_unknowns ?? [])].sort(),
    },
    source_outcome: input.source_outcome,
  };

  return {
    kind: "cross_unit_evidence",
    evidence_id: stableId("xunit", normalized),
    ...normalized,
    transferability: {
      status: "remote_only",
      local_verdict: input.source_outcome.decision_was === "correct" ? "PILOT" : "OBSERVE_MORE",
      local_outcome_ref: null,
      updates_local_rii: false,
    },
  };
}

export function importedContextBinding(evidence: CrossUnitEvidence): ContextBinding {
  return {
    local_unit: evidence.local_unit,
    origin_unit: evidence.source_unit,
    protocol_ref: evidence.protocol_ref,
    similarity: evidence.context_binding.similarity,
    local_unknowns: evidence.context_binding.local_unknowns,
    imported_context: evidence.source_context,
    local_context: evidence.local_context,
  };
}

export function assessImportedEvidence(evidence: CrossUnitEvidence): RIIUpdateAssessment {
  const basis: RIIBasis = {
    evidence_scope: "imported",
    decision_was: evidence.source_outcome.decision_was,
    replay_changed: false,
    then: evidence.source_outcome.decision ?? { state: "external_protocol", target: evidence.protocol_ref },
    now: { state: "local_unvalidated", target: evidence.protocol_ref },
    context_binding: importedContextBinding(evidence),
  };
  return assessRIIUpdate(basis);
}
