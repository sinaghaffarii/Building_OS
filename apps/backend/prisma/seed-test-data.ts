import { prisma } from "../src/database/prisma";

/** * Seed تستی برای Tenant / RBAC * می‌سازد: Organization -> Building -> BuildingMember * برای همه کاربران موجود، عضویت با نقش MANAGER در ساختمان تست ایجاد می‌کند. *
 * برای پاک کردن بعدی، از cleanupTestData() استفاده کن.
 */

const TEST_ORG_SLUG = "test-org";
const TEST_BUILDING_NAME = "Test Building";
const MANAGER_ROLE_KEY = "BUILDING_MANAGER"; // اگر key نقش مدیر چیز دیگری‌ست، همین‌جا عوض کن

async function seedTestData() {
  console.log("🌱 شروع seed داده تستی...\n");

  // 1) پیدا کردن یک کاربر برای مالکیت سازمان
  const TEST_MANAGER_MOBILE = "09912508255";
  const owner = await prisma.user.findFirst({
    where: {
      mobile: TEST_MANAGER_MOBILE,
    },
  });

  if (!owner) {
    throw new Error("هیچ کاربری در دیتابیس نیست. اول با OTP لاگین کن تا حداقل یک User ساخته شود.");
  }
  console.log(`👤 Owner انتخاب شد: ${owner.id}`);

  // 2) پیدا کردن نقش MANAGER (باید از seed اصلی permission/role ساخته شده باشد)
  const managerRole = await prisma.role.findFirst({
    where: { key: MANAGER_ROLE_KEY },
  });

  if (!managerRole) {
    throw new Error(
      `نقش با key="${MANAGER_ROLE_KEY}" پیدا نشد. اول seed اصلی Role/Permission را اجرا کن.`,
    );
  }
  console.log(`🔑 Role پیدا شد: ${managerRole.id} (${managerRole.key})`);

  // 3) ساخت یا پیدا کردن Organization (idempotent بر اساس slug)
  let organization = await prisma.organization.findFirst({
    where: { slug: TEST_ORG_SLUG },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Test Org",
        slug: TEST_ORG_SLUG,
        type: "INDIVIDUAL_MANAGER",
        status: "ACTIVE",
        ownerUserId: owner.id,
      },
    });
    console.log(`🏢 Organization ساخته شد: ${organization.id}`);
  } else {
    console.log(`🏢 Organization از قبل موجود بود: ${organization.id}`);
  }

  // 4) ساخت یا پیدا کردن Building
  let building = await prisma.building.findFirst({
    where: {
      organizationId: organization.id,
      name: TEST_BUILDING_NAME,
    },
  });

  if (!building) {
    building = await prisma.building.create({
      data: {
        organizationId: organization.id,
        name: TEST_BUILDING_NAME,
        type: "RESIDENTIAL",
        address: "Tehran, Test Street",
        status: "ACTIVE",
      },
    });
    console.log(`🏬 Building ساخته شد: ${building.id}`);
  } else {
    console.log(`🏬 Building از قبل موجود بود: ${building.id}`);
  }

  // 5) ساخت BuildingMember برای owner (به عنوان MANAGER)
  const existingMembership = await prisma.buildingMember.findFirst({
    where: {
      buildingId: building.id,
      userId: owner.id,
    },
  });

  if (!existingMembership) {
    const membership = await prisma.buildingMember.create({
      data: {
        buildingId: building.id,
        userId: owner.id,
        roleId: managerRole.id,
        status: "ACTIVE",
      },
    });

    console.log(`✅ BuildingMember ساخته شد: ${membership.id}`);
  } else {
    const membership = await prisma.buildingMember.update({
      where: {
        id: existingMembership.id,
      },
      data: {
        roleId: managerRole.id,
        status: "ACTIVE",
      },
    });

    console.log(`✅ BuildingMember آپدیت شد و ACTIVE شد: ${membership.id}`);
  }

  // 6) چاپ اطلاعات لازم برای تست
  console.log("\n────────────────────────────────────");
  console.log("📌 اطلاعات برای تست endpoint:");
  console.log(`   X-Building-Id : ${building.id}`);
  console.log(`   User Id       : ${owner.id}`);
  console.log(`   Role          : ${managerRole.key}`);
  console.log("────────────────────────────────────\n");
  console.log("🎉 seed داده تستی با موفقیت انجام شد");
}

seedTestData()
  .catch((error) => {
    console.error("❌ خطا در seed داده تستی:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// pnpm --filter @building-os/backend exec tsx prisma/seed-test-data.ts
