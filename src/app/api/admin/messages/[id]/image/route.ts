import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const message = await prisma.lineMessage.findUnique({ where: { id } });

  if (!message || !message.imageData || !message.imageMimeType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(new Uint8Array(message.imageData), {
    headers: {
      "Content-Type": message.imageMimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
