import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSignOutLink from "./AdminSignOutLink";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "วันนี้" },
  { href: "/admin/summary", label: "สรุปเวลาทำงาน" },
  { href: "/admin/timelog", label: "ประวัติเวลา" },
  { href: "/admin/employees", label: "พนักงาน" },
  { href: "/admin/locations", label: "สถานที่" },
  { href: "/admin/messages", label: "ข้อความ LINE" },
  { href: "/admin/sheets", label: "Google Sheets" },
  { href: "/admin/settings", label: "ตั้งค่า" },
  { href: "/admin/account", label: "บัญชี" },
];

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
      <header className="border-b border-border bg-card">
        <nav className="max-w-5xl mx-auto flex items-center gap-1 px-6 py-3 text-sm overflow-x-auto">
          <span className="flex items-center gap-2 mr-3 whitespace-nowrap">
            <Logo size={28} />
            <span className="font-semibold">ผู้ดูแลระบบ</span>
          </span>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full whitespace-nowrap text-ink hover:bg-cream transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-4 whitespace-nowrap pl-4">
            <span className="text-muted">{session.username}</span>
            <AdminSignOutLink />
          </span>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">{children}</main>
    </div>
  );
}
