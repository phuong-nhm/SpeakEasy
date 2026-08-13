"use client";

import { useState } from "react";
import { useAdminVocabularies } from "@/hooks/useAdminVocabularies";

export default function AdminVocabularyPage() {
  const {
    lessons,
    selectedLessonId,
    vocabularies,
    isLoading,
    isModalOpen,
    editingVocabulary,
    isImportModalOpen,
    word,
    setWord,
    meaning,
    setMeaning,
    imageUrl,
    setImageUrl,
    audioUrl,
    setAudioUrl,
    distractor,
    setDistractor,
    isSubmitting,
    handleLessonChange,
    openCreateModal,
    openEditModal,
    closeModal,
    openImportModal,
    closeImportModal,
    handleSubmit,
    handleImportMany,
    handleDelete,
  } = useAdminVocabularies();

  // State quản lý text JSON khi paste vào Import Modal
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Xử lý Import JSON
  const handleParseAndImport = async () => {
    setJsonError(null);
    try {
      const parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        setJsonError("Dữ liệu JSON phải là một mảng (Array) các từ vựng!");
        return;
      }

      // Gọi hook xử lý bulk create
      await handleImportMany(parsedData);
      setJsonInput("");
    } catch (err) {
      setJsonError(
        "Định dạng JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp!",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản Lý Từ Vựng (Vocabulary)
          </h1>
          <p className="text-slate-500 text-sm">
            API Endpoint:{" "}
            <code className="bg-slate-200 px-1 rounded text-xs">
              /api/app/vocabulary
            </code>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={openImportModal}
            disabled={!selectedLessonId}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            📥 Import Hàng Loạt
          </button>
          <button
            onClick={openCreateModal}
            disabled={!selectedLessonId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            + Thêm Từ Vựng
          </button>
        </div>
      </div>

      {/* Dropdown Lọc theo Lesson */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
        <label className="text-sm font-semibold text-slate-700">
          Chọn Bài học (Lesson):
        </label>
        <select
          value={selectedLessonId}
          onChange={(e) => handleLessonChange(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {lessons.length === 0 ? (
            <option value="">Không có bài học nào</option>
          ) : (
            lessons.map((les) => (
              <option key={les.id} value={les.id}>
                {les.title}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Bảng Danh sách Từ vựng */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Đang tải từ vựng...
          </div>
        ) : vocabularies.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {selectedLessonId
              ? "Chưa có từ vựng nào thuộc Bài học này."
              : "Vui lòng chọn Bài học để xem danh sách."}
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
              <tr>
                <th className="px-6 py-3.5">Từ (Word)</th>
                <th className="px-6 py-3.5">Nghĩa (Meaning)</th>
                <th className="px-6 py-3.5">Hình ảnh</th>
                <th className="px-6 py-3.5">Âm thanh</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vocabularies.map((vocab) => (
                <tr key={vocab.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {vocab.word}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {vocab.meaning}
                  </td>
                  <td className="px-6 py-4 text-xs max-w-[150px] truncate">
                    {vocab.imageUrl ? (
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        title={vocab.imageUrl}
                      >
                        {vocab.imageUrl}
                      </span>
                    ) : (
                      <span className="text-slate-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs max-w-[150px] truncate">
                    {vocab.audioUrl ? (
                      <span
                        className="text-blue-600 hover:underline cursor-pointer"
                        title={vocab.audioUrl}
                      >
                        {vocab.audioUrl}
                      </span>
                    ) : (
                      <span className="text-slate-400">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(vocab)}
                      className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(vocab.id)}
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

      {/* Modal Thêm / Sửa Đơn Lẻ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800">
              {editingVocabulary ? "Sửa Từ Vựng" : "Thêm Từ Vựng Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Từ vựng (Word)
                </label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Ví dụ: Apple"
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nghĩa (Meaning)
                </label>
                <input
                  type="text"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="Ví dụ: Quả táo"
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Đường dẫn ảnh (ImageUrl)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Đường dẫn âm thanh (AudioUrl)
                </label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Đáp án nhiễu Quiz (Distractor)
                </label>
                <input
                  type="text"
                  value={distractor}
                  onChange={(e) => setDistractor(e.target.value)}
                  placeholder="Ví dụ: Quả cam"
                  className="w-full px-3.5 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Hàng Loạt (JSON Bulk Import) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-slate-800">
                Import Từ Vựng Hàng Loạt (JSON)
              </h2>
              <button
                onClick={closeImportModal}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Dán danh sách từ vựng dạng JSON array. Ví dụ:
              </p>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                {`[
  {
    "word": "Hello",
    "meaning": "Xin chào",
    "imageUrl": "https://example.com/hello.png",
    "audioUrl": "https://example.com/hello.mp3"
  }
]`}
              </pre>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Chuỗi dữ liệu JSON
              </label>
              <textarea
                rows={8}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Dán chuỗi JSON vào đây..."
                className="w-full p-3 border rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-200 bg-slate-50"
              />
            </div>

            {jsonError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {jsonError}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2 border-t">
              <button
                type="button"
                onClick={closeImportModal}
                className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleParseAndImport}
                disabled={isSubmitting || !jsonInput.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Đang Import..." : "Xác nhận Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
