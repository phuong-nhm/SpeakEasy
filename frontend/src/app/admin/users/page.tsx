"use client";

import { useUserManagement } from "@/hooks/useUserManagement";
import { UserModal } from "@/components/UserModal";

export default function UsersPage() {
  const {
    users,
    roles,
    searchQuery,
    setSearchQuery,
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
        >
          + Thêm người dùng
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo username, tên hoặc email..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <th className="py-3 px-4 w-16">STT</th>
              <th className="py-3 px-4">Tài khoản</th>
              <th className="py-3 px-4">Họ và Tên</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Vai trò (Roles)</th>
              <th className="py-3 px-4 text-center w-32">Trạng thái</th>
              <th className="py-3 px-4 text-right w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.userName}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {`${item.surname || ""} ${item.name || ""}`.trim() || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.roleNames?.map((r) => (
                        <span
                          key={r}
                          className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleUserActive(item)}
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      {item.isActive ? "Hoạt động" : "Bị khóa"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteUser(item.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
