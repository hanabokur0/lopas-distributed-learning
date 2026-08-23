import assert from "node:assert/strict";
import {
  assessRIIUpdate,
  normalizeCrossUnitEvidence,
  assessImportedEvidence,
  MemoryReceiptStore,
  sha256,
} from "../dist/index.js";

assert.equal(sha256("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");

const local = assessRIIUpdate({
  evidence_scope: "local",
  decision_was: "premature",
  replay_changed: false,
  then: { state: "route", target: "x" },
  now: { state: "route", target: "x" },
});
assert.equal(local.rii_update_candidate.BU.boundary_update_eligible, true);
assert.equal(local.rii_update_candidate.BU.automatic_apply, false);

const imported = normalizeCrossUnitEvidence({
  framework: "demo",
  local_unit: "region-b",
  source_unit: "region-a",
  protocol_ref: "protocol-x@v1",
  context_binding: { similarity: 0.62, local_unknowns: ["climate"] },
  source_outcome: { decision_was: "correct", what_happened: "worked" },
});
const importedAssessment = assessImportedEvidence(imported);
assert.equal(importedAssessment.disposition, "pilot");
assert.equal(importedAssessment.rii_update_candidate.BU.boundary_update_eligible, false);

const store = new MemoryReceiptStore();
store.append("cross_unit_evidence", imported, new Date("2026-08-23T00:00:00.000Z"));
store.append("rii_update_candidate", importedAssessment, new Date("2026-08-23T00:00:01.000Z"));
assert.equal(store.verify(), true);

console.log("smoke OK");

const duplicateStore = new MemoryReceiptStore();

const a = duplicateStore.append(
  "demo",
  { value: 1 },
  new Date("2026-08-23T00:00:00.000Z"),
);

const b = duplicateStore.append(
  "demo",
  { value: 1 },
  new Date("2026-08-23T00:00:01.000Z"),
);

assert.notEqual(
  a.receipt_id,
  b.receipt_id,
);

assert.equal(
  a.integrity.content_sha256,
  b.integrity.content_sha256,
);

assert.notEqual(
  a.integrity.record_sha256,
  b.integrity.record_sha256,
);

assert.equal(
  duplicateStore.verify(),
  true,
);
