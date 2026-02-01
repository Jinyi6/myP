import { NextResponse } from "next/server";
import { getDocument } from "@/lib/storage/documents";
import { markdownToHtml } from "@/lib/render/markdownToHtml";
import { getExportsDir } from "@/lib/storage/paths";
import path from "path";

export async function POST(request: Request) {
  const body = (await request.json()) as { doc_id?: string };
  if (!body.doc_id) {
    return NextResponse.json({ error: "doc_id is required" }, { status: 400 });
  }
  const document = getDocument(body.doc_id);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const htmlBody = await markdownToHtml(document.content_md);
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" />
<style>
  body { font-family: 'Inter', system-ui, sans-serif; margin: 40px; }
  h1, h2, h3 { color: #1b1b1f; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });

  const exportsDir = getExportsDir();
  const filename = `${document.id}_${Date.now()}.pdf`;
  const outputPath = path.join(exportsDir, filename);
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "24px", bottom: "24px", left: "24px", right: "24px" }
  });
  await browser.close();

  const downloadUrl = `/api/export/download?path=${encodeURIComponent(outputPath)}`;

  return NextResponse.json({
    ok: true,
    file_path: outputPath,
    download_url: downloadUrl
  });
}
