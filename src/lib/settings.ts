import { prisma } from "@/lib/db";
import type { SettingsShape } from "@/lib/attendance";

export async function getSettings(): Promise<SettingsShape> {
  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return settings;
}
