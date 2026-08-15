import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSignOutLink from "./AdminSignOutLink";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-gray-200">
        <nav className="max-w-4xl mx-auto flex items-center gap-6 px-6 py-3 text-sm">
          <span className="font-semibold mr-2">Admin</span>
          <Link href="/admin" className="hover:underline">
            Time Logs
          </Link>
          <Link href="/admin/employees" className="hover:underline">
            Employees
          </Link>
          <Link href="/admin/messages" className="hover:underline">
            LINE Messages
          </Link>
          <span className="ml-auto flex items-center gap-4">
            <span className="text-gray-400">{session.username}</span>
            <AdminSignOutLink />
          </span>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">{children}</main>
    </div>
  );
}
