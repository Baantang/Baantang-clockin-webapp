import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, latitude, longitude, accuracy } = await request.json();

  if (type !== "IN" && type !== "OUT") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const entry = await prisma.timeEntry.create({
    data: {
      employeeId: session.employeeId,
      type,
      latitude: typeof latitude === "number" ? latitude : null,
      longitude: typeof longitude === "number" ? longitude : null,
      accuracy: typeof accuracy === "number" ? accuracy : null,
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
