"use client";

import { useRoleManagement } from "@/hooks/useRoleManagement";
import { RoleModal } from "@/components/RoleModal";
import { PermissionModal } from "@/components/PermissionModal";

export default function RolesPage() {
  const {
    roles,
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
  } = useRoleManagement();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          onClick={openCreateRoleModal}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
        >
          + Thêm vai trò mới
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm vai trò theo tên..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <th className="py-3 px-4 w-16">STT</th>
              <th className="py-3 px-4">Tên vai trò</th>
              <th className="py-3 px-4">Đặc tính</th>
              <th className="py-3 px-4 text-center w-32">Loại Role</th>
              <th className="py-3 px-4 text-right w-48">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Không tìm thấy vai trò nào.
                </td>
              </tr>
            ) : (
              roles.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {item.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.isDefault && (
                        <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Mặc định (Default)
                        </span>
                      )}
                      {item.isPublic && (
                        <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Công khai (Public)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isStatic ? (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Cố định
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Tùy chỉnh
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openPermissionModal(item)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-100"
                    >
                      Quyền hạn
                    </button>
                    <button
                      onClick={() => openEditRoleModal(item)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      Sửa
                    </button>
                    {!item.isStatic && (
                      <button
                        onClick={() => handleDeleteRole(item.id)}
                        className="text-xs font-medium text-rose-600 hover:text-rose-800"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        editingRole={editingRole}
        onClose={closeRoleModal}
        onSave={handleSaveRole}
      />

      {/* Permission Modal */}
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
