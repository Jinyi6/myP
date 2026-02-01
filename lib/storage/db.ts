import Database from "better-sqlite3";
import path from "path";
import { getDataDir } from "@/lib/storage/paths";

let db: Database.Database | null = null;

function initDb() {
  if (db) {
    return db;
  }
  const dbPath = path.join(getDataDir(), "vibemd.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    create table if not exists documents (
      id text primary key,
      title text not null,
      content_md text not null,
      created_at integer not null,
      updated_at integer not null
    );
    create table if not exists proposals (
      id text primary key,
      doc_id text not null,
      intent text not null,
      summary text not null,
      candidate_md text not null,
      base_hash text not null,
      created_at integer not null
    );
    create table if not exists patches (
      id text primary key,
      doc_id text not null,
      proposal_id text not null,
      status text not null,
      base_hash text not null,
      patch_json text not null,
      created_at integer not null
    );
    create table if not exists snapshots (
      id text primary key,
      doc_id text not null,
      patch_id text not null,
      content_md_before text not null,
      created_at integer not null
    );
  `);
  return db;
}

export function getDb() {
  return initDb();
}
