"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = { id: string; name: string; employeeCount: number };

export default function RolesManager({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "เพิ่มตำแหน่งไม่สำเร็จ");
      return;
    }

    setName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("ยืนยันการลบตำแหน่งนี้?")) return;
    setError(null);
    const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ลบไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="ชื่อตำแหน่งใหม่"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="app-input"
          required
        />
        <button type="submit" disabled={loading} className="app-btn-primary shrink-0">
          เพิ่ม
        </button>
      </form>
      {error && <p className="text-sm text-danger mb-3">{error}</p>}
      <ul className="space-y-2">
        {roles.length === 0 && (
          <li className="text-sm text-muted">ยังไม่มีตำแหน่งงาน</li>
        )}
        {roles.map((role) => (
          <li
            key={role.id}
            className="flex items-center justify-between text-sm bg-app rounded-xl px-3 py-2"
          >
            <span>
              {role.name}{" "}
              <span className="text-muted">({role.employeeCount} คน)</span>
            </span>
            <button
              onClick={() => handleDelete(role.id)}
              className="text-danger underline"
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
