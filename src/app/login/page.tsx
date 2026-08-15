import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "employee") {
    redirect("/clock");
  }

  const employees = await prisma.employee.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-1">
          Employee Clock In
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Select your name and enter your PIN
        </p>
        <LoginForm employees={employees} />
      </div>
    </main>
  );
}
