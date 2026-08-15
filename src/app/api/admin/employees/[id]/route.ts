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

  const employee = await prisma.employee.update({
    where: { id },
    data: { active: Boolean(active) },
  });

  return NextResponse.json({ id: employee.id, active: employee.active });
}
