import { backtrackLcs } from "@/lib/diff/lcs";
import type { ParsedBlock } from "@/lib/diff/parseBlocks";

export interface BlockChange {
  type: "equal" | "delete" | "insert";
  block: ParsedBlock;
}

export function diffBlocks(before: ParsedBlock[], after: ParsedBlock[]) {
  const steps = backtrackLcs(
    before,
    after,
    (a, b) => a.type === b.type && a.content === b.content
  );
  const changes: BlockChange[] = [];
  let beforeIndex = 0;
  let afterIndex = 0;

  steps.forEach((step) => {
    if (step.type === "equal") {
      changes.push({ type: "equal", block: before[beforeIndex] });
      beforeIndex += 1;
      afterIndex += 1;
    } else if (step.type === "delete") {
      changes.push({ type: "delete", block: before[beforeIndex] });
      beforeIndex += 1;
    } else {
      changes.push({ type: "insert", block: after[afterIndex] });
      afterIndex += 1;
    }
  });

  return changes;
}
