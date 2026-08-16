import { prisma } from "@/lib/db";
import {
  buildDayTimelines,
  formatThaiDate,
  formatThaiTime,
} from "@/lib/attendance";

const WINDOW_START_MIN = 6 * 60; // 06:00
const WINDOW_END_MIN = 20 * 60; // 20:00
const WINDOW_RANGE = WINDOW_END_MIN - WINDOW_START_MIN;
const HOUR_MARKS = [6, 9, 12, 15, 18, 20];

function pct(min: number) {
  const clamped = Math.min(Math.max(min, WINDOW_START_MIN), WINDOW_END_MIN);
  return ((clamped - WINDOW_START_MIN) / WINDOW_RANGE) * 100;
}

export default async function TimeLogPage(props: PageProps<"/admin/timelog">) {
  const searchParams = await props.searchParams;
  const employeeIdParam = Array.isArray(searchParams.employeeId)
    ? searchParams.employeeId[0]
    : searchParams.employeeId;

  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, active: true },
  });

  const selectedId = employeeIdParam || employees.find((e) => e.active)?.id || employees[0]?.id;

  const entries = selectedId
    ? await prisma.timeEntry.findMany({
        where: { employeeId: selectedId },
        orderBy: { timestamp: "desc" },
        take: 200,
        include: { location: { select: { name: true } } },
      })
    : [];

  const timelines = buildDayTimelines(
    entries.map((e) => ({
      type: e.type,
      timestamp: e.timestamp,
      late: e.late,
      locationName: e.location?.name ?? null,
    }))
  ).slice(0, 10);

  const selectedEmployee = employees.find((e) => e.id === selectedId);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">ประวัติเวลา</h1>
      <p className="text-sm text-muted mb-6">
        ดูทุกครั้งที่ลงเวลาเข้า-ออกงานของพนักงานแต่ละคน รวมถึงการลงเวลาหลายรอบต่อวัน เช่น พักเที่ยง
      </p>

      <form className="mb-6 flex items-center gap-2">
        <select
          name="employeeId"
          defaultValue={selectedId}
          className="app-input max-w-xs"
        >
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
              {!emp.active ? " (ปิดใช้งาน)" : ""}
            </option>
          ))}
        </select>
        <button type="submit" className="app-btn-secondary py-2 px-5 text-sm">
          ดู
        </button>
      </form>

      {!selectedEmployee ? (
        <p className="text-sm text-muted">ยังไม่มีพนักงานในระบบ</p>
      ) : (
        <>
          <div className="app-card p-6 mb-6">
            <h2 className="text-sm font-semibold mb-4">
              ไทม์ไลน์การทำงาน — {selectedEmployee.name}
            </h2>
            {timelines.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีประวัติการลงเวลา</p>
            ) : (
              <div className="space-y-3">
                <div className="flex text-xs text-muted pl-24">
                  {HOUR_MARKS.map((h, i) => (
                    <span
                      key={h}
                      className="flex-1"
                      style={{ textAlign: i === 0 ? "left" : i === HOUR_MARKS.length - 1 ? "right" : "center" }}
                    >
                      {h}:00
                    </span>
                  ))}
                </div>
                {timelines.map((day) => (
                  <div key={day.dateKey} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-muted">{day.label}</span>
                    <div className="relative flex-1 h-8 bg-cream rounded-lg overflow-hidden">
                      {HOUR_MARKS.slice(1, -1).map((h) => (
                        <div
                          key={h}
                          className="absolute top-0 bottom-0 border-l border-border"
                          style={{ left: `${pct(h * 60)}%` }}
                        />
                      ))}
                      {day.segments.map((seg, i) => (
                        <div
                          key={i}
                          title={`${seg.locationName ?? "ไม่ทราบสถานที่"}${seg.late ? " · สาย" : ""}`}
                          className={`absolute top-1 bottom-1 rounded-md ${
                            seg.ongoing
                              ? "bg-primary/60"
                              : seg.late
                                ? "bg-warn"
                                : "bg-success"
                          }`}
                          style={{
                            left: `${pct(seg.startMin)}%`,
                            width: `${Math.max(pct(seg.endMin) - pct(seg.startMin), 1)}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 text-xs text-muted pt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> ตรงเวลา
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-warn inline-block" /> สาย
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/60 inline-block" /> ยังไม่ลงเวลาออก
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="app-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-3xl">วันที่</th>
                  <th className="px-4 py-3 font-medium">ประเภท</th>
                  <th className="px-4 py-3 font-medium">เวลา</th>
                  <th className="px-4 py-3 font-medium">สถานที่</th>
                  <th className="px-4 py-3 font-medium rounded-tr-3xl"></th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted">
                      ยังไม่มีประวัติการลงเวลา
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="border-t border-border">
                      <td className="px-4 py-3 text-muted">{formatThaiDate(entry.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            entry.type === "IN"
                              ? "font-medium text-success"
                              : "font-medium text-muted"
                          }
                        >
                          {entry.type === "IN" ? "เข้างาน" : "ออกงาน"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatThaiTime(entry.timestamp)}</td>
                      <td className="px-4 py-3 text-muted">
                        {entry.location?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {entry.type === "IN" && entry.late && (
                          <span className="app-badge bg-warn-bg text-warn">สาย</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
