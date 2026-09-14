"use client";

import { PermissionModal } from "@/features/admin/roles/components/PermissionModal";
import { RoleFilter } from "@/features/admin/roles/components/RoleFilter";
import { RoleModal } from "@/features/admin/roles/components/RoleModal";
import { RoleTable } from "@/features/admin/roles/components/RoleTable";
import { useRoleManagement } from "@/features/admin/roles/hooks/useRoleManagement";

export default function RolesPage() {
  const {
    roles,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isRoleModalOpen,
    editingRole,
    openCreateRoleModal,
    openEditRoleModal,
    closeRoleModal,
    handleSaveRole,
    handleDeleteRole,
    isPermissionModalOpen,
    permissionRole,
    permissionData,
    openPermissionModal,
    closePermissionModal,
    handleSavePermissions,
  } = useRoleManagement();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý Vai trò & Phân quyền (Roles)
          </h1>
          <p className="text-sm text-slate-500">
            Danh sách các vai trò hệ thống và cấu hình cây phân quyền
            (Permissions) theo tiêu chuẩn ABP Framework.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateRoleModal}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          + Thêm vai trò mới
        </button>
      </div>

      <RoleFilter
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <RoleTable
        roles={roles}
        isLoading={loading}
        onPermissionClick={openPermissionModal}
        onEdit={openEditRoleModal}
        onDelete={handleDeleteRole}
      />

      <RoleModal
        isOpen={isRoleModalOpen}
        editingRole={editingRole}
        onClose={closeRoleModal}
        onSave={handleSaveRole}
      />

      <PermissionModal
        isOpen={isPermissionModalOpen}
        role={permissionRole}
        permissionData={permissionData}
        onClose={closePermissionModal}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
