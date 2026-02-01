"use client";

import { useEffect, useMemo, useState } from "react";
import { debounce } from "@/lib/utils/debounce";

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState("<p>Loading preview...</p>");

  const debouncedRender = useMemo(
    () =>
      debounce(async (nextContent: string) => {
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: nextContent })
        });
        if (res.ok) {
          const data = (await res.json()) as { html: string };
          setHtml(data.html);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedRender(content);
  }, [content, debouncedRender]);

  return (
    <section className="preview">
      <h2>Preview</h2>
      <div
        className="preview__content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
