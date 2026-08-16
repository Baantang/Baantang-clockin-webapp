import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const { employeeId, pin } = await request.json();

  if (!employeeId || !pin) {
    return NextResponse.json(
      { error: "กรุณาเลือกชื่อและกรอกรหัส PIN" },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee || !employee.active) {
    return NextResponse.json({ error: "รหัส PIN ไม่ถูกต้อง" }, { status: 401 });
  }

  const valid = await bcrypt.compare(pin, employee.pinHash);
  if (!valid) {
    return NextResponse.json({ error: "รหัส PIN ไม่ถูกต้อง" }, { status: 401 });
  }

  await createSession({
    role: "employee",
    employeeId: employee.id,
    name: employee.name,
  });

  return NextResponse.json({ ok: true });
}
