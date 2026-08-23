import type {
  ContextBinding,
  EvidenceScope,
  RIIBasis,
  RIIUpdateAssessment,
} from "../types.js";

export function boundaryLabel(state: string, target?: unknown): string {
  return target === undefined ? state : `${state}:${String(target)}`;
}

function contextEvidence(binding?: ContextBinding): string[] {
  if (!binding) return [];
  const out = [
    `local_unit=${binding.local_unit}`,
    binding.origin_unit ? `origin_unit=${binding.origin_unit}` : "",
    binding.protocol_ref ? `protocol_ref=${binding.protocol_ref}` : "",
    binding.similarity === undefined || binding.similarity === null
      ? ""
      : `context_similarity=${binding.similarity}`,
  ].filter(Boolean);

  for (const unknown of binding.local_unknowns ?? []) {
    out.push(`local_unknown=${unknown}`);
  }
  return out;
}

function assessImportedEvidence(basis: RIIBasis): RIIUpdateAssessment {
  const boundary = boundaryLabel(basis.now.state, basis.now.target);
  const binding = basis.context_binding;
  const protocolTarget = binding?.protocol_ref ?? boundary;
  const evidence = [
    "evidence_scope=imported",
    `remote_outcome=${basis.decision_was}`,
    ...contextEvidence(binding),
  ];

  if (basis.decision_was === "unknown") {
    return {
      evidence_scope: "imported",
      rii_update_candidate: {
        HCD: {
          status: "insufficient",
          hidden_cause_candidates: [],
          evidence: [...evidence, "remote outcome is unresolved"],
        },
        BFR: {
          status: "insufficient",
          failure_mode: "unresolved",
          boundary,
          evidence: ["Imported unknown evidence cannot establish a local boundary failure."],
        },
        BU: {
          status: "insufficient",
          action: "observe_more",
          target: protocolTarget,
          automatic_apply: false,
          boundary_update_eligible: false,
          rationale: "Imported Unknown Retention: preserve the external case without changing local boundaries.",
        },
        OR: {
          status: "insufficient",
          interpretation: "The external case is unresolved. Retain it as a future question; do not treat it as local learning.",
        },
      },
      disposition: "observe_more",
      aggregate_rii_score_update: null,
    };
  }

  if (basis.decision_was === "correct") {
    const localUnknowns = binding?.local_unknowns ?? [];
    return {
      evidence_scope: "imported",
      rii_update_candidate: {
        HCD: {
          status: "candidate",
          hidden_cause_candidates: [
            "remote_success_may_depend_on_context",
            "transferable_structure_may_exist",
            ...(localUnknowns.length ? ["local_unknowns_may_control_transferability"] : []),
          ],
          evidence,
        },
        BFR: {
          status: "insufficient",
          failure_mode: "unresolved",
          boundary,
          evidence: ["Remote success does not prove that any local rejection or routing boundary failed."],
        },
        BU: {
          status: "candidate",
          action: "pilot_locally",
          target: protocolTarget,
          automatic_apply: false,
          boundary_update_eligible: false,
          rationale: "External success is a hypothesis for local testing. Run a local PILOT before any local boundary update becomes eligible.",
        },
        OR: {
          status: "candidate",
          interpretation: "Reinterpret remote success as a transferable question, not an imported answer. Local outcome evidence is required before RII can update the local boundary.",
        },
      },
      disposition: "pilot",
      aggregate_rii_score_update: null,
    };
  }

  return {
    evidence_scope: "imported",
    rii_update_candidate: {
      HCD: {
        status: "candidate",
        hidden_cause_candidates: basis.decision_was === "premature"
          ? ["remote_context_had_premature_closure", "transfer_conditions_may_be_narrower_than_reported"]
          : ["remote_context_missed_a_branch_or_boundary", "transfer_conditions_may_be_incomplete"],
        evidence,
      },
      BFR: {
        status: "insufficient",
        failure_mode: "unresolved",
        boundary,
        evidence: ["A remote failure is a warning about transferability, not evidence that the local boundary failed."],
      },
      BU: {
        status: "candidate",
        action: "retain_external_evidence",
        target: protocolTarget,
        automatic_apply: false,
        boundary_update_eligible: false,
        rationale: "Keep the remote failure as negative transfer evidence. Do not mutate the local boundary from another unit's failure.",
      },
      OR: {
        status: "candidate",
        interpretation: basis.decision_was === "premature"
          ? "Treat the remote premature outcome as a transfer warning: identify missing context before considering a local pilot."
          : "Treat the remote miss as evidence that the protocol's branch coverage may be context-bound; inspect local conditions before reuse.",
      },
    },
    disposition: "observe_more",
    aggregate_rii_score_update: null,
  };
}

function assessLocalEvidence(basis: RIIBasis): RIIUpdateAssessment {
  const boundary = boundaryLabel(basis.then.state, basis.then.target);
  const current = boundaryLabel(basis.now.state, basis.now.target);
  const evidence = [
    "evidence_scope=local",
    `outcome=${basis.decision_was}`,
    `replay_changed=${basis.replay_changed}`,
    `then=${boundary}`,
    `now=${current}`,
  ];

  if (basis.decision_was === "unknown") {
    return {
      evidence_scope: "local",
      rii_update_candidate: {
        HCD: { status: "insufficient", hidden_cause_candidates: [], evidence: [...evidence, "outcome did not establish decision quality"] },
        BFR: { status: "insufficient", failure_mode: "unresolved", boundary, evidence: ["boundary failure cannot be inferred from an unknown local outcome"] },
        BU: {
          status: "insufficient",
          action: "observe_more",
          target: boundary,
          automatic_apply: false,
          boundary_update_eligible: false,
          rationale: "Unknown Retention: preserve uncertainty; do not mutate the boundary.",
        },
        OR: { status: "insufficient", interpretation: "Outcome remains unresolved; retain the case for later observation rather than classifying it as failure." },
      },
      disposition: "observe_more",
      aggregate_rii_score_update: null,
    };
  }

  if (basis.decision_was === "correct") {
    return {
      evidence_scope: "local",
      rii_update_candidate: {
        HCD: {
          status: basis.replay_changed ? "candidate" : "supported",
          hidden_cause_candidates: basis.replay_changed
            ? ["pack_or_engine_change_may_have_moved_a_previously_correct_boundary"]
            : [],
          evidence,
        },
        BFR: {
          status: "supported",
          failure_mode: "none_observed",
          boundary,
          evidence: ["recorded local outcome marks the historical decision as correct"],
        },
        BU: basis.replay_changed
          ? {
              status: "candidate",
              action: "protect_previous_boundary",
              target: boundary,
              automatic_apply: false,
              boundary_update_eligible: true,
              rationale: "Replay now differs from a historically correct local decision. Treat the change as a possible regression until reviewed.",
            }
          : {
              status: "supported",
              action: "retain_boundary",
              target: boundary,
              automatic_apply: false,
              boundary_update_eligible: true,
              rationale: "The local outcome supports the historical boundary and replay still agrees.",
            },
        OR: {
          status: basis.replay_changed ? "candidate" : "supported",
          interpretation: basis.replay_changed
            ? "A newer decision differs from a locally validated historical decision; newer is not automatically better."
            : "The historical local decision remains supported by both outcome and replay.",
        },
      },
      disposition: basis.replay_changed ? "review" : "retain",
      aggregate_rii_score_update: null,
    };
  }

  if (basis.decision_was === "premature") {
    return {
      evidence_scope: "local",
      rii_update_candidate: {
        HCD: {
          status: "candidate",
          hidden_cause_candidates: ["decision_closed_before_discriminating_evidence_was_sufficient"],
          evidence,
        },
        BFR: {
          status: "supported",
          failure_mode: "premature_closure",
          boundary,
          evidence: ["local outcome explicitly classifies the historical decision as premature"],
        },
        BU: {
          status: "candidate",
          action: "review_tighten_boundary",
          target: boundary,
          automatic_apply: false,
          boundary_update_eligible: true,
          rationale: "Local evidence indicates premature closure. Review stricter evidence, confidence, or gating requirements.",
        },
        OR: {
          status: "supported",
          interpretation: basis.replay_changed
            ? "The old decision was premature and the current system has moved; inspect whether the change addresses the observed failure."
            : "The old decision was premature and replay still reproduces it; the failure remains structurally reproducible.",
        },
      },
      disposition: "review",
      aggregate_rii_score_update: null,
    };
  }

  return {
    evidence_scope: "local",
    rii_update_candidate: {
      HCD: {
        status: "candidate",
        hidden_cause_candidates: ["relevant_branch_candidate_or_condition_was_absent_or_underweighted"],
        evidence,
      },
      BFR: {
        status: "supported",
        failure_mode: "missed_branch_or_boundary",
        boundary,
        evidence: ["local outcome explicitly classifies the historical decision as missed"],
      },
      BU: {
        status: "candidate",
        action: "review_expand_branch_or_boundary",
        target: boundary,
        automatic_apply: false,
        boundary_update_eligible: true,
        rationale: "Local evidence indicates a missed branch, candidate, condition, or boundary. Review expansion before changing production rules.",
      },
      OR: {
        status: "supported",
        interpretation: basis.replay_changed
          ? "The current system differs from a historically missed decision; inspect whether the new branch resolves the observed miss."
          : "The missed outcome is still reproduced by replay; branch coverage remains incomplete.",
      },
    },
    disposition: "review",
    aggregate_rii_score_update: null,
  };
}

export function assessRIIUpdate(basis: RIIBasis): RIIUpdateAssessment {
  const scope: EvidenceScope = basis.evidence_scope ?? "local";
  return scope === "imported" ? assessImportedEvidence(basis) : assessLocalEvidence(basis);
}
