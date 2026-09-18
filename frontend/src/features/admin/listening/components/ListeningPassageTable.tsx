"use client";

import { ChapterDto } from "@/features/admin/chapters/types/chapter";
import { ListeningPassageDto } from "@/features/admin/listening/types/listening";

interface ListeningPassageTableProps {
  passages: ListeningPassageDto[];
  chapters: ChapterDto[];
  isLoading: boolean;
  onOpenEditModal: (passage: ListeningPassageDto) => void;
  onDelete: (id: string) => void;
}

const truncateText = (value: string, maxLength: number) =>
  value.length > maxLength
    ? `${value.slice(0, maxLength).trimEnd()}...`
    : value;

export function ListeningPassageTable({
  passages,
  chapters,
  isLoading,
  onOpenEditModal,
  onDelete,
}: ListeningPassageTableProps) {
  const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]));

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Đang tải dữ liệu bài nghe...
      </div>
    );
  }

  if (passages.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Chưa có bài nghe nào trong level này. Vui lòng chọn chapter và tạo
        passage đầu tiên.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">STT</th>
            <th className="px-6 py-3">Chapter</th>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Transcript</th>
            <th className="px-6 py-3 text-center">Câu hỏi</th>
            <th className="px-6 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {passages.map((passage, index) => {
            const chapter = chapterMap.get(passage.chapterId);

            return (
              <tr key={passage.id} className="hover:bg-slate-50/50 align-top">
                <td className="px-6 py-4 font-medium text-slate-400">
                  {index + 1}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {chapter ? `Chapter ${chapter.orderIndex}` : "Chapter"}
                    </span>
                    <span className="max-w-[220px] truncate font-medium text-slate-800">
                      {chapter?.title || passage.chapterId}
                    </span>
                  </div>
                </td>

                <td className="max-w-xs px-6 py-4 font-medium text-slate-800">
                  <div className="max-w-[260px] truncate">{passage.title}</div>
                  {passage.audioUrl ? (
                    <p className="mt-1 max-w-[260px] truncate text-[11px] text-slate-400">
                      Audio: {passage.audioUrl}
                    </p>
                  ) : null}
                </td>

                <td className="max-w-xl px-6 py-4 text-slate-500">
                  <p className="max-w-[420px] leading-6">
                    {truncateText(passage.transcript, 180)}
                  </p>
                </td>

                <td className="px-6 py-4 text-center font-semibold text-slate-700">
                  {passage.questions.length}
                </td>

                <td className="space-x-2 px-6 py-4 text-right">
                  <button
                    onClick={() => onOpenEditModal(passage)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(passage.id)}
                    className="font-medium text-rose-600 hover:text-rose-800"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
