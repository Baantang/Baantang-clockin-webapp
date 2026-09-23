"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = { name: string; pin: string };

export default function BulkImportForm({
  roles,
}: {
  roles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [namesText, setNamesText] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const names = namesText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/employees/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names, roleId: roleId || null }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "นำเข้าไม่สำเร็จ");
      return;
    }

    const data = await res.json();
    setResults(data.results);
    setNamesText("");
    router.refresh();
  }

  function copyResults() {
    if (!results) return;
    const text = results.map((r) => `${r.name}\t${r.pin}`).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  if (!open && !results) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-primary underline"
      >
        นำเข้าพนักงานหลายคนพร้อมกัน
      </button>
    );
  }

  return (
    <div className="app-card p-6 max-w-lg mt-4">
      <h2 className="text-sm font-medium mb-3">นำเข้าพนักงานหลายคน</h2>

      {results ? (
        <div>
          <p className="text-sm text-success mb-3">
            เพิ่มพนักงาน {results.length} คนเรียบร้อยแล้ว — บันทึกรายการรหัส PIN นี้ไว้
            เพราะจะไม่แสดงอีกครั้ง
          </p>
          <div className="app-card overflow-x-auto mb-3">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">ชื่อ</th>
                  <th className="px-3 py-2 font-medium">รหัส PIN</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.name} className="border-t border-border">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 font-mono">{r.pin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3">
            <button onClick={copyResults} className="app-btn-secondary text-sm">
              คัดลอกรายการ
            </button>
            <button
              onClick={() => {
                setResults(null);
                setOpen(false);
              }}
              className="text-sm text-muted underline"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              รายชื่อ (บรรทัดละ 1 คน)
            </label>
            <textarea
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              className="app-input"
              rows={8}
              placeholder={"นางสาวชนิกาญจน์ ผาภู\nนายทรงเดช เดรือสีดา\n..."}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              ตำแหน่ง (ไม่บังคับ)
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="app-input"
            >
              <option value="">— ไม่ระบุ —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1">
              ไปเพิ่มตำแหน่งใหม่ได้ที่หน้า &quot;ตั้งค่า&quot; ก่อน แล้วกลับมาเลือกที่นี่
            </p>
          </div>
          <p className="text-xs text-muted">
            ระบบจะสร้างรหัส PIN แบบสุ่ม 4 หลักให้พนักงานแต่ละคนอัตโนมัติ
          </p>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="app-btn-primary">
              {loading ? "กำลังนำเข้า..." : "นำเข้าพนักงาน"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-muted underline"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
