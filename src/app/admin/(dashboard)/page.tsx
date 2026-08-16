import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import {
  bangkokDayRange,
  colorGroupMeta,
  computeLate,
  dateKey,
  formatThaiDate,
  formatThaiTime,
  isWorkDay,
} from "@/lib/attendance";

export default async function AdminDashboardPage() {
  const settings = await getSettings();
  const now = new Date();
  const { start, end } = bangkokDayRange(now);
  const workDayToday = isWorkDay(now, settings);
  const todayKey = dateKey(now);

  const [employees, entries, absences] = await Promise.all([
    prisma.employee.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { role: true },
    }),
    prisma.timeEntry.findMany({
      where: { timestamp: { gte: start, lt: end } },
      orderBy: { timestamp: "asc" },
    }),
    prisma.absenceRequest.findMany({
      where: { status: "approved", date: { gte: start, lt: end } },
    }),
  ]);

  const approvedLeaveEmployeeIds = new Set(
    absences.filter((a) => a.employeeId).map((a) => a.employeeId as string)
  );

  const pastDeadline = computeLate(now, settings);

  type Row = {
    employeeId: string;
    name: string;
    colorGroup: string;
    roleName: string | null;
    status: "present" | "late" | "absent" | "leave" | "pending" | "off";
    clockIn: Date | null;
    clockOut: Date | null;
  };

  const rows: Row[] = employees.map((emp) => {
    const empEntries = entries.filter((e) => e.employeeId === emp.id);
    const inEntry = empEntries.find((e) => e.type === "IN") ?? null;
    const outEntry = [...empEntries].reverse().find((e) => e.type === "OUT") ?? null;

    let status: Row["status"];
    if (inEntry) {
      status = inEntry.late ? "late" : "present";
    } else if (!workDayToday) {
      status = "off";
    } else if (approvedLeaveEmployeeIds.has(emp.id)) {
      status = "leave";
    } else if (pastDeadline) {
      status = "absent";
    } else {
      status = "pending";
    }

    return {
      employeeId: emp.id,
      name: emp.name,
      colorGroup: emp.colorGroup,
      roleName: emp.role?.name ?? null,
      status,
      clockIn: inEntry?.timestamp ?? null,
      clockOut: outEntry?.timestamp ?? null,
    };
  });

  const counts = {
    present: rows.filter((r) => r.status === "present").length,
    late: rows.filter((r) => r.status === "late").length,
    absent: rows.filter((r) => r.status === "absent").length,
    leave: rows.filter((r) => r.status === "leave").length,
  };

  const statusLabel: Record<Row["status"], string> = {
    present: "ตรงเวลา",
    late: "สาย",
    absent: "ขาดงาน",
    leave: "ลา",
    pending: "ยังไม่มา",
    off: "วันหยุด",
  };

  const statusClass: Record<Row["status"], string> = {
    present: "bg-success-bg text-success",
    late: "bg-warn-bg text-warn",
    absent: "bg-danger-bg text-danger",
    leave: "bg-blue-100 text-blue-700",
    pending: "bg-cream text-muted",
    off: "bg-cream text-muted",
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">ภาพรวมวันนี้</h1>
      <p className="text-sm text-muted mb-6">{formatThaiDate(now)}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="ตรงเวลา" value={counts.present} tone="success" />
        <StatCard label="สาย" value={counts.late} tone="warn" />
        <StatCard label="ขาดงาน" value={counts.absent} tone="danger" />
        <StatCard label="ลา" value={counts.leave} tone="muted" />
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-3xl">พนักงาน</th>
              <th className="px-4 py-3 font-medium">ตำแหน่ง</th>
              <th className="px-4 py-3 font-medium">เข้างาน</th>
              <th className="px-4 py-3 font-medium">ออกงาน</th>
              <th className="px-4 py-3 font-medium rounded-tr-3xl">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  ยังไม่มีพนักงานที่เปิดใช้งาน
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const meta = colorGroupMeta(row.colorGroup);
                return (
                  <tr key={row.employeeId} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{row.roleName ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.clockIn ? formatThaiTime(row.clockIn) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.clockOut ? formatThaiTime(row.clockOut) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`app-badge ${statusClass[row.status]}`}>
                        {statusLabel[row.status]}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-3">อ้างอิงวันที่: {todayKey}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warn" | "danger" | "muted";
}) {
  const toneClass = {
    success: "text-success",
    warn: "text-warn",
    danger: "text-danger",
    muted: "text-muted",
  }[tone];

  return (
    <div className="app-card p-5">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
