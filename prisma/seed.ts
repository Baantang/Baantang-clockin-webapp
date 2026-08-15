import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUsername = "admin";
  const adminPassword = "changeme123";

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: adminUsername,
        passwordHash: await bcrypt.hash(adminPassword, 10),
      },
    });
    console.log(`Created admin "${adminUsername}" / "${adminPassword}"`);
  } else {
    console.log(`Admin "${adminUsername}" already exists`);
  }

  const testEmployeeName = "Test Employee";
  const testEmployeePin = "1234";

  const existingEmployee = await prisma.employee.findFirst({
    where: { name: testEmployeeName },
  });

  if (!existingEmployee) {
    await prisma.employee.create({
      data: {
        name: testEmployeeName,
        pinHash: await bcrypt.hash(testEmployeePin, 10),
      },
    });
    console.log(`Created employee "${testEmployeeName}" / PIN "${testEmployeePin}"`);
  } else {
    console.log(`Employee "${testEmployeeName}" already exists`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
