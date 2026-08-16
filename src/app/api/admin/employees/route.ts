import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { COLOR_GROUPS } from "@/lib/attendance";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, pin, colorGroup, roleId } = await request.json();

  if (!name || !pin || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อและรหัส PIN 4-8 หลัก" },
      { status: 400 }
    );
  }

  const validColorGroup = COLOR_GROUPS.some((g) => g.value === colorGroup)
    ? colorGroup
    : "blue";

  const pinHash = await bcrypt.hash(pin, 10);
  const employee = await prisma.employee.create({
    data: {
      name,
      pinHash,
      colorGroup: validColorGroup,
      roleId: roleId || null,
    },
  });

  return NextResponse.json({ id: employee.id, name: employee.name });
}
