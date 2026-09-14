"use client";

import { UserFilter } from "@/features/admin/users/components/UserFilter";
import { UserModal } from "@/features/admin/users/components/UserModal";
import { UserTable } from "@/features/admin/users/components/UserTable";
import { useUserManagement } from "@/features/admin/users/hooks/useUserManagement";

export default function UsersPage() {
  const {
    users,
    roles,
    loading,
    error,
    filterText,
    roleName,
    setFilterText,
    setRoleName,
    isModalOpen,
    editingUser,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveUser,
    handleDeleteUser,
    toggleUserActive,
  } = useUserManagement();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý Người dùng (Users)
          </h1>
          <p className="text-sm text-slate-500">
            Danh sách tài khoản, phân vai trò (Roles) và trạng thái tài khoản hệ
            thống ABP Identity.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          + Thêm người dùng
        </button>
      </div>

      <UserFilter
        filterText={filterText ?? ""}
        roleName={roleName ?? ""}
        roles={roles}
        onFilterTextChange={setFilterText}
        onRoleNameChange={setRoleName}
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <UserTable
        users={users}
        isLoading={loading}
        onEdit={openEditModal}
        onDelete={handleDeleteUser}
        onAssignRole={openEditModal}
        onToggleActive={toggleUserActive}
      />

      <UserModal
        isOpen={isModalOpen}
        editingUser={editingUser}
        roles={roles}
        onClose={closeModal}
        onSave={handleSaveUser}
      />
    </div>
  );
}
