import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { date, note, employeeId } = await request.json();

  if (!date) {
    return NextResponse.json({ error: "กรุณาระบุวันที่ลา" }, { status: 400 });
  }

  const message = await prisma.lineMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "ไม่พบข้อความ" }, { status: 404 });
  }

  const resolvedEmployeeId = employeeId || message.employeeId;
  if (!resolvedEmployeeId) {
    return NextResponse.json(
      { error: "กรุณาเชื่อมโยงข้อความนี้กับพนักงานก่อน" },
      { status: 400 }
    );
  }

  const existing = await prisma.absenceRequest.findUnique({
    where: { lineMessageId: id },
  });
  if (existing) {
    return NextResponse.json({ error: "ข้อความนี้ถูกบันทึกเป็นใบลาแล้ว" }, { status: 409 });
  }

  const absence = await prisma.absenceRequest.create({
    data: {
      employeeId: resolvedEmployeeId,
      date: new Date(`${date}T12:00:00+07:00`),
      note: note || message.text || null,
      lineMessageId: id,
      status: "pending",
    },
  });

  return NextResponse.json({ absence });
}
