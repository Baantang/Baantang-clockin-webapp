"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LocationRowActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("ยืนยันการลบสถานที่นี้?")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "ลบไม่สำเร็จ");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      {error && <span className="text-danger text-xs">{error}</span>}
      <button
        onClick={handleToggle}
        disabled={loading}
        className="text-sm text-primary underline disabled:opacity-50"
      >
        {active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-sm text-danger underline disabled:opacity-50"
      >
        ลบ
      </button>
    </div>
  );
}
