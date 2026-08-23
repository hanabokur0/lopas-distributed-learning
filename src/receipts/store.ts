import {
  canonicalJson,
  sha256,
  stableId,
} from "../canonical.js";
import type { ReceiptEnvelope } from "../types.js";
import { GENESIS_HASH, sealReceipt, verifyReceiptChain } from "./integrity.js";

/**
 * Storage contract. Persistence is intentionally outside the core so a unit can
 * use filesystem, Git, SQLite, object storage, removable media, or a custom LAN store.
 */
export interface ReceiptStore {
  readAll(): ReceiptEnvelope[];
  append<T>(kind: string, payload: T, now?: Date): ReceiptEnvelope<T>;
  verify(): boolean;
}

/** Dependency-free reference implementation used by tests and embedded runtimes. */
export class MemoryReceiptStore implements ReceiptStore {
  private readonly records: ReceiptEnvelope[] = [];

  readAll(): ReceiptEnvelope[] {
    return [...this.records];
  }

  append<T>(kind: string, payload: T, now = new Date()): ReceiptEnvelope<T> {
    if (!this.verify()) throw new Error("receipt chain is invalid; refusing to append");
    const prevHash = this.records.length
      ? this.records[this.records.length - 1].integrity.record_sha256
      : GENESIS_HASH;

    const receipt = sealReceipt(
      {
        schema_version: "0.1.0",
        receipt_id: stableId("rcpt", { kind, payload }),
        recorded_at: now.toISOString(),
        kind,
        payload,
      },
      prevHash,
    );
    this.records.push(receipt as ReceiptEnvelope);
    return receipt;
  }

  verify(): boolean {
    return verifyReceiptChain(this.records);
  }
}
