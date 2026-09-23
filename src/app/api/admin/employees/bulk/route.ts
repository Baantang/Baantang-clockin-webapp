import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { COLOR_GROUPS } from "@/lib/attendance";

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { names, roleId } = await request.json();

  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json(
      { error: "กรุณากรอกรายชื่ออย่างน้อย 1 คน" },
      { status: 400 }
    );
  }

  const results: { name: string; pin: string }[] = [];
  let colorIndex = 0;

  for (const raw of names) {
    if (typeof raw !== "string") continue;
    // Strip trailing notes like "(รอลงในระบบ)" that aren't part of the name.
    const name = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (!name) continue;

    const pin = randomPin();
    const pinHash = await bcrypt.hash(pin, 10);
    const colorGroup = COLOR_GROUPS[colorIndex % COLOR_GROUPS.length].value;
    colorIndex++;

    await prisma.employee.create({
      data: { name, pinHash, colorGroup, roleId: roleId || null },
    });
    results.push({ name, pin });
  }

  return NextResponse.json({ results });
}
