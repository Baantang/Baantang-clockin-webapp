"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LEAVE_TYPES = ["ลากิจ", "ลากิจแบบไม่รับค่าจ้าง", "ลาป่วย", "ลาพักร้อน", "อื่นๆ"];

export default function LeaveRequestForm() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leaveType,
        startDate,
        endDate: endDate || null,
        note: note || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ส่งใบลาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setStartDate("");
    setEndDate("");
    setNote("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <div>
        <label className="block text-sm font-medium mb-1.5">ประเภทการลา</label>
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="app-input"
        >
          {LEAVE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5">ตั้งแต่วันที่</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="app-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">ถึงวันที่ (ถ้ามี)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
            className="app-input"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">หมายเหตุ (ไม่บังคับ)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="app-input"
          rows={3}
          placeholder="ระบุเหตุผลหรือรายละเอียดเพิ่มเติม"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">ส่งใบลาเรียบร้อยแล้ว รอผู้ดูแลระบบอนุมัติ</p>}
      <button type="submit" disabled={loading} className="app-btn-primary w-full">
        {loading ? "กำลังส่ง..." : "ส่งใบลา"}
      </button>
    </form>
  );
}
