import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatThaiDate, formatThaiDateTime } from "@/lib/attendance";
import LeaveRequestForm from "./LeaveRequestForm";

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "รออนุมัติ", className: "bg-warn-bg text-warn" },
  approved: { label: "อนุมัติแล้ว", className: "bg-success-bg text-success" },
  rejected: { label: "ปฏิเสธ", className: "bg-danger-bg text-danger" },
};

export default async function LeavePage() {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    redirect("/login");
  }

  const requests = await prisma.absenceRequest.findMany({
    where: { employeeId: session.employeeId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <main className="flex-1 flex items-start justify-center p-6">
      <div className="w-full max-w-sm space-y-6 py-4">
        <div className="app-card p-8">
          <h1 className="text-xl font-semibold mb-1">ยื่นใบลา</h1>
          <p className="text-sm text-muted mb-6">
            กรอกแบบฟอร์มด้านล่างเพื่อส่งใบลาให้ผู้ดูแลระบบพิจารณา
          </p>
          <LeaveRequestForm />
          <div className="mt-6 flex items-center justify-center text-sm">
            <Link href="/clock" className="text-primary underline">
              กลับหน้าลงเวลา
            </Link>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="app-card p-6">
            <h2 className="text-base font-semibold mb-4">ประวัติการลาของฉัน</h2>
            <div className="space-y-3">
              {requests.map((r) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.pending;
                const dateLabel = r.endDate
                  ? `${formatThaiDate(r.date)} – ${formatThaiDate(r.endDate)}`
                  : formatThaiDate(r.date);
                return (
                  <div key={r.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium">{r.leaveType}</span>
                      <span className={`app-badge ${meta.className}`}>{meta.label}</span>
                    </div>
                    <p className="text-sm text-muted">{dateLabel}</p>
                    {r.note && <p className="text-sm text-muted mt-1">หมายเหตุ: {r.note}</p>}
                    {r.status !== "pending" && r.decisionNote && (
                      <p className="text-sm text-muted mt-1">
                        ผู้ดูแลระบบ: {r.decisionNote}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      ส่งเมื่อ {formatThaiDateTime(r.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
