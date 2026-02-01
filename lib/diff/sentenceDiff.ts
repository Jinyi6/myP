import { backtrackLcs } from "@/lib/diff/lcs";

export interface SentenceChange {
  before: string | null;
  after: string | null;
}

export function diffSentences(before: string[], after: string[]) {
  const steps = backtrackLcs(before, after, (a, b) => a === b);
  const changes: SentenceChange[] = [];
  let pendingDelete: string | null = null;

  steps.forEach((step) => {
    if (step.type === "equal") {
      if (pendingDelete) {
        changes.push({ before: pendingDelete, after: null });
        pendingDelete = null;
      }
      changes.push({ before: step.value, after: step.value });
      return;
    }
    if (step.type === "delete") {
      if (pendingDelete) {
        changes.push({ before: pendingDelete, after: null });
      }
      pendingDelete = step.value;
      return;
    }
    if (step.type === "insert") {
      if (pendingDelete) {
        changes.push({ before: pendingDelete, after: step.value });
        pendingDelete = null;
        return;
      }
      changes.push({ before: null, after: step.value });
    }
  });

  if (pendingDelete) {
    changes.push({ before: pendingDelete, after: null });
  }

  return changes;
}
