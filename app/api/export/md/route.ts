import { NextResponse } from "next/server";
import { getDocument } from "@/lib/storage/documents";
import { getExportsDir } from "@/lib/storage/paths";
import fs from "fs";
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

  const exportsDir = getExportsDir();
  const filename = `${document.id}_${Date.now()}.md`;
  const outputPath = path.join(exportsDir, filename);
  fs.writeFileSync(outputPath, document.content_md, "utf-8");

  const downloadUrl = `/api/export/download?path=${encodeURIComponent(outputPath)}`;

  return NextResponse.json({
    ok: true,
    file_path: outputPath,
    download_url: downloadUrl
  });
}
