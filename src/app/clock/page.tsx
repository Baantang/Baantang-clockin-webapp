import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ClockPanel from "./ClockPanel";
import SignOutLink from "./SignOutLink";
import { prisma } from "@/lib/db";

export default async function ClockPage() {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    redirect("/login");
  }

  const lastEntry = await prisma.timeEntry.findFirst({
    where: { employeeId: session.employeeId },
    orderBy: { timestamp: "desc" },
  });

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 mb-1">Welcome,</p>
        <h1 className="text-2xl font-semibold mb-8">{session.name}</h1>
        <ClockPanel
          initialStatus={lastEntry?.type === "IN" ? "IN" : "OUT"}
        />
        <div className="mt-8">
          <SignOutLink />
        </div>
      </div>
    </main>
  );
}
