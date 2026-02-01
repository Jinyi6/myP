export type BlockType =
  | "paragraph"
  | "heading"
  | "list-item"
  | "blockquote"
  | "code"
  | "math"
  | "other";

export type DiffMode = "sentence" | "whole";

export interface SentenceDiff {
  id: string;
  before: string | null;
  after: string | null;
  accept: boolean | null;
}

export interface BlockDiff {
  block_key: string;
  type: BlockType;
  mode: DiffMode;
  before: string | null;
  after: string | null;
  sentences?: SentenceDiff[];
  position?: number;
  accept?: boolean | null;
}

export interface PatchSummary {
  id: string;
  base_hash: string;
  summary: string;
  blocks: BlockDiff[];
}
