"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-sm text-blue-600 underline disabled:opacity-50"
    >
      {active ? "Deactivate" : "Activate"}
    </button>
  );
}
