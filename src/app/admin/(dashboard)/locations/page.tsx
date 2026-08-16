import { prisma } from "@/lib/db";
import NewLocationForm from "./NewLocationForm";
import LocationRowActions from "./LocationRowActions";

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">สถานที่ทำงาน</h1>
      <p className="text-sm text-muted mb-6">
        พนักงานต้องอยู่ในระยะรัศมีของสถานที่ที่กำหนดไว้อย่างน้อย 1 แห่ง จึงจะลงเวลาได้
      </p>

      <div className="app-card p-6 mb-6 max-w-md">
        <NewLocationForm />
      </div>

      <div className="app-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-3xl">ชื่อสถานที่</th>
              <th className="px-4 py-3 font-medium">พิกัด</th>
              <th className="px-4 py-3 font-medium">รัศมี (เมตร)</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium rounded-tr-3xl"></th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  ยังไม่มีสถานที่ที่กำหนด — เพิ่มสถานที่แรกด้านบน
                </td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{loc.name}</td>
                  <td className="px-4 py-3 text-muted">
                    <a
                      className="text-primary underline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    >
                      {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                    </a>
                  </td>
                  <td className="px-4 py-3">{loc.radiusMeters}</td>
                  <td className="px-4 py-3">
                    {loc.active ? (
                      <span className="app-badge bg-success-bg text-success">
                        เปิดใช้งาน
                      </span>
                    ) : (
                      <span className="app-badge bg-cream text-muted">ปิดใช้งาน</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <LocationRowActions id={loc.id} active={loc.active} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
