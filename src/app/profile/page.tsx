import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { colorGroupMeta } from "@/lib/attendance";
import ProfilePhotoForm from "./ProfilePhotoForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    redirect("/login");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    include: { role: true },
  });

  if (!employee) {
    redirect("/login");
  }

  const meta = colorGroupMeta(employee.colorGroup);

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm app-card p-8">
        <Link href="/clock" className="text-sm text-primary underline">
          ← กลับหน้าลงเวลา
        </Link>
        <h1 className="text-xl font-semibold mt-3 mb-1">โปรไฟล์ของฉัน</h1>
        <p className="text-sm text-muted mb-6">{employee.name}</p>

        <ProfilePhotoForm
          employeeId={employee.id}
          hasPhoto={Boolean(employee.photoData)}
        />

        <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">ตำแหน่ง</span>
            <span className="font-medium">{employee.role?.name ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">กลุ่มสี</span>
            <span className={`app-badge ${meta.badge}`}>
              <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
