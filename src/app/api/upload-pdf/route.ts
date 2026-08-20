import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const uid = formData.get("uid") as string | null;

  if (!file || !uid) {
    return NextResponse.json({ error: "Arquivo e uid são obrigatórios." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Apenas PDFs são aceitos." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "PDF deve ter no máximo 10 MB." }, { status: 400 });
  }

  const blob = await put(`pbl/submissions/${uid}/proof.pdf`, file, {
    access: "public",
    contentType: "application/pdf",
    allowOverwrite: true,
  });

  return NextResponse.json({ url: blob.url });
}
