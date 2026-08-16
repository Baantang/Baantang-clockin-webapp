"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLOR_GROUPS, type ColorGroupValue } from "@/lib/attendance";

export default function NewEmployeeForm({
  roles,
}: {
  roles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [colorGroup, setColorGroup] = useState<ColorGroupValue>(COLOR_GROUPS[4].value);
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin, colorGroup, roleId: roleId || null }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "เพิ่มพนักงานไม่สำเร็จ");
      return;
    }

    setName("");
    setPin("");
    setRoleId("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-sm font-medium">เพิ่มพนักงาน</h2>
      <input
        type="text"
        placeholder="ชื่อ-นามสกุล"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="app-input"
        required
      />
      <input
        type="text"
        inputMode="numeric"
        placeholder="รหัส PIN 4-8 หลัก"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="app-input"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="app-input"
        >
          <option value="">— ตำแหน่ง —</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={colorGroup}
          onChange={(e) => setColorGroup(e.target.value as ColorGroupValue)}
          className="app-input"
        >
          {COLOR_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              กลุ่มสี{g.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={loading} className="app-btn-primary">
        {loading ? "กำลังเพิ่ม..." : "เพิ่มพนักงาน"}
      </button>
    </form>
  );
}
