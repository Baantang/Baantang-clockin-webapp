"use client";

import { useRouter } from "next/navigation";

export default function AdminSignOutLink() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} className="text-gray-400 underline">
      Sign out
    </button>
  );
}
