import { NextResponse } from "next/server";
import { generateCandidate } from "@/lib/llm/openai";
import { createProposal } from "@/lib/storage/proposals";
import { hashContent } from "@/lib/utils/hash";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    doc_id?: string;
    content_md?: string;
    intent?: string;
  };

  if (!body.doc_id || body.content_md === undefined || !body.intent) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { summary, candidate } = await generateCandidate(
    body.content_md,
    body.intent
  );
  const base_hash = hashContent(body.content_md);
  const proposal = createProposal({
    doc_id: body.doc_id,
    intent: body.intent,
    summary,
    candidate_md: candidate,
    base_hash
  });

  return NextResponse.json({
    proposal: {
      id: proposal.id,
      summary: proposal.summary,
      candidate_md: proposal.candidate_md,
      base_hash: proposal.base_hash
    }
  });
}
