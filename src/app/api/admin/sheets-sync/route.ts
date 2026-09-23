import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { googleSheetsEnabled, sheetUrl, syncAttendanceToSheet } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!googleSheetsEnabled()) {
    return NextResponse.json(
      {
        error:
          "ยังไม่ได้ตั้งค่า Google Sheets กรุณาเพิ่ม GOOGLE_SERVICE_ACCOUNT_EMAIL และ GOOGLE_PRIVATE_KEY",
      },
      { status: 400 }
    );
  }

  const { startDate, endDate, roleId, sheetTitle, shareEmail } = await request.json();

  if (!startDate || !endDate || !sheetTitle) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
  }

  try {
    const result = await syncAttendanceToSheet({
      startDate: new Date(`${startDate}T00:00:00+07:00`),
      endDate: new Date(`${endDate}T00:00:00+07:00`),
      roleId: roleId || null,
      sheetTitle,
      shareEmail: shareEmail || null,
    });
    return NextResponse.json({ ok: true, ...result, url: sheetUrl(result.spreadsheetId) });
  } catch (e) {
    if (e instanceof Error && e.message === "NEED_SHARE_EMAIL") {
      return NextResponse.json(
        { error: "NEED_SHARE_EMAIL", needsShareEmail: true },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "ซิงก์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
