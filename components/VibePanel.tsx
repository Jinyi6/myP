"use client";

import { useState } from "react";

interface VibePanelProps {
  intent: string;
  onIntentChange: (value: string) => void;
  onGenerate: () => Promise<void> | void;
}

const quickIntents = [
  "更简洁",
  "更礼貌",
  "更强势",
  "更结构化",
  "更口语"
];

export default function VibePanel({
  intent,
  onIntentChange,
  onGenerate
}: VibePanelProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!intent.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onGenerate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="vibe">
      <h2>Vibe Panel</h2>
      <textarea
        value={intent}
        onChange={(event) => onIntentChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void handleGenerate();
          }
        }}
        placeholder="Describe how you want to rewrite the content..."
        rows={3}
      />
      <div className="vibe__quick">
        {quickIntents.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onIntentChange(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate candidate"}
      </button>
    </section>
  );
}
