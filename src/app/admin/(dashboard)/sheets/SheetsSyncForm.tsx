"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SheetsSyncForm({
  roles,
  defaultStart,
  defaultEnd,
  disabled,
  needsShareEmail,
}: {
  roles: { id: string; name: string }[];
  defaultStart: string;
  defaultEnd: string;
  disabled: boolean;
  needsShareEmail: boolean;
}) {
  const router = useRouter();
  const [sheetTitle, setSheetTitle] = useState("");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [roleId, setRoleId] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessUrl(null);
    setLoading(true);

    const res = await fetch("/api/admin/sheets-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheetTitle,
        startDate,
        endDate,
        roleId: roleId || null,
        shareEmail: shareEmail || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.needsShareEmail) {
        setError("กรอกอีเมล Google ของคุณด้านล่างก่อน เพื่อสร้าง Sheet ใหม่และแชร์ให้คุณ");
      } else {
        setError(data.error ?? "ซิงก์ไม่สำเร็จ");
      }
      return;
    }

    const data = await res.json();
    setSuccessUrl(data.url);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1.5">ชื่อแท็บใน Sheet</label>
        <input
          type="text"
          value={sheetTitle}
          onChange={(e) => setSheetTitle(e.target.value)}
          className="app-input"
          placeholder="เช่น กลุ่ม 1"
          required
        />
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
          <label className="block text-sm font-medium mb-1.5">ถึงวันที่</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="app-input"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">
          เฉพาะตำแหน่ง (ไม่บังคับ)
        </label>
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="app-input"
        >
          <option value="">— พนักงานที่เปิดใช้งานทั้งหมด —</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      {needsShareEmail && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            อีเมล Google ของคุณ
          </label>
          <input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="app-input"
            placeholder="you@gmail.com"
          />
          <p className="text-xs text-muted mt-1">
            ใช้ครั้งแรกเท่านั้น เพื่อสร้าง Google Sheet ใหม่และแชร์ให้คุณดูได้
          </p>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      {successUrl && (
        <p className="text-sm text-success">
          ซิงก์สำเร็จ —{" "}
          <a href={successUrl} target="_blank" rel="noreferrer" className="underline">
            เปิด Google Sheet
          </a>
        </p>
      )}
      <button type="submit" disabled={loading || disabled} className="app-btn-primary">
        {loading ? "กำลังซิงก์..." : "ซิงก์กับ Google Sheet"}
      </button>
    </form>
  );
}
