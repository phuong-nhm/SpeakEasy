"use client";

import { useState, useMemo } from "react";
import {
  IdentityRoleDto,
  CreateIdentityRoleDto,
  UpdateIdentityRoleDto,
  GetPermissionListResultDto,
  UpdatePermissionsDto,
} from "@/types/roles";

const MOCK_ROLES: IdentityRoleDto[] = [
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

const MOCK_PERMISSIONS: GetPermissionListResultDto = {
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

export function useRoleManagement() {
  // Pass MOCK_ROLES directly as initial state
  const [roles, setRoles] = useState<IdentityRoleDto[]>(MOCK_ROLES);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Thêm / Sửa Role State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IdentityRoleDto | null>(null);

  // Modal Phân Quyền (Permission Modal) State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionRole, setPermissionRole] = useState<IdentityRoleDto | null>(
    null,
  );
  const [permissionData, setPermissionData] =
    useState<GetPermissionListResultDto | null>(null);

  // Filter theo ô tìm kiếm
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [roles, searchQuery]);

  // --- ROLE MODAL HANDLERS ---
  const openCreateRoleModal = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: IdentityRoleDto) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleSaveRole = (
    data: CreateIdentityRoleDto | UpdateIdentityRoleDto,
  ) => {
    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...data } : r)),
      );
    } else {
      const newRole: IdentityRoleDto = {
        id: crypto.randomUUID(),
        name: data.name,
        isDefault: data.isDefault,
        isPublic: data.isPublic,
        isStatic: false,
      };
      setRoles((prev) => [...prev, newRole]);
    }
    closeRoleModal();
  };

  const handleDeleteRole = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
      setRoles((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // --- PERMISSION MODAL HANDLERS ---
  const openPermissionModal = (role: IdentityRoleDto) => {
    setPermissionRole(role);
    setPermissionData(MOCK_PERMISSIONS);
    setIsPermissionModalOpen(true);
  };

  const closePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setPermissionRole(null);
    setPermissionData(null);
  };

  const handleSavePermissions = (updateData: UpdatePermissionsDto) => {
    console.log(
      "Saving permissions for role:",
      permissionRole?.name,
      updateData,
    );
    closePermissionModal();
  };

  return {
    roles: filteredRoles,
    searchQuery,
    setSearchQuery,
    // Role Modal
    isRoleModalOpen,
    editingRole,
    openCreateRoleModal,
    openEditRoleModal,
    closeRoleModal,
    handleSaveRole,
    handleDeleteRole,
    // Permission Modal
    isPermissionModalOpen,
    permissionRole,
    permissionData,
    openPermissionModal,
    closePermissionModal,
    handleSavePermissions,
  };
}
