import { NextResponse } from "next/server";
import {
  deleteDocument,
  getDocument,
  updateDocument
} from "@/lib/storage/documents";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const document = getDocument(params.id);
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as {
    title?: string;
    content_md?: string;
  };
  const document = updateDocument(params.id, body);
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  deleteDocument(params.id);
  return NextResponse.json({ ok: true });
}
