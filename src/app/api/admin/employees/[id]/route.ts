import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { COLOR_GROUPS } from "@/lib/attendance";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: {
    active?: boolean;
    colorGroup?: string;
    roleId?: string | null;
  } = {};

  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.colorGroup === "string" && COLOR_GROUPS.some((g) => g.value === body.colorGroup)) {
    data.colorGroup = body.colorGroup;
  }
  if ("roleId" in body) {
    data.roleId = body.roleId || null;
  }

  const employee = await prisma.employee.update({ where: { id }, data });

  return NextResponse.json({
    id: employee.id,
    active: employee.active,
    colorGroup: employee.colorGroup,
    roleId: employee.roleId,
  });
}
