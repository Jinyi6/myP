"use client";

import type { PatchSummary } from "@/lib/diff/types";
import PatchDetail from "@/components/PatchDetail";

interface PatchStackProps {
  patch: PatchSummary | null;
  onApply: () => Promise<void> | void;
  onReject: () => void;
  onUpdateBlock: (blockKey: string, updates: Record<string, boolean>) => void;
  onUpdateWhole: (blockKey: string, accept: boolean) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export default function PatchStack({
  patch,
  onApply,
  onReject,
  onUpdateBlock,
  onUpdateWhole,
  onAcceptAll,
  onRejectAll
}: PatchStackProps) {
  if (!patch) {
    return (
      <section className="patch-stack">
        <h2>Patch Stack</h2>
        <p>No patch yet. Generate a candidate to review diffs.</p>
      </section>
    );
  }

  const sentenceCount = patch.blocks.reduce((total, block) => {
    if (block.sentences) {
      return total + block.sentences.length;
    }
    return total;
  }, 0);

  return (
    <section className="patch-stack">
      <div className="patch-stack__header">
        <h2>Patch Stack</h2>
        <div className="patch-stack__actions">
          <button onClick={onAcceptAll}>Accept all</button>
          <button onClick={onRejectAll}>Reject all</button>
          <button onClick={onApply}>Apply accepted</button>
          <button onClick={onReject}>Reject patch</button>
        </div>
      </div>
      <p>
        {patch.blocks.length} blocks changed, {sentenceCount} sentences affected.
      </p>
      <PatchDetail
        patch={patch}
        onUpdateBlock={onUpdateBlock}
        onUpdateWhole={onUpdateWhole}
      />
    </section>
  );
}
