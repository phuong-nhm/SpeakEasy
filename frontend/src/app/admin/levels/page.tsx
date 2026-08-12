"use client";

import { useAdminLevels } from "@/hooks/useAdminLevels";

export default function AdminLevelsPage() {
  const {
    levels,
    isLoading,
    isSubmitting,
    isModalOpen,
    editingLevel,
    name,
    setName,
    description,
    setDescription,
    error,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminLevels();

  return (
    <div className="space-y-6">
      {/* Header trang & Nút Thêm Level */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản Lý Level (Trình độ)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            API Endpoint:{" "}
            <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">
              /api/app/level
            </code>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-sm flex items-center"
        >
          + Thêm Level Mới
        </button>
      </div>

      {/* Bảng danh sách Level */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Đang tải dữ liệu Level...
          </div>
        ) : levels.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Chưa có Level nào. Hãy thêm mới!
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Tên Level (Name)</th>
                <th className="px-6 py-3.5">Mô tả (Description)</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-md">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-medium transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form Thêm / Sửa Level */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingLevel ? "Chỉnh Sửa Level" : "Thêm Level Mới"}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ô Name (Text) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Level A1 - Sơ cấp"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                />
              </div>

              {/* Ô Description (Textarea) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả ngắn cho trình độ này..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Đang lưu..."
                    : editingLevel
                      ? "Cập nhật"
                      : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
