import { prisma } from "@/lib/db";
import { formatThaiDate, formatThaiDateTime } from "@/lib/attendance";
import LeaveDecisionRow from "./LeaveDecisionRow";

const STATUS_META: Record<string, { label: string; className: string }> = {
  approved: { label: "อนุมัติแล้ว", className: "bg-success-bg text-success" },
  rejected: { label: "ปฏิเสธ", className: "bg-danger-bg text-danger" },
};

function dateRangeLabel(date: Date, endDate: Date | null) {
  return endDate ? `${formatThaiDate(date)} – ${formatThaiDate(endDate)}` : formatThaiDate(date);
}

export default async function LeavesPage() {
  const [pending, decided] = await Promise.all([
    prisma.absenceRequest.findMany({
      where: { status: "pending" },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.absenceRequest.findMany({
      where: { status: { in: ["approved", "rejected"] } },
      include: { employee: true },
      orderBy: { decidedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1">ใบลา</h1>
        <p className="text-sm text-muted">คำขอลาจากพนักงาน อนุมัติหรือปฏิเสธได้ที่นี่</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">รออนุมัติ ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">ไม่มีใบลารออนุมัติ</p>
        ) : (
          <div className="app-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-3xl">พนักงาน</th>
                  <th className="px-4 py-3 font-medium">ประเภท</th>
                  <th className="px-4 py-3 font-medium">วันที่ลา</th>
                  <th className="px-4 py-3 font-medium">หมายเหตุ</th>
                  <th className="px-4 py-3 font-medium rounded-tr-3xl"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <LeaveDecisionRow
                    key={r.id}
                    id={r.id}
                    employeeName={r.employee?.name ?? "ไม่ทราบพนักงาน"}
                    leaveType={r.leaveType}
                    dateLabel={dateRangeLabel(r.date, r.endDate)}
                    note={r.note}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">ประวัติ</h2>
        {decided.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีประวัติการลา</p>
        ) : (
          <div className="app-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-3xl">พนักงาน</th>
                  <th className="px-4 py-3 font-medium">ประเภท</th>
                  <th className="px-4 py-3 font-medium">วันที่ลา</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium rounded-tr-3xl">ตัดสินใจเมื่อ</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((r) => {
                  const meta = STATUS_META[r.status];
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">
                        {r.employee?.name ?? "ไม่ทราบพนักงาน"}
                      </td>
                      <td className="px-4 py-3">{r.leaveType}</td>
                      <td className="px-4 py-3">{dateRangeLabel(r.date, r.endDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`app-badge ${meta?.className ?? ""}`}>
                          {meta?.label ?? r.status}
                        </span>
                        {r.decisionNote && (
                          <p className="text-xs text-muted mt-1">{r.decisionNote}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {r.decidedAt ? formatThaiDateTime(r.decidedAt) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
