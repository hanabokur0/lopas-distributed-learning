export type OutcomeQuality = "correct" | "premature" | "missed" | "unknown";
export type EvidenceScope = "local" | "imported";
export type RIIComponentStatus = "supported" | "candidate" | "insufficient";

export interface DecisionSnapshot {
  state: string;
  target?: unknown;
}

export interface ProtocolLineage {
  source_receipt_refs?: string[];
  parent_protocol_refs?: string[];
  source_git_commit?: string;
  source_git_tag?: string;
  source_repository?: string;
}

export interface ContextBinding {
  local_unit: string;
  origin_unit?: string;
  protocol_ref?: string;
  similarity?: number | null;
  local_unknowns?: string[];
  imported_context?: Record<string, unknown>;
  local_context?: Record<string, unknown>;
}

export interface RIIBasis {
  evidence_scope?: EvidenceScope;
  decision_was: OutcomeQuality;
  replay_changed: boolean;
  then: DecisionSnapshot;
  now: DecisionSnapshot;
  context_binding?: ContextBinding;
}

export type BUAction =
  | "retain_boundary"
  | "protect_previous_boundary"
  | "review_tighten_boundary"
  | "review_expand_branch_or_boundary"
  | "observe_more"
  | "pilot_locally"
  | "retain_external_evidence";

export interface RIIUpdateAssessment {
  evidence_scope: EvidenceScope;
  rii_update_candidate: {
    HCD: {
      status: RIIComponentStatus;
      hidden_cause_candidates: string[];
      evidence: string[];
    };
    BFR: {
      status: RIIComponentStatus;
      failure_mode: "none_observed" | "premature_closure" | "missed_branch_or_boundary" | "unresolved";
      boundary: string;
      evidence: string[];
    };
    BU: {
      status: RIIComponentStatus;
      action: BUAction;
      target: string;
      automatic_apply: false;
      boundary_update_eligible: boolean;
      rationale: string;
    };
    OR: {
      status: RIIComponentStatus;
      interpretation: string;
    };
  };
  disposition: "retain" | "review" | "observe_more" | "pilot";
  aggregate_rii_score_update: null;
}

export interface CrossUnitEvidenceInput {
  framework: string;
  local_unit: string;
  source_unit: string;
  protocol_ref: string;
  lineage?: ProtocolLineage;
  source_context?: Record<string, unknown>;
  local_context?: Record<string, unknown>;
  context_binding?: {
    similarity?: number | null;
    local_unknowns?: string[];
  };
  source_outcome: {
    decision_was: OutcomeQuality;
    what_happened: string;
    decision?: DecisionSnapshot;
  };
}

export interface CrossUnitEvidence {
  kind: "cross_unit_evidence";
  evidence_id: string;
  framework: string;
  local_unit: string;
  source_unit: string;
  protocol_ref: string;
  lineage?: ProtocolLineage;
  source_context: Record<string, unknown>;
  local_context: Record<string, unknown>;
  context_binding: {
    similarity: number | null;
    local_unknowns: string[];
  };
  source_outcome: CrossUnitEvidenceInput["source_outcome"];
  transferability: {
    status: "remote_only";
    local_verdict: "PILOT" | "OBSERVE_MORE";
    local_outcome_ref: null;
    updates_local_rii: false;
  };
}

export interface ImportedPilotBinding {
  source_evidence_id: string;
  protocol_ref: string;
  origin_unit: string;
  local_unit: string;
  lineage?: ProtocolLineage;
  context_binding: CrossUnitEvidence["context_binding"];
  imported_context: Record<string, unknown>;
  local_context: Record<string, unknown>;
}

export interface LocalOutcomeEvidence {
  kind: "local_outcome_evidence";
  observation_id: string;
  framework: string;
  outcome_recorded_at: string;
  decision_was: OutcomeQuality;
  what_happened: string;
  then: DecisionSnapshot;
  now: DecisionSnapshot;
  source_evidence_id?: string;
  context_binding?: ContextBinding;
}

export interface ReceiptIntegrity {
  prev_hash: string;
  content_sha256: string;
  record_sha256: string;
}

export interface ReceiptEnvelope<T = unknown> {
  schema_version: "0.1.0";
  receipt_id: string;
  recorded_at: string;
  kind: string;
  payload: T;
  integrity: ReceiptIntegrity;
}
