"use client";

import { useState } from "react";
import {
  WritingTopicDto,
  CreateUpdateWritingTopicDto,
  WritingTopicType,
  ChapterOption,
} from "@/features/admin/writing-topics/types/writing-topic";

interface WritingTopicModalProps {
  isOpen: boolean;
  editingTopic: WritingTopicDto | null;
  selectedChapterId: string;
  chapters: ChapterOption[];
  onClose: () => void;
  onSubmit: (input: CreateUpdateWritingTopicDto) => void;
}

const defaultFormData: CreateUpdateWritingTopicDto = {
  chapterId: "",
  topicType: WritingTopicType.Weekly,
  promptTitle: "",
};

// Helper khởi tạo form data dựa trên prop
function getInitialFormData(
  editingTopic: WritingTopicDto | null,
  selectedChapterId: string,
): CreateUpdateWritingTopicDto {
  if (editingTopic) {
    return {
      chapterId: editingTopic.chapterId,
      topicType: editingTopic.topicType,
      promptTitle: editingTopic.promptTitle,
    };
  }
  return {
    ...defaultFormData,
    chapterId: selectedChapterId,
  };
}

export function WritingTopicModal({
  isOpen,
  editingTopic,
  selectedChapterId,
  chapters,
  onClose,
  onSubmit,
}: WritingTopicModalProps) {
  // Lưu vết props cũ để phát hiện sự thay đổi mà không cần useEffect
  const [prevProps, setPrevProps] = useState({
    editingTopic,
    selectedChapterId,
    isOpen,
  });
  const [formData, setFormData] = useState<CreateUpdateWritingTopicDto>(() =>
    getInitialFormData(editingTopic, selectedChapterId),
  );

  // Reset form ngay khi props mở modal hoặc đổi topic thay đổi
  if (
    prevProps.editingTopic !== editingTopic ||
    prevProps.selectedChapterId !== selectedChapterId ||
    prevProps.isOpen !== isOpen
  ) {
    setPrevProps({ editingTopic, selectedChapterId, isOpen });
    setFormData(getInitialFormData(editingTopic, selectedChapterId));
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.promptTitle.trim() || !formData.chapterId) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">
          {editingTopic ? "Cập nhật Writing Topic" : "Thêm Writing Topic mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chapter Select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Chapter
            </label>
            <select
              value={formData.chapterId}
              onChange={(e) =>
                setFormData({ ...formData, chapterId: e.target.value })
              }
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {chapters.length === 0 ? (
                <option value="">-- Không có Chapter nào --</option>
              ) : (
                chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Topic Type Select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Loại bài viết
            </label>
            <select
              value={formData.topicType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  topicType: Number(e.target.value) as WritingTopicType,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value={WritingTopicType.Weekly}>Weekly</option>
              <option value={WritingTopicType.Monthly}>Monthly</option>
            </select>
          </div>

          {/* Prompt Title Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Đề bài (Prompt Title)
            </label>
            <textarea
              rows={3}
              required
              value={formData.promptTitle}
              onChange={(e) =>
                setFormData({ ...formData, promptTitle: e.target.value })
              }
              placeholder="Nhập đề bài viết..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!formData.chapterId}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {editingTopic ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
