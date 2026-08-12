"use client";

import { useAdminLessons } from "@/hooks/useAdminLessons";
import { LessonType } from "@/types/admin";

export default function AdminLessonsPage() {
  const {
    chapters,
    selectedChapterId,
    lessons,
    isLoading,
    isModalOpen,
    editingLesson,
    title,
    setTitle,
    lessonType,
    setLessonType,
    orderIndex,
    setOrderIndex,
    isSubmitting,
    handleChapterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useAdminLessons();

  const renderLessonTypeBadge = (type: LessonType) => {
    switch (Number(type)) {
      case LessonType.Vocabulary:
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
            Từ Vựng
          </span>
        );
      case LessonType.Grammar:
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            Ngữ Pháp
          </span>
        );
      case LessonType.Combined:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            Tổng Hợp
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản Lý Lesson (Bài học)
          </h1>
          <p className="text-slate-500 text-sm">
            API Endpoint:{" "}
            <code className="bg-slate-200 px-1 rounded text-xs">
              /api/app/lesson
            </code>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!selectedChapterId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          + Thêm Lesson
        </button>
      </div>

      {/* Dropdown Chọn Chapter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
        <label className="text-sm font-semibold text-slate-700">
          Chọn Chapter:
        </label>
        <select
          value={selectedChapterId}
          onChange={(e) => handleChapterChange(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none"
        >
          {chapters.map((chap) => (
            <option key={chap.id} value={chap.id}>
              {chap.title}
            </option>
          ))}
        </select>
      </div>

      {/* Bảng Danh sách Lesson */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Đang tải Lessons...
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Chưa có bài học nào trong Chapter này.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Thứ tự</th>
                <th className="px-6 py-3.5">Tiêu đề bài học</th>
                <th className="px-6 py-3.5">Loại bài học (LessonType)</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.map((les) => (
                <tr key={les.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-blue-600">
                    #{les.orderIndex}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {les.title}
                  </td>
                  <td className="px-6 py-4">
                    {renderLessonTypeBadge(les.lessonType)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(les)}
                      className="px-3 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(les.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium"
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
              {editingLesson ? "Sửa Lesson" : "Thêm Lesson Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tiêu đề bài học
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Loại bài học
                </label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value={LessonType.Vocabulary}>
                    Từ Vựng (Vocabulary)
                  </option>
                  <option value={LessonType.Grammar}>Ngữ Pháp (Grammar)</option>
                  <option value={LessonType.Combined}>
                    Tổng Hợp (Combined)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Thứ tự (OrderIndex)
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border rounded-lg text-sm"
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
