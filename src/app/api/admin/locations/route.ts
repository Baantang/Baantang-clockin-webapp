import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, latitude, longitude, radiusMeters } = await request.json();

  if (
    !name ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อสถานที่และพิกัดให้ครบถ้วน" },
      { status: 400 }
    );
  }

  const location = await prisma.location.create({
    data: {
      name,
      latitude,
      longitude,
      radiusMeters:
        typeof radiusMeters === "number" && radiusMeters > 0 ? radiusMeters : 150,
    },
  });

  return NextResponse.json({ location });
}
