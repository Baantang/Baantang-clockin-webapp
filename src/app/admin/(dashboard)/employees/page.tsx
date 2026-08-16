import { prisma } from "@/lib/db";
import NewEmployeeForm from "./NewEmployeeForm";
import EmployeeRow from "./EmployeeRow";

export default async function EmployeesPage() {
  const [employees, roles] = await Promise.all([
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: { role: true },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">พนักงาน</h1>

      <div className="app-card p-6 mb-6 max-w-md">
        <NewEmployeeForm roles={roles} />
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-3xl"></th>
              <th className="px-4 py-3 font-medium">ชื่อ</th>
              <th className="px-4 py-3 font-medium">ตำแหน่ง</th>
              <th className="px-4 py-3 font-medium">กลุ่มสี</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium rounded-tr-3xl"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                employee={{
                  id: emp.id,
                  name: emp.name,
                  active: emp.active,
                  colorGroup: emp.colorGroup,
                  roleId: emp.roleId,
                  hasPhoto: Boolean(emp.photoData),
                }}
                roles={roles}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
