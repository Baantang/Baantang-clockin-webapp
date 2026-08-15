import { prisma } from "@/lib/db";
import NewEmployeeForm from "./NewEmployeeForm";
import EmployeeToggle from "./EmployeeToggle";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Employees</h1>

      <div className="mb-8 max-w-sm">
        <NewEmployeeForm />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{emp.name}</td>
                <td className="px-4 py-2">
                  {emp.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <EmployeeToggle id={emp.id} active={emp.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
