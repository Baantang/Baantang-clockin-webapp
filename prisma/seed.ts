import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

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

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const office = await prisma.location.upsert({
    where: { id: "seed-office-hq" },
    update: {},
    create: {
      id: "seed-office-hq",
      name: "สำนักงานใหญ่",
      latitude: 13.7563,
      longitude: 100.5018,
      radiusMeters: 200,
    },
  });
  console.log(`Location "${office.name}" ready`);

  const roleNames = ["พนักงานทั่วไป", "หัวหน้างาน", "ฝ่ายบัญชี"];
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roles[name] = role.id;
  }

  const employeeSeeds = [
    { name: "สมชาย ใจดี", pin: "1234", colorGroup: "red", role: "หัวหน้างาน" },
    { name: "สมหญิง รักงาน", pin: "1111", colorGroup: "blue", role: "พนักงานทั่วไป" },
    { name: "วิชัย ขยันมาก", pin: "2222", colorGroup: "green", role: "พนักงานทั่วไป" },
    { name: "มานี มีสุข", pin: "3333", colorGroup: "yellow", role: "ฝ่ายบัญชี" },
    { name: "ประสิทธิ์ ตั้งใจ", pin: "4444", colorGroup: "purple", role: "พนักงานทั่วไป" },
    { name: "อรุณี แจ่มใส", pin: "5555", colorGroup: "orange", role: "พนักงานทั่วไป" },
  ];

  const employees: { id: string; name: string }[] = [];
  for (const seed of employeeSeeds) {
    let employee = await prisma.employee.findFirst({ where: { name: seed.name } });
    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          name: seed.name,
          pinHash: await bcrypt.hash(seed.pin, 10),
          colorGroup: seed.colorGroup,
          roleId: roles[seed.role],
        },
      });
      console.log(`Created employee "${seed.name}" / PIN "${seed.pin}"`);
    }
    employees.push({ id: employee.id, name: employee.name });
  }

  // Sample attendance history for the last 5 days so the summary/dashboard
  // pages have something realistic to render.
  const existingEntries = await prisma.timeEntry.count();
  if (existingEntries === 0) {
    for (let day = 4; day >= 0; day--) {
      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        // Skip one employee entirely on day 1 to simulate an absence.
        if (day === 1 && i === 4) continue;

        const late = i === 2 || (day === 3 && i === 0);
        const inHour = late ? 8 : 7;
        const inMinute = late ? 20 : 50;

        await prisma.timeEntry.create({
          data: {
            employeeId: emp.id,
            type: "IN",
            timestamp: daysAgo(day, inHour, inMinute),
            latitude: office.latitude,
            longitude: office.longitude,
            accuracy: 15,
            late,
            locationId: office.id,
          },
        });
        await prisma.timeEntry.create({
          data: {
            employeeId: emp.id,
            type: "OUT",
            timestamp: daysAgo(day, 17, 5),
            latitude: office.latitude,
            longitude: office.longitude,
            accuracy: 15,
            locationId: office.id,
          },
        });
      }
    }
    console.log("Seeded sample attendance history");
  }

  // Sample LINE group messages, including one that looks like an absence
  // paper photo an employee sent in.
  const existingMessages = await prisma.lineMessage.count();
  if (existingMessages === 0) {
    await prisma.lineMessage.create({
      data: {
        lineUserId: "seed-line-user-1",
        displayName: "อรุณี แจ่มใส",
        groupId: "seed-group-1",
        messageType: "text",
        text: "ลาป่วยวันนี้ค่ะ ปวดหัวมาก ขอโทษที่แจ้งกระชั้นชิด",
        timestamp: daysAgo(1, 7, 30),
        employeeId: employees[5]?.id,
      },
    });
    await prisma.lineMessage.create({
      data: {
        lineUserId: "seed-line-user-2",
        displayName: "วิชัย ขยันมาก",
        groupId: "seed-group-1",
        messageType: "text",
        text: "วันนี้รถเสียครับ กำลังหาทางมา น่าจะสายประมาณครึ่งชั่วโมง",
        timestamp: daysAgo(0, 7, 45),
        employeeId: employees[2]?.id,
      },
    });
    console.log("Seeded sample LINE messages");
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
