"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLocationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("150");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setError("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError("ไม่สามารถระบุตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseFloat(radiusMeters),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "เพิ่มสถานที่ไม่สำเร็จ");
      return;
    }

    setName("");
    setLatitude("");
    setLongitude("");
    setRadiusMeters("150");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-sm font-medium">เพิ่มสถานที่ใหม่</h2>
      <input
        type="text"
        placeholder="ชื่อสถานที่ เช่น สำนักงานใหญ่"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="app-input"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          inputMode="decimal"
          placeholder="ละติจูด"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="app-input"
          required
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="ลองจิจูด"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="app-input"
          required
        />
      </div>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="text-sm text-primary underline disabled:opacity-50"
      >
        {locating ? "กำลังระบุตำแหน่ง..." : "ใช้ตำแหน่งปัจจุบันของฉัน"}
      </button>
      <input
        type="text"
        inputMode="decimal"
        placeholder="รัศมี (เมตร)"
        value={radiusMeters}
        onChange={(e) => setRadiusMeters(e.target.value)}
        className="app-input"
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={loading} className="app-btn-primary">
        {loading ? "กำลังเพิ่ม..." : "เพิ่มสถานที่"}
      </button>
    </form>
  );
}
