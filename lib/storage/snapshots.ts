import { nanoid } from "nanoid";
import { getDb } from "@/lib/storage/db";

export interface SnapshotRow {
  id: string;
  doc_id: string;
  patch_id: string;
  content_md_before: string;
  created_at: number;
}

export function createSnapshot(input: Omit<SnapshotRow, "id" | "created_at">) {
  const db = getDb();
  const snapshot: SnapshotRow = {
    ...input,
    id: nanoid(),
    created_at: Date.now()
  };
  db.prepare(
    "insert into snapshots (id, doc_id, patch_id, content_md_before, created_at) values (?, ?, ?, ?, ?)"
  ).run(
    snapshot.id,
    snapshot.doc_id,
    snapshot.patch_id,
    snapshot.content_md_before,
    snapshot.created_at
  );
  return snapshot;
}

export function getSnapshot(id: string) {
  const db = getDb();
  return db
    .prepare(
      "select id, doc_id, patch_id, content_md_before, created_at from snapshots where id = ?"
    )
    .get(id) as SnapshotRow | undefined;
}
