import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { googleSheetsEnabled, syncAttendanceToSheet } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!googleSheetsEnabled()) {
    return NextResponse.json(
      {
        error:
          "ยังไม่ได้ตั้งค่า Google Sheets กรุณาเพิ่ม GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY และ GOOGLE_SHEET_ID",
      },
      { status: 400 }
    );
  }

  const { startDate, endDate, roleId, sheetTitle } = await request.json();

  if (!startDate || !endDate || !sheetTitle) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  try {
    const result = await syncAttendanceToSheet({
      startDate: new Date(`${startDate}T00:00:00+07:00`),
      endDate: new Date(`${endDate}T00:00:00+07:00`),
      roleId: roleId || null,
      sheetTitle,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "ซิงก์ไม่สำเร็จ ตรวจสอบว่าแชร์สิทธิ์แก้ไข Google Sheet ให้บัญชีบริการแล้ว" },
      { status: 500 }
    );
  }
}
