import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";
import RolesManager from "./RolesManager";

export default async function SettingsPage() {
  const [settings, roles] = await Promise.all([
    getSettings(),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { employees: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-1">ตั้งค่าเวลาทำงาน</h1>
        <p className="text-sm text-muted mb-6">
          กำหนดเวลาเข้างาน-เลิกงาน และวันทำงาน ใช้คำนวณสถานะมาสาย/ขาดงานของพนักงาน
        </p>
        <div className="app-card p-6 max-w-lg">
          <SettingsForm settings={settings} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-1">ตำแหน่งงาน</h2>
        <p className="text-sm text-muted mb-6">
          เพิ่มตำแหน่งงานเพื่อกำหนดให้พนักงานภายหลังได้
        </p>
        <div className="app-card p-6 max-w-lg">
          <RolesManager
            roles={roles.map((r) => ({
              id: r.id,
              name: r.name,
              employeeCount: r._count.employees,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
