"use client";

import {
  WritingTopicDto,
  TopicTypeLabels,
} from "@/features/admin/writing-topics/types/writing-topic";

interface WritingTopicTableProps {
  topics: WritingTopicDto[];
  loading: boolean;
  onEdit: (topic: WritingTopicDto) => void;
  onDelete: (id: string) => void;
}

export function WritingTopicTable({
  topics,
  loading,
  onEdit,
  onDelete,
}: WritingTopicTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
            <th className="py-3 px-4 w-16">STT</th>
            <th className="py-3 px-4 w-40">Loại bài</th>
            <th className="py-3 px-4">Đề bài (Prompt Title)</th>
            <th className="py-3 px-4 w-32 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {loading ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-400">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : topics.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-400">
                Chưa có Writing Topic nào trong Chapter này.
              </td>
            </tr>
          ) : (
            topics.map((topic, index) => {
              const badge = TopicTypeLabels[topic.topicType];
              return (
                <tr key={topic.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-500">{index + 1}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {topic.promptTitle}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(topic)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(topic.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
