"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatThaiDateTime, dateKey } from "@/lib/attendance";

type Message = {
  id: string;
  displayName: string | null;
  timestamp: string;
  messageType: string;
  text: string | null;
  employeeId: string | null;
  hasAbsence: boolean;
};

export default function MessageItem({
  message,
  employees,
}: {
  message: Message;
  employees: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(message.employeeId ?? "");
  const [linking, setLinking] = useState(false);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [absenceDate, setAbsenceDate] = useState(dateKey(new Date(message.timestamp)));
  const [note, setNote] = useState(message.text ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLink(newEmployeeId: string) {
    setEmployeeId(newEmployeeId);
    setLinking(true);
    await fetch(`/api/admin/messages/${message.id}/link`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: newEmployeeId || null }),
    });
    setLinking(false);
    router.refresh();
  }

  async function handleCreateAbsence(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("กรุณาเชื่อมโยงข้อความนี้กับพนักงานก่อน");
      return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/admin/messages/${message.id}/absence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: absenceDate, note, employeeId }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    setShowAbsenceForm(false);
    router.refresh();
  }

  return (
    <div className="app-card px-5 py-4">
      <div className="flex items-center justify-between text-xs text-muted mb-2">
        <span>{message.displayName ?? "ไม่ทราบชื่อ"}</span>
        <span>{formatThaiDateTime(new Date(message.timestamp))}</span>
      </div>

      {message.messageType === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/admin/messages/${message.id}/image`}
          alt="รูปภาพจาก LINE"
          className="max-w-xs max-h-64 rounded-2xl border border-border"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
        <label className="text-xs text-muted">เชื่อมโยงกับพนักงาน:</label>
        <select
          value={employeeId}
          onChange={(e) => handleLink(e.target.value)}
          disabled={linking}
          className="app-input py-1 text-xs max-w-[180px]"
        >
          <option value="">— ไม่ระบุ —</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        {message.hasAbsence ? (
          <span className="app-badge bg-cream text-muted">บันทึกเป็นใบลาแล้ว</span>
        ) : (
          <button
            onClick={() => setShowAbsenceForm((v) => !v)}
            className="text-xs text-primary underline"
          >
            บันทึกเป็นใบลา
          </button>
        )}
      </div>

      {showAbsenceForm && !message.hasAbsence && (
        <form onSubmit={handleCreateAbsence} className="mt-3 space-y-2 max-w-sm">
          <input
            type="date"
            value={absenceDate}
            onChange={(e) => setAbsenceDate(e.target.value)}
            className="app-input py-1.5 text-sm"
            required
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="หมายเหตุ (ไม่บังคับ)"
            className="app-input py-1.5 text-sm"
            rows={2}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="app-btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกใบลา"}
          </button>
        </form>
      )}
    </div>
  );
}
