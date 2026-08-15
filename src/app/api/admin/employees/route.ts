import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, pin } = await request.json();

  if (!name || !pin || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json(
      { error: "Name and a 4-8 digit PIN are required" },
      { status: 400 }
    );
  }

  const pinHash = await bcrypt.hash(pin, 10);
  const employee = await prisma.employee.create({
    data: { name, pinHash },
  });

  return NextResponse.json({ id: employee.id, name: employee.name });
}
