import type { BlockType } from "@/lib/diff/types";

export interface ParsedBlock {
  key: string;
  type: BlockType;
  content: string;
}

const codeFencePattern = /^```/;
const mathFencePattern = /^\$\$/;

export function parseBlocks(markdown: string): ParsedBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];
  let buffer: string[] = [];
  let currentType: BlockType | null = null;
  let inCode = false;
  let inMath = false;

  const flush = () => {
    if (buffer.length === 0 || !currentType) {
      return;
    }
    const content = buffer.join("\n");
    const key = `${currentType}:${blocks.length}`;
    blocks.push({ key, type: currentType, content });
    buffer = [];
    currentType = null;
  };

  for (const line of lines) {
    if (codeFencePattern.test(line.trim())) {
      if (!inCode) {
        flush();
        inCode = true;
        currentType = "code";
        buffer.push(line);
        continue;
      }
      buffer.push(line);
      flush();
      inCode = false;
      continue;
    }

    if (mathFencePattern.test(line.trim())) {
      if (!inMath) {
        flush();
        inMath = true;
        currentType = "math";
        buffer.push(line);
        continue;
      }
      buffer.push(line);
      flush();
      inMath = false;
      continue;
    }

    if (inCode || inMath) {
      buffer.push(line);
      continue;
    }

    if (!line.trim()) {
      flush();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+/);
    const listMatch = line.match(/^\s*([-+*]|\d+\.)\s+/);
    const quoteMatch = line.match(/^>\s+/);

    if (headingMatch) {
      flush();
      blocks.push({
        key: `heading:${blocks.length}`,
        type: "heading",
        content: line
      });
      continue;
    }

    if (listMatch) {
      if (currentType && currentType !== "list-item") {
        flush();
      }
      currentType = "list-item";
      buffer.push(line);
      continue;
    }

    if (quoteMatch) {
      if (currentType && currentType !== "blockquote") {
        flush();
      }
      currentType = "blockquote";
      buffer.push(line);
      continue;
    }

    if (!currentType) {
      currentType = "paragraph";
    }
    buffer.push(line);
  }

  flush();
  return blocks;
}
