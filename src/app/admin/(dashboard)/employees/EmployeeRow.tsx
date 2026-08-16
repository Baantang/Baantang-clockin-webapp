"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLOR_GROUPS, colorGroupMeta } from "@/lib/attendance";

type Employee = {
  id: string;
  name: string;
  active: boolean;
  colorGroup: string;
  roleId: string | null;
  hasPhoto: boolean;
};

export default function EmployeeRow({
  employee,
  roles,
}: {
  employee: Employee;
  roles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/admin/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    router.refresh();
  }

  const meta = colorGroupMeta(employee.colorGroup);

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        {employee.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/employees/${employee.id}/photo`}
            alt={employee.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-xs font-semibold text-muted">
            {employee.name.slice(0, 1)}
          </div>
        )}
      </td>
      <td className="px-4 py-3 font-medium">{employee.name}</td>
      <td className="px-4 py-3">
        <select
          value={employee.roleId ?? ""}
          onChange={(e) => patch({ roleId: e.target.value })}
          disabled={loading}
          className="app-input py-1.5 text-sm"
        >
          <option value="">— ไม่ระบุ —</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={employee.colorGroup}
          onChange={(e) => patch({ colorGroup: e.target.value })}
          disabled={loading}
          className={`app-badge border-0 ${meta.badge}`}
        >
          {COLOR_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {employee.active ? (
          <span className="app-badge bg-success-bg text-success">ทำงานอยู่</span>
        ) : (
          <span className="app-badge bg-cream text-muted">ปิดใช้งาน</span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => patch({ active: !employee.active })}
          disabled={loading}
          className="text-sm text-primary underline disabled:opacity-50"
        >
          {employee.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
        </button>
      </td>
    </tr>
  );
}
