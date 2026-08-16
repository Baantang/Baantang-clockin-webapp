import { prisma } from "@/lib/db";
import SummarizeSection from "./SummarizeSection";
import AbsenceRequestRow from "./AbsenceRequestRow";
import MessageItem from "./MessageItem";
import { formatThaiDate } from "@/lib/attendance";

export default async function MessagesPage() {
  const [messages, employees, pendingAbsences, latestSummary] = await Promise.all([
    prisma.lineMessage.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
      include: { absenceRequest: true },
    }),
    prisma.employee.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.absenceRequest.findMany({
      where: { status: "pending" },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lineSummary.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1">ข้อความ LINE</h1>
        <p className="text-sm text-muted mb-6">
          ข้อความและรูปภาพจากกลุ่ม LINE ของพนักงาน ใช้สรุปด้วย AI หรือบันทึกเป็นใบลาได้
        </p>
        <SummarizeSection
          initialSummary={
            latestSummary
              ? {
                  text: latestSummary.summaryText,
                  createdAt: latestSummary.createdAt.toISOString(),
                }
              : null
          }
        />
      </div>

      {pendingAbsences.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">ใบลารออนุมัติ</h2>
          <div className="app-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-3xl">พนักงาน</th>
                  <th className="px-4 py-3 font-medium">วันที่ลา</th>
                  <th className="px-4 py-3 font-medium">หมายเหตุ</th>
                  <th className="px-4 py-3 font-medium rounded-tr-3xl"></th>
                </tr>
              </thead>
              <tbody>
                {pendingAbsences.map((a) => (
                  <AbsenceRequestRow
                    key={a.id}
                    id={a.id}
                    employeeName={a.employee?.name ?? "ไม่ทราบพนักงาน"}
                    date={formatThaiDate(a.date)}
                    note={a.note}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">ข้อความล่าสุด</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted">
            ยังไม่มีข้อความ เมื่อตั้งค่า LINE Official Account และเพิ่มเข้ากลุ่มแล้ว
            ข้อความจะแสดงที่นี่
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={{
                  id: msg.id,
                  displayName: msg.displayName,
                  timestamp: msg.timestamp.toISOString(),
                  messageType: msg.messageType,
                  text: msg.text,
                  employeeId: msg.employeeId,
                  hasAbsence: Boolean(msg.absenceRequest),
                }}
                employees={employees}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
