import { prisma } from "../src/database/prisma";
async function main() {
  try {
    console.log("در حال تست اتصال با Driver Adapter (pg)...");

    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;

    console.log("✅ اتصال موفق بود:", result);
  } catch (error) {
    console.error("❌ خطا در اتصال:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
