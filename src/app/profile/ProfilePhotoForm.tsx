"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePhotoForm({
  employeeId,
  hasPhoto,
}: {
  employeeId: string;
  hasPhoto: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    hasPhoto ? `/api/employees/${employeeId}/photo` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch("/api/employees/photo", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "อัปโหลดรูปไม่สำเร็จ");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-28 h-28 rounded-full overflow-hidden bg-cream flex items-center justify-center border-2 border-white shadow-sm"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="รูปโปรไฟล์" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm text-muted">เพิ่มรูป</span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-xs py-1">
          {loading ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-sm text-danger mt-3">{error}</p>}
    </div>
  );
}
