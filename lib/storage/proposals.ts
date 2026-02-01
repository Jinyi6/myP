import { nanoid } from "nanoid";
import { getDb } from "@/lib/storage/db";

export interface ProposalRow {
  id: string;
  doc_id: string;
  intent: string;
  summary: string;
  candidate_md: string;
  base_hash: string;
  created_at: number;
}

export function createProposal(input: Omit<ProposalRow, "id" | "created_at">) {
  const db = getDb();
  const proposal: ProposalRow = {
    ...input,
    id: nanoid(),
    created_at: Date.now()
  };
  db.prepare(
    "insert into proposals (id, doc_id, intent, summary, candidate_md, base_hash, created_at) values (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    proposal.id,
    proposal.doc_id,
    proposal.intent,
    proposal.summary,
    proposal.candidate_md,
    proposal.base_hash,
    proposal.created_at
  );
  return proposal;
}

export function getProposal(id: string) {
  const db = getDb();
  return db
    .prepare(
      "select id, doc_id, intent, summary, candidate_md, base_hash, created_at from proposals where id = ?"
    )
    .get(id) as ProposalRow | undefined;
}
