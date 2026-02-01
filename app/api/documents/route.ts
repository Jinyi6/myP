import { NextResponse } from "next/server";
import { createDocument, listDocuments } from "@/lib/storage/documents";

export async function GET() {
  const documents = listDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string };
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const document = createDocument(body.title);
  return NextResponse.json({ document });
}
