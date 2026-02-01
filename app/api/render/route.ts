import { NextResponse } from "next/server";
import { markdownToHtml } from "@/lib/render/markdownToHtml";

export async function POST(request: Request) {
  const body = (await request.json()) as { content?: string };
  if (body.content === undefined) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  const html = await markdownToHtml(body.content);
  return NextResponse.json({ html });
}
