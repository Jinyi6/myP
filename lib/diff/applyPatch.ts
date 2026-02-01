import { parseBlocks } from "@/lib/diff/parseBlocks";
import type { PatchSummary } from "@/lib/diff/types";

export function applyPatch(
  base: string,
  patch: PatchSummary,
  acceptance: Record<string, Record<string, boolean>>,
  wholeAcceptance: Record<string, boolean>
) {
  const baseBlocks = parseBlocks(base);
  const blocksByPosition = new Map<number, PatchSummary["blocks"]>();
  patch.blocks.forEach((block) => {
    const position = block.position ?? 0;
    const existing = blocksByPosition.get(position) ?? [];
    existing.push(block);
    blocksByPosition.set(position, existing);
  });

  const result: string[] = [];

  const applyBlock = (block: PatchSummary["blocks"][number]) => {
    if (block.mode === "sentence" && block.sentences && block.before !== null) {
      const sentenceAcceptance = acceptance[block.block_key] ?? {};
      const sentences = block.sentences
        .map((sentence) => {
          const accept = sentenceAcceptance[sentence.id] ?? false;
          if (sentence.before === sentence.after) {
            return sentence.before;
          }
          if (sentence.before === null) {
            return accept ? sentence.after : null;
          }
          if (sentence.after === null) {
            return accept ? null : sentence.before;
          }
          return accept ? sentence.after : sentence.before;
        })
        .filter((value): value is string => value !== null);
      result.push(sentences.join(" "));
      return;
    }

    const acceptWhole = wholeAcceptance[block.block_key] ?? false;
    if (block.before === null) {
      if (acceptWhole && block.after) {
        result.push(block.after);
      }
      return;
    }
    if (acceptWhole) {
      if (block.after !== null) {
        result.push(block.after);
      }
      return;
    }
    result.push(block.before);
  };

  baseBlocks.forEach((block, index) => {
    const insertBlocks = blocksByPosition.get(index) ?? [];
    insertBlocks
      .filter((b) => b.before === null)
      .forEach((insertBlock) => applyBlock(insertBlock));

    const match = patch.blocks.find((b) => b.block_key === block.key);
    if (match) {
      if (match.after !== null) {
        applyBlock(match);
      }
      return;
    }

    result.push(block.content);
  });

  const tailBlocks = blocksByPosition.get(baseBlocks.length) ?? [];
  tailBlocks
    .filter((b) => b.before === null)
    .forEach((insertBlock) => applyBlock(insertBlock));

  return result.join("\n\n");
}
