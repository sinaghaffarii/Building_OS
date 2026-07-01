import "dotenv/config";import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error"],
});

const permissions = [
  // System
  { key: "system.manage", module: "system", description: "Manage entire system" },

  // Organizations
  { key: "organizations.create", module: "organizations", description: "Create organizations" },
  { key: "organizations.read", module: "organizations", description: "Read organizations" },
  { key: "organizations.update", module: "organizations", description: "Update organizations" },
  { key: "organizations.delete", module: "organizations", description: "Delete organizations" },

  // Buildings
  { key: "buildings.create", module: "buildings", description: "Create buildings" },
  { key: "buildings.read", module: "buildings", description: "Read buildings" },
  { key: "buildings.update", module: "buildings", description: "Update buildings" },
  { key: "buildings.delete", module: "buildings", description: "Delete buildings" },

  // Units
  { key: "units.create", module: "units", description: "Create units" },
  { key: "units.read", module: "units", description: "Read units" },
  { key: "units.update", module: "units", description: "Update units" },
  { key: "units.delete", module: "units", description: "Delete units" },

  // Residents
  { key: "residents.create", module: "residents", description: "Create residents" },
  { key: "residents.read", module: "residents", description: "Read residents" },
  { key: "residents.update", module: "residents", description: "Update residents" },
  { key: "residents.delete", module: "residents", description: "Delete residents" },

  // Charges
  { key: "charges.create", module: "charges", description: "Create charge plans/cycles" },
  { key: "charges.read", module: "charges", description: "Read charges" },
  { key: "charges.update", module: "charges", description: "Update charges" },
  { key: "charges.delete", module: "charges", description: "Delete charges" },
  { key: "charges.calculate", module: "charges", description: "Calculate charges" },
  { key: "charges.issue", module: "charges", description: "Issue charge invoices" },

  // Invoices
  { key: "invoices.read", module: "invoices", description: "Read invoices" },
  { key: "invoices.update", module: "invoices", description: "Update invoices" },
  { key: "invoices.cancel", module: "invoices", description: "Cancel invoices" },

  // Payments
  { key: "payments.read", module: "payments", description: "Read payments" },
  { key: "payments.create", module: "payments", description: "Create payments" },
  { key: "payments.verify", module: "payments", description: "Verify payments" },
  { key: "payments.refund", module: "payments", description: "Refund payments" },

  // Expenses
  { key: "expenses.create", module: "expenses", description: "Create expenses" },
  { key: "expenses.read", module: "expenses", description: "Read expenses" },
  { key: "expenses.update", module: "expenses", description: "Update expenses" },
  { key: "expenses.delete", module: "expenses", description: "Delete expenses" },

  // Reports
  { key: "reports.read", module: "reports", description: "Read reports" },
  { key: "reports.export", module: "reports", description: "Export reports" },

  // Notifications
  { key: "notifications.send", module: "notifications", description: "Send notifications" },
  { key: "notifications.read", module: "notifications", description: "Read notifications" },

  // Audit Logs
  { key: "auditLogs.read", module: "auditLogs", description: "Read audit logs" },

  // Subscriptions
  { key: "subscriptions.read", module: "subscriptions", description: "Read subscriptions" },
  { key: "subscriptions.manage", module: "subscriptions", description: "Manage subscriptions" },
] as const;

const roles = [
  {
    key: "SUPER_ADMIN",
    name: "Super Admin",
    scope: "SYSTEM",
    description: "Full system access",
  },
  {
    key: "ORG_OWNER",
    name: "Organization Owner",
    scope: "ORGANIZATION",
    description: "Owner of an organization",
  },
  {
    key: "BUILDING_MANAGER",
    name: "Building Manager",
    scope: "BUILDING",
    description: "Manager of a building",
  },
  {
    key: "ACCOUNTANT",
    name: "Accountant",
    scope: "BUILDING",
    description: "Financial operator for a building",
  },
  {
    key: "RESIDENT",
    name: "Resident",
    scope: "BUILDING",
    description: "Resident access",
  },
] as const;

const subscriptionPlans = [
  {
    code: "FREE_TRIAL",
    name: "Free Trial",
    description: "Free trial plan for new organizations",
    maxUnits: 20,
    maxBuildings: 1,
    priceMonthly: BigInt(0),
    priceYearly: BigInt(0),
  },
  {
    code: "STARTER",
    name: "Starter",
    description: "For small residential buildings",
    maxUnits: 50,
    maxBuildings: 2,
    priceMonthly: BigInt(990000),
    priceYearly: BigInt(9900000),
  },
  {
    code: "PRO",
    name: "Professional",
    description: "For growing property managers",
    maxUnits: 300,
    maxBuildings: 10,
    priceMonthly: BigInt(2990000),
    priceYearly: BigInt(29900000),
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise",
    description: "For large-scale property management companies",
    maxUnits: null,
    maxBuildings: null,
    priceMonthly: BigInt(0),
    priceYearly: BigInt(0),
  },
] as const;

async function seedPermissions() {
  console.log("Seeding permissions...");

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        module: permission.module,
        description: permission.description,
      },
      create: {
        key: permission.key,
        module: permission.module,
        description: permission.description,
      },
    });
  }
}

async function seedRoles() {
  console.log("Seeding roles...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: {
        name: role.name,
        scope: role.scope,
        description: role.description,
        isSystem: true,
      },
      create: {
        key: role.key,
        name: role.name,
        scope: role.scope,
        description: role.description,
        isSystem: true,
      },
    });
  }
}

async function seedRolePermissions() {
  console.log("Seeding role permissions...");

  const allPermissions = await prisma.permission.findMany();
  const permissionByKey = new Map(allPermissions.map((permission) => [permission.key, permission]));

  const superAdmin = await prisma.role.findUniqueOrThrow({
    where: { key: "SUPER_ADMIN" },
  });

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdmin.id,
        permissionId: permission.id,
      },
    });
  }

  const orgOwner = await prisma.role.findUniqueOrThrow({
    where: { key: "ORG_OWNER" },
  });

  const orgOwnerPermissionKeys = [
    "organizations.read",
    "organizations.update",
    "buildings.create",
    "buildings.read",
    "buildings.update",
    "units.create",
    "units.read",
    "units.update",
    "residents.create",
    "residents.read",
    "residents.update",
    "charges.create",
    "charges.read",
    "charges.update",
    "charges.calculate",
    "charges.issue",
    "invoices.read",
    "payments.read",
    "expenses.create",
    "expenses.read",
    "expenses.update",
    "reports.read",
    "reports.export",
    "notifications.send",
    "notifications.read",
    "auditLogs.read",
    "subscriptions.read",
  ];

  for (const key of orgOwnerPermissionKeys) {
    const permission = permissionByKey.get(key);
    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: orgOwner.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: orgOwner.id,
        permissionId: permission.id,
      },
    });
  }

  const buildingManager = await prisma.role.findUniqueOrThrow({
    where: { key: "BUILDING_MANAGER" },
  });

  const buildingManagerPermissionKeys = [
    "buildings.read",
    "buildings.update",
    "units.create",
    "units.read",
    "units.update",
    "residents.create",
    "residents.read",
    "residents.update",
    "charges.create",
    "charges.read",
    "charges.update",
    "charges.calculate",
    "charges.issue",
    "invoices.read",
    "payments.read",
    "expenses.create",
    "expenses.read",
    "expenses.update",
    "reports.read",
    "notifications.send",
    "notifications.read",
    "auditLogs.read",
  ];

  for (const key of buildingManagerPermissionKeys) {
    const permission = permissionByKey.get(key);
    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: buildingManager.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: buildingManager.id,
        permissionId: permission.id,
      },
    });
  }

  const accountant = await prisma.role.findUniqueOrThrow({
    where: { key: "ACCOUNTANT" },
  });

  const accountantPermissionKeys = [
    "charges.read",
    "charges.calculate",
    "charges.issue",
    "invoices.read",
    "invoices.update",
    "payments.read",
    "payments.create",
    "payments.verify",
    "expenses.create",
    "expenses.read",
    "expenses.update",
    "reports.read",
    "reports.export",
  ];

  for (const key of accountantPermissionKeys) {
    const permission = permissionByKey.get(key);
    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: accountant.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: accountant.id,
        permissionId: permission.id,
      },
    });
  }

  const resident = await prisma.role.findUniqueOrThrow({
    where: { key: "RESIDENT" },
  });

  const residentPermissionKeys = [
    "buildings.read",
    "units.read",
    "charges.read",
    "invoices.read",
    "payments.read",
    "payments.create",
    "notifications.read",
  ];

  for (const key of residentPermissionKeys) {
    const permission = permissionByKey.get(key);
    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: resident.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: resident.id,
        permissionId: permission.id,
      },
    });
  }
}

async function seedSubscriptionPlans() {
  console.log("Seeding subscription plans...");

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        maxUnits: plan.maxUnits,
        maxBuildings: plan.maxBuildings,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        isActive: true,
      },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        maxUnits: plan.maxUnits,
        maxBuildings: plan.maxBuildings,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        isActive: true,
      },
    });
  }
}

async function seedSuperAdmin() {
  console.log("Seeding super admin...");

  await prisma.user.upsert({
    where: {
      mobile: "09120000000",
    },
    update: {
      firstName: "System",
      lastName: "Admin",
      fullName: "System Admin",
      status: "ACTIVE",
    },
    create: {
      firstName: "System",
      lastName: "Admin",
      fullName: "System Admin",
      mobile: "09120000000",
      email: "admin@building-os.local",
      status: "ACTIVE",
    },
  });
}

async function main() {
  console.log("Starting seed...");

  await seedPermissions();
  await seedRoles();
  await seedRolePermissions();
  await seedSubscriptionPlans();
  await seedSuperAdmin();

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
