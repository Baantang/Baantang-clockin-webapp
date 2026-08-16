"use client";

import { useState } from "react";
import { formatThaiDateTime } from "@/lib/attendance";

type Summary = { text: string; createdAt: string };

export default function SummarizeSection({
  initialSummary,
}: {
  initialSummary: Summary | null;
}) {
  const [summary, setSummary] = useState<Summary | null>(initialSummary);
  const [loading, setLoading] = useState<"day" | "week" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSummarize(period: "day" | "week") {
    setLoading(period);
    setError(null);

    const res = await fetch("/api/admin/messages/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period }),
    });

    setLoading(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "สรุปข้อความไม่สำเร็จ");
      return;
    }

    const data = await res.json();
    setSummary({ text: data.summary.summaryText, createdAt: data.summary.createdAt });
  }

  return (
    <div className="app-card p-6">
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => handleSummarize("day")}
          disabled={loading !== null}
          className="app-btn-primary text-sm disabled:opacity-50"
        >
          {loading === "day" ? "กำลังสรุป..." : "สรุปวันนี้ด้วย AI"}
        </button>
        <button
          onClick={() => handleSummarize("week")}
          disabled={loading !== null}
          className="app-btn-secondary text-sm disabled:opacity-50"
        >
          {loading === "week" ? "กำลังสรุป..." : "สรุป 7 วันล่าสุด"}
        </button>
      </div>
      {error && <p className="text-sm text-danger mb-3">{error}</p>}
      {summary ? (
        <div>
          <p className="text-xs text-muted mb-2">
            สรุปล่าสุดเมื่อ {formatThaiDateTime(new Date(summary.createdAt))}
          </p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{summary.text}</p>
        </div>
      ) : (
        <p className="text-sm text-muted">ยังไม่มีการสรุป กดปุ่มด้านบนเพื่อเริ่มสรุปข้อความด้วย AI</p>
      )}
    </div>
  );
}
