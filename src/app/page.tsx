import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Business App</h1>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/login"
            className="rounded-md bg-black text-white py-2.5 font-medium"
          >
            Employee Clock In
          </Link>
          <Link
            href="/admin/login"
            className="rounded-md border border-gray-300 py-2.5 font-medium"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
