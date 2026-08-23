import type {
  ContextBinding,
  DecisionSnapshot,
  ImportedPilotBinding,
  LocalOutcomeEvidence,
  OutcomeQuality,
} from "../types.js";

/**
 * Minimal bridge contract for deterministic routers.
 * The distributed-learning core does not depend on LoPAS Coordinate Router itself.
 */
export interface ReplayableDecisionAdapter<TObservation> {
  framework: string;
  version: string;
  decide(observation: TObservation): DecisionSnapshot;
}

export interface HistoricalDecision<TObservation> {
  observation_id: string;
  observation: TObservation;
  decision: DecisionSnapshot;
  imported_pilot?: ImportedPilotBinding;
}

export function buildLocalOutcomeEvidence<TObservation>(args: {
  adapter: ReplayableDecisionAdapter<TObservation>;
  historical: HistoricalDecision<TObservation>;
  outcome: {
    decision_was: OutcomeQuality;
    what_happened: string;
    recorded_at?: string;
  };
}): LocalOutcomeEvidence {
  const now = args.adapter.decide(args.historical.observation);
  const pilot = args.historical.imported_pilot;

  const contextBinding: ContextBinding | undefined = pilot
    ? {
        local_unit: pilot.local_unit,
        origin_unit: pilot.origin_unit,
        protocol_ref: pilot.protocol_ref,
        similarity: pilot.context_binding.similarity,
        local_unknowns: pilot.context_binding.local_unknowns,
        imported_context: pilot.imported_context,
        local_context: pilot.local_context,
      }
    : undefined;

  return {
    kind: "local_outcome_evidence",
    observation_id: args.historical.observation_id,
    framework: args.adapter.framework,
    outcome_recorded_at: args.outcome.recorded_at ?? new Date().toISOString(),
    decision_was: args.outcome.decision_was,
    what_happened: args.outcome.what_happened,
    then: args.historical.decision,
    now,
    source_evidence_id: pilot?.source_evidence_id,
    context_binding: contextBinding,
  };
}
