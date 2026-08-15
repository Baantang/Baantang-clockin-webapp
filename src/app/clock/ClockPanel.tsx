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
        "Location is required to clock in/out. Please allow location access and try again."
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
      setError(data.error ?? "Something went wrong");
      return;
    }

    setStatus(nextType);
    setMessage(
      nextType === "IN"
        ? `Clocked in at ${new Date().toLocaleTimeString()}`
        : `Clocked out at ${new Date().toLocaleTimeString()}`
    );
  }

  const nextType: Status = status === "IN" ? "OUT" : "IN";

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Current status:{" "}
        <span
          className={
            status === "IN"
              ? "font-semibold text-green-600"
              : "font-semibold text-gray-500"
          }
        >
          {status === "IN" ? "Clocked In" : "Clocked Out"}
        </span>
      </p>
      <button
        onClick={() => handleClock(nextType)}
        disabled={loading}
        className={`w-full rounded-md py-4 text-lg font-semibold text-white disabled:opacity-50 ${
          nextType === "IN" ? "bg-green-600" : "bg-gray-800"
        }`}
      >
        {loading
          ? "Getting location..."
          : nextType === "IN"
            ? "Clock In"
            : "Clock Out"}
      </button>
      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
