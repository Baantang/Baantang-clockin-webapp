import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.role.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถลบตำแหน่งนี้ได้เนื่องจากมีพนักงานใช้งานอยู่" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
