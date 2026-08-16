import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { computeLate, findMatchingLocation } from "@/lib/attendance";
import { getSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, latitude, longitude, accuracy } = await request.json();

  if (type !== "IN" && type !== "OUT") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json(
      { error: "จำเป็นต้องเปิดตำแหน่งที่ตั้ง (Location) เพื่อลงเวลา" },
      { status: 400 }
    );
  }

  const locations = await prisma.location.findMany({ where: { active: true } });

  let locationId: string | null = null;
  if (locations.length > 0) {
    const match = findMatchingLocation(latitude, longitude, locations);
    if (!match) {
      return NextResponse.json(
        { error: "คุณอยู่นอกพื้นที่ที่กำหนด ไม่สามารถลงเวลาได้" },
        { status: 403 }
      );
    }
    locationId = match.id;
  }

  let late = false;
  if (type === "IN") {
    const settings = await getSettings();
    late = computeLate(new Date(), settings);
  }

  const entry = await prisma.timeEntry.create({
    data: {
      employeeId: session.employeeId,
      type,
      latitude,
      longitude,
      accuracy: typeof accuracy === "number" ? accuracy : null,
      late,
      locationId,
    },
  });

  return NextResponse.json({ ok: true, entry });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lastEntry = await prisma.timeEntry.findFirst({
    where: { employeeId: session.employeeId },
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json({ lastEntry });
}
