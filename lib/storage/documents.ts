import { nanoid } from "nanoid";
import { getDb } from "@/lib/storage/db";

export interface DocumentRow {
  id: string;
  title: string;
  content_md: string;
  created_at: number;
  updated_at: number;
}

export function listDocuments(): DocumentRow[] {
  const db = getDb();
  return db
    .prepare(
      "select id, title, content_md, created_at, updated_at from documents order by updated_at desc"
    )
    .all();
}

export function getDocument(id: string): DocumentRow | undefined {
  const db = getDb();
  return db
    .prepare(
      "select id, title, content_md, created_at, updated_at from documents where id = ?"
    )
    .get(id);
}

export function createDocument(title: string): DocumentRow {
  const db = getDb();
  const now = Date.now();
  const doc: DocumentRow = {
    id: nanoid(),
    title,
    content_md: "",
    created_at: now,
    updated_at: now
  };
  db.prepare(
    "insert into documents (id, title, content_md, created_at, updated_at) values (?, ?, ?, ?, ?)"
  ).run(doc.id, doc.title, doc.content_md, doc.created_at, doc.updated_at);
  return doc;
}

export function updateDocument(
  id: string,
  updates: Partial<Pick<DocumentRow, "title" | "content_md">>
) {
  const db = getDb();
  const current = getDocument(id);
  if (!current) {
    return undefined;
  }
  const updated = {
    ...current,
    ...updates,
    updated_at: Date.now()
  };
  db.prepare(
    "update documents set title = ?, content_md = ?, updated_at = ? where id = ?"
  ).run(updated.title, updated.content_md, updated.updated_at, id);
  return updated;
}

export function deleteDocument(id: string) {
  const db = getDb();
  db.prepare("delete from documents where id = ?").run(id);
}
