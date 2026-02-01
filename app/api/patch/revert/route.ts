import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/storage/snapshots";
import { updateDocument } from "@/lib/storage/documents";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    doc_id?: string;
    snapshot_id?: string;
  };

  if (!body.doc_id || !body.snapshot_id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const snapshot = getSnapshot(body.snapshot_id);
  if (!snapshot || snapshot.doc_id !== body.doc_id) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  const document = updateDocument(body.doc_id, {
    content_md: snapshot.content_md_before
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, content_md: document.content_md });
}
