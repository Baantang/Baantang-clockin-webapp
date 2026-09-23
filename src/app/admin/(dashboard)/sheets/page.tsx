import { prisma } from "@/lib/db";
import { googleSheetsEnabled } from "@/lib/googleSheets";
import { dateKey } from "@/lib/attendance";
import SheetsSyncForm from "./SheetsSyncForm";

export default async function SheetsPage() {
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Google Sheets</h1>
      <p className="text-sm text-muted mb-6">
        ส่งออกเวลาเข้า-ออกงานจริงไปยัง Google Sheet ในรูปแบบตารางบันทึกลงเวลา
      </p>

      {!googleSheetsEnabled() && (
        <div className="app-card p-6 mb-6 border-danger">
          <p className="text-sm text-danger font-medium mb-1">
            ยังไม่ได้เชื่อมต่อ Google Sheets
          </p>
          <p className="text-sm text-muted">
            ต้องตั้งค่า GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY และ GOOGLE_SHEET_ID
            ก่อนใช้งานฟีเจอร์นี้ได้
          </p>
        </div>
      )}

      <div className="app-card p-6 max-w-lg">
        <SheetsSyncForm
          roles={roles}
          defaultStart={dateKey(firstOfMonth)}
          defaultEnd={dateKey(now)}
          disabled={!googleSheetsEnabled()}
        />
      </div>
    </div>
  );
}
