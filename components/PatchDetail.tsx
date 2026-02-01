"use client";

import type { BlockDiff, PatchSummary } from "@/lib/diff/types";

interface PatchDetailProps {
  patch: PatchSummary;
  onUpdateBlock: (blockKey: string, updates: Record<string, boolean>) => void;
  onUpdateWhole: (blockKey: string, accept: boolean) => void;
}

function renderSentenceText(text: string | null) {
  if (!text) {
    return <em>(empty)</em>;
  }
  return text;
}

function BlockView({
  block,
  onUpdateBlock,
  onUpdateWhole
}: {
  block: BlockDiff;
  onUpdateBlock: PatchDetailProps["onUpdateBlock"];
  onUpdateWhole: PatchDetailProps["onUpdateWhole"];
}) {
  return (
    <div className="patch-block">
      <div className="patch-block__header">
        <strong>{block.type}</strong>
        <span>{block.block_key}</span>
      </div>
      {block.mode === "sentence" && block.sentences ? (
        <div className="patch-block__sentences">
          {block.sentences.map((sentence) => (
            <label key={sentence.id}>
              <input
                type="checkbox"
                checked={sentence.accept ?? false}
                onChange={(event) =>
                  onUpdateBlock(block.block_key, {
                    [sentence.id]: event.target.checked
                  })
                }
              />
              <span className="patch-block__before">
                {renderSentenceText(sentence.before)}
              </span>
              <span className="patch-block__arrow">→</span>
              <span className="patch-block__after">
                {renderSentenceText(sentence.after)}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="patch-block__whole">
          <label>
            <input
              type="checkbox"
              checked={block.accept ?? false}
              onChange={(event) => onUpdateWhole(block.block_key, event.target.checked)}
            />
            Apply whole block change
          </label>
          <div className="patch-block__diff">
            <pre>{block.before ?? ""}</pre>
            <pre>{block.after ?? ""}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatchDetail({
  patch,
  onUpdateBlock,
  onUpdateWhole
}: PatchDetailProps) {
  return (
    <section className="patch-detail">
      <header>
        <h3>Patch Detail</h3>
        <p>{patch.summary}</p>
      </header>
      {patch.blocks.map((block) => (
        <BlockView
          key={block.block_key}
          block={block}
          onUpdateBlock={onUpdateBlock}
          onUpdateWhole={onUpdateWhole}
        />
      ))}
    </section>
  );
}
