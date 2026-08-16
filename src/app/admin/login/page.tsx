import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm app-card p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          เข้าสู่ระบบผู้ดูแล
        </h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}
