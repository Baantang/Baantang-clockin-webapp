import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workStart, workEnd, lateGraceMinutes, workDays } = await request.json();

  if (
    typeof workStart !== "string" ||
    typeof workEnd !== "string" ||
    !/^\d{2}:\d{2}$/.test(workStart) ||
    !/^\d{2}:\d{2}$/.test(workEnd) ||
    typeof lateGraceMinutes !== "number" ||
    !Array.isArray(workDays) ||
    workDays.some((d: unknown) => typeof d !== "number")
  ) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {
      workStart,
      workEnd,
      lateGraceMinutes,
      workDays: workDays.join(","),
    },
    create: {
      id: "singleton",
      workStart,
      workEnd,
      lateGraceMinutes,
      workDays: workDays.join(","),
    },
  });

  return NextResponse.json({ settings });
}
