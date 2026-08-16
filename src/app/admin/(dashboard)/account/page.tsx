import { getSession } from "@/lib/session";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">บัญชีผู้ใช้</h1>
      <p className="text-sm text-muted mb-6">
        เข้าสู่ระบบในชื่อ {session && "username" in session ? session.username : ""}
      </p>

      <div className="app-card p-6 max-w-sm">
        <h2 className="text-sm font-medium mb-3">เปลี่ยนรหัสผ่าน</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
