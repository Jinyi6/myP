import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VibeMD",
  description: "Markdown-first vibe editor with reviewable diffs."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
