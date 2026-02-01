import { parseBlocks } from "@/lib/diff/parseBlocks";
import { diffBlocks } from "@/lib/diff/blockDiff";
import { diffSentences } from "@/lib/diff/sentenceDiff";
import { segmentSentences } from "@/lib/diff/sentenceSeg";
import type { BlockDiff, PatchSummary } from "@/lib/diff/types";

const complexInlinePattern = /(`[^`]+`|\[[^\]]+\]\([^\)]+\)|!\[[^\]]*\]\([^\)]+\)|\$[^\$]+\$|\|)/;

function isTextBlock(type: string) {
  return type === "paragraph" || type === "list-item" || type === "blockquote";
}

export function generatePatch(
  base: string,
  candidate: string,
  summary: string,
  allowProtectedEdits: boolean
): PatchSummary {
  const beforeBlocks = parseBlocks(base);
  const afterBlocks = parseBlocks(candidate);
  const changes = diffBlocks(beforeBlocks, afterBlocks);
  const blocks: BlockDiff[] = [];
  let index = 0;

  for (let i = 0; i < changes.length; i += 1) {
    const change = changes[i];
    const next = changes[i + 1];

    if (change.type === "equal") {
      index += 1;
      continue;
    }

    if (change.type === "delete" && next && next.type === "insert") {
      const before = change.block;
      const after = next.block;
      i += 1;
      const canSentence =
        isTextBlock(before.type) &&
        !complexInlinePattern.test(before.content) &&
        !complexInlinePattern.test(after.content);
      const mode = canSentence ? "sentence" : "whole";
      const blockDiff: BlockDiff = {
        block_key: before.key,
        type: before.type,
        mode,
        before: before.content,
        after: after.content,
        position: index,
        accept: null
      };
      if (mode === "sentence") {
        const sentenceDiffs = diffSentences(
          segmentSentences(before.content),
          segmentSentences(after.content)
        );
        blockDiff.sentences = sentenceDiffs.map((diff, sentenceIndex) => ({
          id: `${before.key}:s${sentenceIndex}`,
          before: diff.before,
          after: diff.after,
          accept: null
        }));
      }
      if (
        (before.type === "code" || before.type === "math") &&
        !allowProtectedEdits
      ) {
        blockDiff.after = blockDiff.before;
      }
      blocks.push(blockDiff);
      index += 1;
      continue;
    }

    if (change.type === "delete") {
      const before = change.block;
      blocks.push({
        block_key: before.key,
        type: before.type,
        mode: "whole",
        before: before.content,
        after: null,
        position: index,
        accept: null
      });
      index += 1;
      continue;
    }

    if (change.type === "insert") {
      const after = change.block;
      const isProtected = after.type === "code" || after.type === "math";
      blocks.push({
        block_key: `insert:${after.key}:${index}`,
        type: after.type,
        mode: "whole",
        before: null,
        after: isProtected && !allowProtectedEdits ? null : after.content,
        position: index,
        accept: null
      });
      continue;
    }
  }

  return {
    id: "patch_pending",
    base_hash: "",
    summary,
    blocks
  };
}
