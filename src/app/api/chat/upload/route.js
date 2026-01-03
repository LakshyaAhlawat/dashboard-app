import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const originalName = typeof file.name === "string" ? file.name : "file";
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;

    const blob = await put(`chat-attachments/${uniqueName}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Failed to upload chat attachment", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
