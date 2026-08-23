import { canonicalJson, sha256 } from "../canonical.js";
import type { ReceiptEnvelope } from "../types.js";

export const GENESIS_HASH = "genesis";

interface UnsignedReceipt<T> {
  schema_version: "0.1.0";
  receipt_id: string;
  recorded_at: string;
  kind: string;
  payload: T;
  integrity: {
    prev_hash: string;
    content_sha256: string;
  };
}

export function receiptContentHash<T>(
  kind: string,
  payload: T,
): string {
  return sha256(
    canonicalJson({
      kind,
      payload,
    }),
  );
}

export function recordHash<T>(
  unsigned: UnsignedReceipt<T>,
): string {
  return sha256(canonicalJson(unsigned));
}

export function sealReceipt<T>(
  input: Omit<ReceiptEnvelope<T>, "integrity">,
  prevHash: string = GENESIS_HASH,
): ReceiptEnvelope<T> {
  const contentSha256 = receiptContentHash(
    input.kind,
    input.payload,
  );

  const unsigned: UnsignedReceipt<T> = {
    ...input,
    integrity: {
      prev_hash: prevHash,
      content_sha256: contentSha256,
    },
  };

  return {
    ...input,
    integrity: {
      prev_hash: prevHash,
      content_sha256: contentSha256,
      record_sha256: recordHash(unsigned),
    },
  };
}

export function verifyReceipt<T>(
  receipt: ReceiptEnvelope<T>,
): boolean {
  const expectedContentHash = receiptContentHash(
    receipt.kind,
    receipt.payload,
  );

  if (
    receipt.integrity.content_sha256 !==
    expectedContentHash
  ) {
    return false;
  }

  const unsigned: UnsignedReceipt<T> = {
    schema_version: receipt.schema_version,
    receipt_id: receipt.receipt_id,
    recorded_at: receipt.recorded_at,
    kind: receipt.kind,
    payload: receipt.payload,
    integrity: {
      prev_hash: receipt.integrity.prev_hash,
      content_sha256:
        receipt.integrity.content_sha256,
    },
  };

  return (
    receipt.integrity.record_sha256 ===
    recordHash(unsigned)
  );
}

export function verifyReceiptChain(
  receipts: ReceiptEnvelope[],
): boolean {
  let expectedPrev = GENESIS_HASH;

  for (const receipt of receipts) {
    if (
      receipt.integrity.prev_hash !==
      expectedPrev
    ) {
      return false;
    }

    if (!verifyReceipt(receipt)) {
      return false;
    }

    expectedPrev =
      receipt.integrity.record_sha256;
  }

  return true;
}
