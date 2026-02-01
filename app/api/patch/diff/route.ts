import { NextResponse } from "next/server";
import { generatePatch } from "@/lib/diff/generatePatch";
import { diffBlocks } from "@/lib/diff/blockDiff";
import { parseBlocks } from "@/lib/diff/parseBlocks";
import { createPatch } from "@/lib/storage/patches";
import { hashContent } from "@/lib/utils/hash";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    doc_id?: string;
    base_md?: string;
    candidate_md?: string;
    base_hash?: string;
    summary?: string;
    proposal_id?: string;
    intent?: string;
  };

  if (
    !body.doc_id ||
    body.base_md === undefined ||
    body.candidate_md === undefined ||
    !body.summary ||
    !body.proposal_id
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const baseHash = body.base_hash ?? hashContent(body.base_md);
  const allowProtectedEdits = Boolean(
    body.intent?.includes("代码") || body.intent?.includes("公式")
  );

  const beforeBlocks = parseBlocks(body.base_md);
  const afterBlocks = parseBlocks(body.candidate_md);
  const blockChanges = diffBlocks(beforeBlocks, afterBlocks);
  const unchangedCount = blockChanges.filter((change) => change.type === "equal").length;
  const totalBlocks = Math.max(beforeBlocks.length, 1);
  const unchangedRatio = unchangedCount / totalBlocks;
  const needsRegenerate = unchangedRatio < 0.2;

  const patch = generatePatch(
    body.base_md,
    body.candidate_md,
    body.summary,
    allowProtectedEdits
  );
  patch.base_hash = baseHash;

  const saved = createPatch({
    doc_id: body.doc_id,
    proposal_id: body.proposal_id,
    status: "pending",
    base_hash: baseHash,
    patch_json: JSON.stringify(patch)
  });

  patch.id = saved.id;

  return NextResponse.json({
    patch,
    stats: {
      unchanged_blocks: unchangedCount,
      total_blocks: totalBlocks,
      unchanged_ratio: unchangedRatio
    },
    needs_regen: needsRegenerate
  });
}
