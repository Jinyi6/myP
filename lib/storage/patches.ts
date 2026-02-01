import { nanoid } from "nanoid";
import { getDb } from "@/lib/storage/db";

export interface PatchRow {
  id: string;
  doc_id: string;
  proposal_id: string;
  status: string;
  base_hash: string;
  patch_json: string;
  created_at: number;
}

export function createPatch(input: Omit<PatchRow, "id" | "created_at">) {
  const db = getDb();
  const patch: PatchRow = {
    ...input,
    id: nanoid(),
    created_at: Date.now()
  };
  db.prepare(
    "insert into patches (id, doc_id, proposal_id, status, base_hash, patch_json, created_at) values (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    patch.id,
    patch.doc_id,
    patch.proposal_id,
    patch.status,
    patch.base_hash,
    patch.patch_json,
    patch.created_at
  );
  return patch;
}

export function updatePatchStatus(id: string, status: string) {
  const db = getDb();
  db.prepare("update patches set status = ? where id = ?").run(status, id);
}

export function getPatch(id: string) {
  const db = getDb();
  return db
    .prepare(
      "select id, doc_id, proposal_id, status, base_hash, patch_json, created_at from patches where id = ?"
    )
    .get(id) as PatchRow | undefined;
}
