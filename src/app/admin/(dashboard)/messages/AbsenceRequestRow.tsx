"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AbsenceRequestRow({
  id,
  employeeName,
  date,
  note,
}: {
  id: string;
  employeeName: string;
  date: string;
  note: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function decide(status: "approved" | "rejected") {
    setLoading(true);
    await fetch(`/api/admin/absences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 font-medium">{employeeName}</td>
      <td className="px-4 py-3">{date}</td>
      <td className="px-4 py-3 text-muted max-w-xs truncate">{note ?? "—"}</td>
      <td className="px-4 py-3">
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => decide("approved")}
            disabled={loading}
            className="text-sm text-success underline disabled:opacity-50"
          >
            อนุมัติ
          </button>
          <button
            onClick={() => decide("rejected")}
            disabled={loading}
            className="text-sm text-danger underline disabled:opacity-50"
          >
            ปฏิเสธ
          </button>
        </div>
      </td>
    </tr>
  );
}
