"use client";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <section className="editor">
      <h2>Editor</h2>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your markdown here..."
      />
    </section>
  );
}
