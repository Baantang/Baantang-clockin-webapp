import { prisma } from "@/lib/db";
import { googleSheetsEnabled, sheetUrl } from "@/lib/googleSheets";
import { dateKey } from "@/lib/attendance";
import SheetsSyncForm from "./SheetsSyncForm";

export default async function SheetsPage() {
  const [roles, settings] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const existingSheetId = process.env.GOOGLE_SHEET_ID || settings.googleSheetId;

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
            ต้องตั้งค่า GOOGLE_SERVICE_ACCOUNT_EMAIL และ GOOGLE_PRIVATE_KEY ก่อนใช้งานฟีเจอร์นี้ได้
          </p>
        </div>
      )}

      {googleSheetsEnabled() && existingSheetId && (
        <div className="app-card p-6 mb-6" style={{ background: "var(--color-success-bg)" }}>
          <p className="text-sm text-success font-medium mb-1">เชื่อมต่อ Google Sheet แล้ว</p>
          <a
            href={sheetUrl(existingSheetId)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline"
          >
            เปิด Google Sheet →
          </a>
        </div>
      )}

      <div className="app-card p-6 max-w-lg">
        <SheetsSyncForm
          roles={roles}
          defaultStart={dateKey(firstOfMonth)}
          defaultEnd={dateKey(now)}
          disabled={!googleSheetsEnabled()}
          needsShareEmail={!existingSheetId}
        />
      </div>
    </div>
  );
}
