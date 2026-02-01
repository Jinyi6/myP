export function segmentSentences(text: string) {
  const segmenter = new Intl.Segmenter("und", { granularity: "sentence" });
  return Array.from(segmenter.segment(text)).map((segment) => segment.segment);
}
