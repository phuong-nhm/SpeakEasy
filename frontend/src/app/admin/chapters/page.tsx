"use client";

import { useAdminChapters } from "@/hooks/useAdminChapters";

export default function AdminChaptersPage() {
  const {
    levels,
    selectedLevelId,
    chapters,
    isLoading,
    isModalOpen,
    editingChapter,
    title,
    setTitle,
    orderIndex,
    setOrderIndex,
    isSubmitting,
    handleLevelChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminChapters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản Lý Chapter (Chương)
          </h1>
          <p className="text-slate-500 text-sm">
            API Endpoint:{" "}
            <code className="bg-slate-200 px-1 rounded text-xs">
              /api/app/chapter
            </code>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!selectedLevelId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          + Thêm Chapter
        </button>
      </div>

      {/* Dropdown Lọc theo Level */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
        <label className="text-sm font-semibold text-slate-700">
          Chọn Level:
        </label>
        <select
          value={selectedLevelId}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng Danh sách Chapter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Đang tải Chapters...
          </div>
        ) : chapters.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Chưa có Chapter nào thuộc Level này.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Thứ tự (OrderIndex)</th>
                <th className="px-6 py-3.5">Tiêu đề (Title)</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chapters.map((chap) => (
                <tr key={chap.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-blue-600">
                    #{chap.orderIndex}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {chap.title}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(chap)}
                      className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(chap.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">
              {editingChapter ? "Sửa Chapter" : "Thêm Chapter Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tiêu đề Chapter
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Chapter 1: Greetings"
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thứ tự hiển thị (OrderIndex)
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
