import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-6 w-full max-w-xs">
        <div className="flex flex-col items-center">
          <Logo size={56} />
          <h1 className="text-2xl font-semibold mt-4">ระบบลงเวลาทำงาน</h1>
          <p className="text-sm text-muted mt-1">เลือกช่องทางเข้าสู่ระบบ</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Link href="/login" className="app-btn-primary text-center w-full">
            พนักงาน · ลงเวลาเข้า-ออกงาน
          </Link>
          <Link
            href="/admin/login"
            className="text-sm text-ink/70 underline underline-offset-2 rounded-md px-2 py-1.5 mt-1 hover:text-ink"
          >
            เข้าสู่ระบบสำหรับผู้ดูแลระบบ
          </Link>
        </div>
      </div>
    </main>
  );
}
