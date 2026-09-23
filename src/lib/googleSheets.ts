import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { bangkokDayRange, dateKey, formatThaiTime } from "@/lib/attendance";

export function googleSheetsEnabled() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
  );
}

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) throw new Error("Google Sheets credentials not set");
  return new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

interface SyncOptions {
  startDate: Date;
  endDate: Date;
  roleId?: string | null;
  sheetTitle: string;
}

export async function syncAttendanceToSheet({
  startDate,
  endDate,
  roleId,
  sheetTitle,
}: SyncOptions) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const employees = await prisma.employee.findMany({
    where: { active: true, ...(roleId ? { roleId } : {}) },
    orderBy: { name: "asc" },
  });

  const queryStart = bangkokDayRange(startDate).start;
  const queryEnd = bangkokDayRange(endDate).end;

  const entries = employees.length
    ? await prisma.timeEntry.findMany({
        where: {
          employeeId: { in: employees.map((e) => e.id) },
          timestamp: { gte: queryStart, lt: queryEnd },
        },
        orderBy: { timestamp: "asc" },
      })
    : [];

  const days: string[] = [];
  for (
    let d = new Date(startDate);
    d.getTime() <= endDate.getTime();
    d = new Date(d.getTime() + 86400000)
  ) {
    days.push(dateKey(d));
  }

  const byEmpDay = new Map<string, Map<string, { in: Date | null; out: Date | null }>>();
  for (const e of entries) {
    const key = dateKey(e.timestamp);
    if (!byEmpDay.has(e.employeeId)) byEmpDay.set(e.employeeId, new Map());
    const dayMap = byEmpDay.get(e.employeeId)!;
    if (!dayMap.has(key)) dayMap.set(key, { in: null, out: null });
    const rec = dayMap.get(key)!;
    if (e.type === "IN") {
      if (!rec.in || e.timestamp < rec.in) rec.in = e.timestamp;
    } else if (e.type === "OUT") {
      if (!rec.out || e.timestamp > rec.out) rec.out = e.timestamp;
    }
  }

  const header: (string | number)[] = ["ลำดับ", "ชื่อ"];
  for (const day of days) {
    const label = new Date(`${day}T12:00:00+07:00`).toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "short",
    });
    header.push(`${label} เข้า`, `${label} ออก`);
  }

  const rows: (string | number)[][] = [
    [`บันทึกลงเวลา — ${sheetTitle}`],
    header,
  ];

  employees.forEach((emp, i) => {
    const row: (string | number)[] = [i + 1, emp.name];
    const dayMap = byEmpDay.get(emp.id);
    for (const day of days) {
      const rec = dayMap?.get(day);
      row.push(rec?.in ? formatThaiTime(rec.in) : "", rec?.out ? formatThaiTime(rec.out) : "");
    }
    rows.push(row);
  });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheet = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetTitle
  );
  if (!existingSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetTitle } } }],
      },
    });
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetTitle}!A1:ZZ2000`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitle}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });

  return { employeeCount: employees.length, dayCount: days.length };
}
