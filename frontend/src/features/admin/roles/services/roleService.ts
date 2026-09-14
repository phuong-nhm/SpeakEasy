import {
  CreateIdentityRoleDto,
  GetPermissionListResultDto,
  IdentityRoleDto,
  UpdateIdentityRoleDto,
  UpdatePermissionsDto,
} from "@/features/admin/roles/types/roles";

const mockRoles: IdentityRoleDto[] = [
  {
    id: "3a0b1234-5678-90ab-cdef-111111111111",
    name: "admin",
    isDefault: false,
    isPublic: true,
    isStatic: true,
  },
  {
    id: "3a0b1234-5678-90ab-cdef-222222222222",
    name: "teacher",
    isDefault: false,
    isPublic: true,
    isStatic: false,
  },
  {
    id: "3a0b1234-5678-90ab-cdef-333333333333",
    name: "student",
    isDefault: true,
    isPublic: true,
    isStatic: false,
  },
];

const basePermissions: GetPermissionListResultDto = {
  entityDisplayName: "admin",
  groups: [
    {
      name: "AbpIdentity",
      displayName: "Quản lý Người dùng & Vai trò",
      permissions: [
        {
          name: "AbpIdentity.Roles",
          displayName: "Quản lý vai trò",
          isGranted: true,
          parentName: null,
        },
        {
          name: "AbpIdentity.Roles.Create",
          displayName: "Tạo vai trò",
          isGranted: true,
          parentName: "AbpIdentity.Roles",
        },
        {
          name: "AbpIdentity.Roles.Update",
          displayName: "Sửa vai trò",
          isGranted: true,
          parentName: "AbpIdentity.Roles",
        },
        {
          name: "AbpIdentity.Roles.Delete",
          displayName: "Xóa vai trò",
          isGranted: true,
          parentName: "AbpIdentity.Roles",
        },
        {
          name: "AbpIdentity.Users",
          displayName: "Quản lý người dùng",
          isGranted: true,
          parentName: null,
        },
        {
          name: "AbpIdentity.Users.Create",
          displayName: "Tạo người dùng",
          isGranted: true,
          parentName: "AbpIdentity.Users",
        },
        {
          name: "AbpIdentity.Users.Update",
          displayName: "Sửa người dùng",
          isGranted: true,
          parentName: "AbpIdentity.Users",
        },
      ],
    },
    {
      name: "CourseManagement",
      displayName: "Quản lý Khóa học & Bài học",
      permissions: [
        {
          name: "CourseManagement.Courses",
          displayName: "Xem khóa học",
          isGranted: true,
          parentName: null,
        },
        {
          name: "CourseManagement.Courses.Create",
          displayName: "Thêm khóa học",
          isGranted: false,
          parentName: "CourseManagement.Courses",
        },
        {
          name: "CourseManagement.Courses.Edit",
          displayName: "Sửa khóa học",
          isGranted: false,
          parentName: "CourseManagement.Courses",
        },
        {
          name: "CourseManagement.Courses.Delete",
          displayName: "Xóa khóa học",
          isGranted: false,
          parentName: "CourseManagement.Courses",
        },
      ],
    },
  ],
};

const permissionMap: Record<string, GetPermissionListResultDto> = {
  admin: clonePermissionTree(basePermissions),
  teacher: clonePermissionTree(basePermissions),
  student: clonePermissionTree(basePermissions),
};

function clonePermissionTree(
  value: GetPermissionListResultDto,
): GetPermissionListResultDto {
  return {
    entityDisplayName: value.entityDisplayName,
    groups: value.groups.map((group) => ({
      ...group,
      permissions: group.permissions.map((permission) => ({
        ...permission,
        parentName: permission.parentName ?? null,
      })),
    })),
  };
}

function getRolePermissionKey(roleName: string): string {
  return roleName.trim().toLowerCase();
}

function ensurePermissionsForRole(
  roleName: string,
): GetPermissionListResultDto {
  const key = getRolePermissionKey(roleName);

  if (!permissionMap[key]) {
    permissionMap[key] = clonePermissionTree(basePermissions);
    permissionMap[key].entityDisplayName = roleName;
  }

  return clonePermissionTree(permissionMap[key]);
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export const roleService = {
  getRoles: async (): Promise<IdentityRoleDto[]> => {
    await delay();
    return mockRoles.map((role) => ({ ...role }));
  },

  getRoleById: async (id: string): Promise<IdentityRoleDto | undefined> => {
    await delay();
    return mockRoles.find((role) => role.id === id);
  },

  createRole: async (data: CreateIdentityRoleDto): Promise<IdentityRoleDto> => {
    await delay();

    const newRole: IdentityRoleDto = {
      id: `role-${Date.now()}`,
      name: data.name,
      isDefault: data.isDefault,
      isPublic: data.isPublic,
      isStatic: false,
    };

    mockRoles.push(newRole);
    ensurePermissionsForRole(newRole.name);
    return { ...newRole };
  },

  updateRole: async (
    id: string,
    data: UpdateIdentityRoleDto,
  ): Promise<IdentityRoleDto> => {
    await delay();

    const index = mockRoles.findIndex((role) => role.id === id);

    if (index === -1) {
      throw new Error("Role not found.");
    }

    const previousRole = mockRoles[index];
    const updatedRole: IdentityRoleDto = {
      ...previousRole,
      name: data.name,
      isDefault: data.isDefault,
      isPublic: data.isPublic,
    };

    mockRoles[index] = updatedRole;

    if (previousRole.name !== data.name) {
      const previousKey = getRolePermissionKey(previousRole.name);
      const nextKey = getRolePermissionKey(data.name);

      if (permissionMap[previousKey]) {
        permissionMap[nextKey] = permissionMap[previousKey];
        delete permissionMap[previousKey];
      }
    }

    ensurePermissionsForRole(updatedRole.name);
    return { ...updatedRole };
  },

  deleteRole: async (id: string): Promise<boolean> => {
    await delay();

    const index = mockRoles.findIndex((role) => role.id === id);

    if (index === -1) {
      return false;
    }

    const [deletedRole] = mockRoles.splice(index, 1);

    if (deletedRole) {
      delete permissionMap[getRolePermissionKey(deletedRole.name)];
    }

    return true;
  },

  getPermissions: async (
    providerName: string,
    providerKey: string,
  ): Promise<GetPermissionListResultDto> => {
    await delay();

    if (providerName !== "R") {
      return ensurePermissionsForRole(providerKey || "admin");
    }

    return ensurePermissionsForRole(providerKey || "admin");
  },

  updatePermissions: async (
    providerName: string,
    providerKey: string,
    data: UpdatePermissionsDto,
  ): Promise<GetPermissionListResultDto> => {
    await delay();

    const rolePermissions = ensurePermissionsForRole(providerKey || "admin");
    const permissionMapByName = new Map<string, boolean>();

    rolePermissions.groups.forEach((group) => {
      group.permissions.forEach((permission) => {
        permissionMapByName.set(permission.name, permission.isGranted);
      });
    });

    data.permissions.forEach(({ name, isGranted }) => {
      permissionMapByName.set(name, isGranted);
    });

    const nextTree: GetPermissionListResultDto = {
      entityDisplayName: rolePermissions.entityDisplayName,
      groups: rolePermissions.groups.map((group) => ({
        ...group,
        permissions: group.permissions.map((permission) => ({
          ...permission,
          isGranted:
            permissionMapByName.get(permission.name) ?? permission.isGranted,
        })),
      })),
    };

    permissionMap[getRolePermissionKey(providerKey || "admin")] = nextTree;

    if (providerName !== "R") {
      return clonePermissionTree(nextTree);
    }

    return clonePermissionTree(nextTree);
  },
};

export default roleService;
