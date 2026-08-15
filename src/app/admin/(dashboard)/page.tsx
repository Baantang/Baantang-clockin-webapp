import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const entries = await prisma.timeEntry.findMany({
    orderBy: { timestamp: "desc" },
    take: 200,
    include: { employee: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Time Logs</h1>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">No clock in/out entries yet.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Employee</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{entry.employee.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        entry.type === "IN"
                          ? "text-green-600 font-medium"
                          : "text-gray-500 font-medium"
                      }
                    >
                      {entry.type === "IN" ? "Clock In" : "Clock Out"}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {entry.timestamp.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {entry.latitude != null && entry.longitude != null ? (
                      <a
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`}
                      >
                        {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
