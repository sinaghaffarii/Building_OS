import { prisma } from "../../database/prisma";

export async function getRolePermissionKeys(roleId: string): Promise<string[]> {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    select: {
      permission: {
        select: { key: true }
      }
    }
  });

  return rolePermissions.map((rp) => rp.permission.key);
}
