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
  const { employeeId } = await request.json();

  const message = await prisma.lineMessage.update({
    where: { id },
    data: { employeeId: employeeId || null },
  });

  return NextResponse.json({ id: message.id, employeeId: message.employeeId });
}
