import {
  canonicalJson,
  sha256,
  stableId,
} from "../canonical.js";

import {
  GENESIS_HASH,
  sealReceipt,
  verifyReceiptChain,
} from "./integrity.js";

import type {
  ReceiptEnvelope,
} from "../types.js";

export interface ReceiptStore {
  append<T>(
    kind: string,
    payload: T,
    now?: Date,
  ): ReceiptEnvelope<T>;

  list(): ReceiptEnvelope[];

  verify(): boolean;
}

export class MemoryReceiptStore
  implements ReceiptStore
{
  private readonly records: ReceiptEnvelope[] = [];

  append<T>(
    kind: string,
    payload: T,
    now = new Date(),
  ): ReceiptEnvelope<T> {
    if (!this.verify()) {
      throw new Error(
        "receipt chain is invalid; refusing to append",
      );
    }

    const prevHash =
      this.records.length > 0
        ? this.records[
            this.records.length - 1
          ].integrity.record_sha256
        : GENESIS_HASH;

    const recordedAt = now.toISOString();

    /*
     * content_sha256 represents the content identity.
     *
     * Two independent receipt events may contain
     * exactly the same kind + payload and therefore
     * share the same content_sha256.
     */
    const contentSha256 = sha256(
      canonicalJson({
        kind,
        payload,
      }),
    );

    /*
     * receipt_id represents the event identity.
     *
     * Including prev_hash + recorded_at means that
     * recording identical content twice still creates
     * two distinct receipt events.
     */
    const receiptId = stableId(
      "rcpt",
      {
        prev_hash: prevHash,
        recorded_at: recordedAt,
        kind,
        content_sha256: contentSha256,
      },
      20,
    );

    const receipt = sealReceipt(
      {
        schema_version: "0.1.0",
        receipt_id: receiptId,
        recorded_at: recordedAt,
        kind,
        payload,
      },
      prevHash,
    );

    this.records.push(
      receipt as ReceiptEnvelope,
    );

    return receipt;
  }

  list(): ReceiptEnvelope[] {
    return [...this.records];
  }

  verify(): boolean {
    return verifyReceiptChain(this.records);
  }
}
