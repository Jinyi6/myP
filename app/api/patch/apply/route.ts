import { NextResponse } from "next/server";
import { applyPatch } from "@/lib/diff/applyPatch";
import type { PatchSummary } from "@/lib/diff/types";
import { getPatch, updatePatchStatus } from "@/lib/storage/patches";
import { createSnapshot } from "@/lib/storage/snapshots";
import { updateDocument } from "@/lib/storage/documents";
import { hashContent } from "@/lib/utils/hash";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    doc_id?: string;
    patch_id?: string;
    current_md?: string;
    acceptance?: Record<string, Record<string, boolean>>;
    whole_acceptance?: Record<string, boolean>;
  };

  if (!body.doc_id || !body.patch_id || body.current_md === undefined) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const patchRow = getPatch(body.patch_id);
  if (!patchRow) {
    return NextResponse.json({ error: "Patch not found" }, { status: 404 });
  }

  const currentHash = hashContent(body.current_md);
  if (currentHash !== patchRow.base_hash) {
    return NextResponse.json(
      { error: "Base content changed", status: "superseded" },
      { status: 409 }
    );
  }

  const patch = JSON.parse(patchRow.patch_json) as PatchSummary;

  const newMarkdown = applyPatch(
    body.current_md,
    patch,
    body.acceptance ?? {},
    body.whole_acceptance ?? {}
  );

  const snapshot = createSnapshot({
    doc_id: body.doc_id,
    patch_id: body.patch_id,
    content_md_before: body.current_md
  });

  updateDocument(body.doc_id, { content_md: newMarkdown });
  updatePatchStatus(body.patch_id, "applied");

  return NextResponse.json({
    ok: true,
    new_md: newMarkdown,
    new_hash: hashContent(newMarkdown),
    snapshot_id: snapshot.id
  });
}
