"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WEEKDAY_LABELS_TH, workDayNumbers, type SettingsShape } from "@/lib/attendance";

export default function SettingsForm({ settings }: { settings: SettingsShape }) {
  const router = useRouter();
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [lateGraceMinutes, setLateGraceMinutes] = useState(
    String(settings.lateGraceMinutes)
  );
  const [workDays, setWorkDays] = useState<number[]>(workDayNumbers(settings));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleDay(day: number) {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workStart,
        workEnd,
        lateGraceMinutes: Number(lateGraceMinutes),
        workDays,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">เวลาเข้างาน</label>
          <input
            type="time"
            value={workStart}
            onChange={(e) => setWorkStart(e.target.value)}
            className="app-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">เวลาเลิกงาน</label>
          <input
            type="time"
            value={workEnd}
            onChange={(e) => setWorkEnd(e.target.value)}
            className="app-input"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">
          ผ่อนผันสาย (นาที)
        </label>
        <input
          type="number"
          min={0}
          value={lateGraceMinutes}
          onChange={(e) => setLateGraceMinutes(e.target.value)}
          className="app-input max-w-[150px]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">วันทำงาน</label>
        <div className="flex gap-2 flex-wrap">
          {WEEKDAY_LABELS_TH.map((label, day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                workDays.includes(day)
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-app text-muted border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">บันทึกการตั้งค่าแล้ว</p>}
      <button type="submit" disabled={loading} className="app-btn-primary">
        {loading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}
