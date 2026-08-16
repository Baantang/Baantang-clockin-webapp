import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "กรุณากรอกชื่อตำแหน่ง" }, { status: 400 });
  }

  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "มีตำแหน่งนี้อยู่แล้ว" }, { status: 409 });
  }

  const role = await prisma.role.create({ data: { name } });
  return NextResponse.json({ role });
}
