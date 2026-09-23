import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const LEAVE_TYPES = new Set(["ลากิจ", "ลาป่วย", "ลาพักร้อน", "อื่นๆ"]);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leaveType, startDate, endDate, note } = await request.json();

  if (!startDate || !LEAVE_TYPES.has(leaveType)) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  const date = new Date(`${startDate}T00:00:00+07:00`);
  const parsedEndDate = endDate ? new Date(`${endDate}T00:00:00+07:00`) : null;

  if (parsedEndDate && parsedEndDate.getTime() < date.getTime()) {
    return NextResponse.json(
      { error: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น" },
      { status: 400 }
    );
  }

  const absence = await prisma.absenceRequest.create({
    data: {
      employeeId: session.employeeId,
      date,
      endDate: parsedEndDate,
      leaveType,
      note: note || null,
      status: "pending",
    },
  });

  return NextResponse.json({ absence });
}
