import { prisma } from "../src/database/prisma";

async function cleanupTestData() {
  console.log("🧹 پاک‌سازی داده تستی...");

  const org = await prisma.organization.findFirst({
    where: { slug: "test-org" }
  });

  if (!org) {
    console.log("چیزی برای پاک کردن نبود.");
    return;
  }

  const buildings = await prisma.building.findMany({
    where: { organizationId: org.id },
    select: { id: true }
  });
  const buildingIds = buildings.map((b) => b.id);

  await prisma.buildingMember.deleteMany({
    where: { buildingId: { in: buildingIds } }
  });

  await prisma.building.deleteMany({
    where: { id: { in: buildingIds } }
  });

  await prisma.organization.delete({
    where: { id: org.id }
  });

  console.log("✅ داده تستی پاک شد");
}

cleanupTestData()
  .catch((e) => {
    console.error("❌ خطا در پاک‌سازی:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  // pnpm --filter @building-os/backend exec tsx prisma/cleanup-test-data.ts
