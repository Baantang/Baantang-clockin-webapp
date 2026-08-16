import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClockPanel from "./ClockPanel";
import { prisma } from "@/lib/db";
import { colorGroupMeta, formatThaiDate, formatThaiTime } from "@/lib/attendance";

export default async function ClockPage() {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    redirect("/login");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    include: { role: true },
  });

  const recentEntries = await prisma.timeEntry.findMany({
    where: { employeeId: session.employeeId },
    orderBy: { timestamp: "desc" },
    take: 6,
  });

  const lastEntry = recentEntries[0];
  const meta = employee ? colorGroupMeta(employee.colorGroup) : null;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="app-card p-8 text-center">
          <Link href="/profile" className="inline-block relative mb-3">
            {employee?.photoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/employees/${employee.id}/photo`}
                alt={employee.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-cream mx-auto flex items-center justify-center text-2xl font-semibold text-muted">
                {session.name.slice(0, 1)}
              </div>
            )}
            {meta && (
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ${meta.dot} border-2 border-white`}
              />
            )}
          </Link>
          <p className="text-sm text-muted">ยินดีต้อนรับ</p>
          <h1 className="text-2xl font-semibold mb-1">{session.name}</h1>
          {employee?.role && (
            <p className="text-xs text-muted mb-6">{employee.role.name}</p>
          )}
          {!employee?.role && <div className="mb-6" />}

          <ClockPanel initialStatus={lastEntry?.type === "IN" ? "IN" : "OUT"} />

          <div className="mt-6 flex items-center justify-center text-sm">
            <Link href="/profile" className="text-primary underline">
              โปรไฟล์ของฉัน
            </Link>
          </div>
        </div>

        {recentEntries.length > 0 && (
          <div className="app-card p-6 mt-4">
            <h2 className="text-sm font-semibold mb-3">ประวัติล่าสุด</h2>
            <ul className="space-y-2">
              {recentEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted">{formatThaiDate(entry.timestamp)}</span>
                  <span className="font-medium">
                    {entry.type === "IN" ? "เข้างาน" : "ออกงาน"} ·{" "}
                    {formatThaiTime(entry.timestamp)}
                  </span>
                  {entry.type === "IN" && entry.late && (
                    <span
                      className="app-badge"
                      style={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }}
                    >
                      สาย
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
