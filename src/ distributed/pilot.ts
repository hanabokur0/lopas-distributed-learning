import type { CrossUnitEvidence, ImportedPilotBinding } from "../types.js";

export function createImportedPilotBinding(evidence: CrossUnitEvidence): ImportedPilotBinding {
  return {
    source_evidence_id: evidence.evidence_id,
    protocol_ref: evidence.protocol_ref,
    origin_unit: evidence.source_unit,
    local_unit: evidence.local_unit,
    lineage: evidence.lineage,
    context_binding: evidence.context_binding,
    imported_context: evidence.source_context,
    local_context: evidence.local_context,
  };
}

export function assertPilotAllowed(evidence: CrossUnitEvidence): void {
  if (evidence.transferability.local_verdict !== "PILOT") {
    throw new Error(
      `imported evidence ${evidence.evidence_id} is not pilot-ready: ${evidence.transferability.local_verdict}`,
    );
  }
  if (evidence.transferability.updates_local_rii !== false) {
    throw new Error("distributed invariant violated: imported evidence must not update local RII directly");
  }
}
