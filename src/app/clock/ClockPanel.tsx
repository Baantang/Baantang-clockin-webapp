"use client";

import { useState } from "react";

type Status = "IN" | "OUT";

export default function ClockPanel({
  initialStatus,
}: {
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [late, setLate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getLocation(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleClock(nextType: Status) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const position = await getLocation();
    if (!position) {
      setLoading(false);
      setError(
        "จำเป็นต้องเปิดสิทธิ์เข้าถึงตำแหน่งที่ตั้ง (Location) กรุณาอนุญาตแล้วลองใหม่อีกครั้ง"
      );
      return;
    }

    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: nextType,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const data = await res.json();
    setStatus(nextType);
    setLate(Boolean(data.entry?.late));
    setMessage(
      nextType === "IN"
        ? `ลงเวลาเข้างานเมื่อ ${new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })} น.`
        : `ลงเวลาออกงานเมื่อ ${new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })} น.`
    );
  }

  const nextType: Status = status === "IN" ? "OUT" : "IN";

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        สถานะปัจจุบัน:{" "}
        <span
          className={
            status === "IN" ? "font-semibold text-success" : "font-semibold text-muted"
          }
        >
          {status === "IN" ? "อยู่ระหว่างเวลางาน" : "ยังไม่ได้ลงเวลาเข้างาน"}
        </span>
      </p>
      <button
        onClick={() => handleClock(nextType)}
        disabled={loading}
        className={`w-full rounded-3xl py-6 text-lg font-semibold text-on-primary disabled:opacity-50 shadow-sm ${
          nextType === "IN" ? "bg-success" : "bg-ink"
        }`}
      >
        {loading
          ? "กำลังระบุตำแหน่ง..."
          : nextType === "IN"
            ? "ลงเวลาเข้างาน"
            : "ลงเวลาออกงาน"}
      </button>
      {message && (
        <div className="mt-4">
          <p className="text-sm text-success font-medium">{message}</p>
          {nextType === "OUT" && late && (
            <span className="app-badge mt-2" style={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }}>
              สาย
            </span>
          )}
          {nextType === "OUT" && !late && (
            <span className="app-badge mt-2" style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
              ตรงเวลา
            </span>
          )}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
    </div>
  );
}
