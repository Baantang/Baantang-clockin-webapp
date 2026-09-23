"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveDecisionRow({
  id,
  employeeName,
  leaveType,
  dateLabel,
  note,
}: {
  id: string;
  employeeName: string;
  leaveType: string;
  dateLabel: string;
  note: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function decide(status: "approved" | "rejected", decisionNote?: string) {
    setLoading(true);
    await fetch(`/api/admin/absences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, decisionNote }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="border-t border-border align-top">
      <td className="px-4 py-3 font-medium">{employeeName}</td>
      <td className="px-4 py-3">{leaveType}</td>
      <td className="px-4 py-3">{dateLabel}</td>
      <td className="px-4 py-3 text-muted max-w-xs truncate">{note ?? "—"}</td>
      <td className="px-4 py-3">
        {showReject ? (
          <div className="flex flex-col gap-2 items-end">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เหตุผล (ไม่บังคับ)"
              className="app-input py-1 text-sm max-w-[180px]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReject(false)}
                disabled={loading}
                className="text-sm text-muted underline disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => decide("rejected", reason || undefined)}
                disabled={loading}
                className="text-sm text-danger underline disabled:opacity-50"
              >
                ยืนยันปฏิเสธ
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => decide("approved")}
              disabled={loading}
              className="text-sm text-success underline disabled:opacity-50"
            >
              อนุมัติ
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={loading}
              className="text-sm text-danger underline disabled:opacity-50"
            >
              ปฏิเสธ
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
