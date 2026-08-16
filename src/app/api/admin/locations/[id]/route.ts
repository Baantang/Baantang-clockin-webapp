import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { active } = await request.json();

  const location = await prisma.location.update({
    where: { id },
    data: { active: Boolean(active) },
  });

  return NextResponse.json({ id: location.id, active: location.active });
}

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
    await prisma.location.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      {
        error:
          "ไม่สามารถลบสถานที่นี้ได้เนื่องจากมีประวัติการลงเวลาผูกอยู่ กรุณาปิดใช้งานแทน",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
