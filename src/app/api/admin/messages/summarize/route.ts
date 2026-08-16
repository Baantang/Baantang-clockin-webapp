import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { anthropicEnabled, summarizeLineMessages } from "@/lib/anthropic";
import { bangkokDayRange } from "@/lib/attendance";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!anthropicEnabled()) {
    return NextResponse.json(
      {
        error:
          "ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY กรุณาเพิ่มในไฟล์ .env เพื่อใช้งานฟีเจอร์นี้",
      },
      { status: 400 }
    );
  }

  const { period } = await request.json();
  const now = new Date();

  let periodStart: Date;
  const periodEnd = bangkokDayRange(now).end;
  if (period === "week") {
    periodStart = bangkokDayRange(new Date(now.getTime() - 6 * 86400000)).start;
  } else {
    periodStart = bangkokDayRange(now).start;
  }

  const messages = await prisma.lineMessage.findMany({
    where: { timestamp: { gte: periodStart, lt: periodEnd } },
    orderBy: { timestamp: "asc" },
  });

  try {
    const summaryText = await summarizeLineMessages(
      messages.map((m) => ({
        displayName: m.displayName,
        timestamp: m.timestamp,
        messageType: m.messageType,
        text: m.text,
        imageData: m.imageData ? new Uint8Array(m.imageData) : null,
        imageMimeType: m.imageMimeType,
      }))
    );

    const summary = await prisma.lineSummary.create({
      data: { periodStart, periodEnd, summaryText },
    });

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json(
      { error: "สรุปข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
