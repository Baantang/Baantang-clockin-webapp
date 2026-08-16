import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import {
  bangkokDayRange,
  bangkokWeekday,
  buildAttendanceSummary,
  dateKey,
} from "@/lib/attendance";

type Period = "day" | "week" | "month" | "all";

function parsePeriod(value: string | string[] | undefined): Period {
  if (value === "week" || value === "month" || value === "all") return value;
  return "day";
}

function mondayOf(date: Date): Date {
  const wd = bangkokWeekday(date); // 0=Sun..6=Sat
  const diffToMonday = wd === 0 ? 6 : wd - 1;
  return new Date(date.getTime() - diffToMonday * 86400000);
}

function firstOfMonth(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  return new Date(`${y}-${m}-01T12:00:00+07:00`);
}

function lastOfMonth(date: Date): Date {
  const first = firstOfMonth(date);
  const nextMonthFirst = new Date(first);
  nextMonthFirst.setUTCMonth(nextMonthFirst.getUTCMonth() + 1);
  return new Date(nextMonthFirst.getTime() - 86400000);
}

export default async function SummaryPage(props: PageProps<"/admin/summary">) {
  const searchParams = await props.searchParams;
  const period = parsePeriod(searchParams.period);
  const anchorParam = Array.isArray(searchParams.date)
    ? searchParams.date[0]
    : searchParams.date;
  const anchor = anchorParam ? new Date(`${anchorParam}T12:00:00+07:00`) : new Date();

  let rangeStart: Date;
  let rangeEnd: Date;
  if (period === "day") {
    rangeStart = anchor;
    rangeEnd = anchor;
  } else if (period === "week") {
    rangeStart = mondayOf(anchor);
    rangeEnd = new Date(rangeStart.getTime() + 6 * 86400000);
  } else if (period === "month") {
    rangeStart = firstOfMonth(anchor);
    rangeEnd = lastOfMonth(anchor);
  } else {
    const [firstEmployee, firstEntry] = await Promise.all([
      prisma.employee.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
      prisma.timeEntry.findFirst({ orderBy: { timestamp: "asc" }, select: { timestamp: true } }),
    ]);
    const candidates = [firstEmployee?.createdAt, firstEntry?.timestamp, anchor].filter(
      (d): d is Date => Boolean(d)
    );
    rangeStart = new Date(Math.min(...candidates.map((d) => d.getTime())));
    rangeEnd = anchor;
  }

  const settings = await getSettings();
  const queryStart = bangkokDayRange(rangeStart).start;
  const queryEnd = bangkokDayRange(rangeEnd).end;

  const [employees, entries, absences] = await Promise.all([
    prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.timeEntry.findMany({
      where: { timestamp: { gte: queryStart, lt: queryEnd } },
      select: { employeeId: true, type: true, timestamp: true, late: true },
    }),
    prisma.absenceRequest.findMany({
      where: { status: "approved", date: { gte: queryStart, lt: queryEnd } },
      select: { employeeId: true, date: true, status: true },
    }),
  ]);

  const summary = buildAttendanceSummary(
    employees,
    entries,
    absences,
    settings,
    rangeStart,
    rangeEnd
  );

  const totals = summary.reduce(
    (acc, row) => ({
      presentDays: acc.presentDays + row.presentDays,
      lateDays: acc.lateDays + row.lateDays,
      absentDays: acc.absentDays + row.absentDays,
      leaveDays: acc.leaveDays + row.leaveDays,
      totalHours: acc.totalHours + row.totalHours,
    }),
    { presentDays: 0, lateDays: 0, absentDays: 0, leaveDays: 0, totalHours: 0 }
  );

  const dateValue = anchorParam ?? dateKey(anchor);

  function periodHref(p: Period) {
    return `/admin/summary?period=${p}${anchorParam ? `&date=${anchorParam}` : ""}`;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">สรุปเวลาทำงาน</h1>
      <p className="text-sm text-muted mb-6">
        {period === "day" && "สรุปรายวัน"}
        {period === "week" && "สรุปรายสัปดาห์ (จันทร์ - อาทิตย์)"}
        {period === "month" &&
          `สรุปรายเดือน (${anchor.toLocaleDateString("th-TH", {
            timeZone: "Asia/Bangkok",
            month: "long",
            year: "numeric",
          })})`}
        {period === "all" && "สรุปทั้งหมด"}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {(["day", "week", "month", "all"] as Period[]).map((p) => (
            <Link
              key={p}
              href={periodHref(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                period === p
                  ? "bg-primary text-on-primary"
                  : "bg-cream text-ink hover:bg-cream-dark"
              }`}
            >
              {p === "day" && "รายวัน"}
              {p === "week" && "รายสัปดาห์"}
              {p === "month" && "รายเดือน"}
              {p === "all" && "ทั้งหมด"}
            </Link>
          ))}
        </div>
        {period !== "all" && (
          <form className="flex items-center gap-2">
            <input type="hidden" name="period" value={period} />
            <input
              type="date"
              name="date"
              defaultValue={dateValue}
              className="app-input py-1.5 text-sm max-w-[170px]"
            />
            <button type="submit" className="app-btn-secondary py-1.5 px-4 text-sm">
              ไป
            </button>
          </form>
        )}
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-3xl">พนักงาน</th>
              <th className="px-4 py-3 font-medium">ตรงเวลา</th>
              <th className="px-4 py-3 font-medium">สาย</th>
              <th className="px-4 py-3 font-medium">ขาดงาน</th>
              <th className="px-4 py-3 font-medium">ลา</th>
              <th className="px-4 py-3 font-medium rounded-tr-3xl">ชั่วโมงรวม</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  ไม่มีข้อมูลในช่วงเวลานี้
                </td>
              </tr>
            ) : (
              summary.map((row) => (
                <tr key={row.employeeId} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{row.employeeName}</td>
                  <td className="px-4 py-3 text-success">{row.presentDays}</td>
                  <td className="px-4 py-3 text-warn">{row.lateDays}</td>
                  <td className="px-4 py-3 text-danger">{row.absentDays}</td>
                  <td className="px-4 py-3">{row.leaveDays}</td>
                  <td className="px-4 py-3">{row.totalHours} ชม.</td>
                </tr>
              ))
            )}
          </tbody>
          {summary.length > 0 && (
            <tfoot>
              <tr className="border-t border-border font-semibold bg-cream">
                <td className="px-4 py-3">รวม</td>
                <td className="px-4 py-3 text-success">{totals.presentDays}</td>
                <td className="px-4 py-3 text-warn">{totals.lateDays}</td>
                <td className="px-4 py-3 text-danger">{totals.absentDays}</td>
                <td className="px-4 py-3">{totals.leaveDays}</td>
                <td className="px-4 py-3">{Math.round(totals.totalHours * 10) / 10} ชม.</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
