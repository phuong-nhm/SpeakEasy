interface UserWritingFilterProps {
  userId?: string;
  topicId?: string;
  searchQuery: string;
  onUserIdChange: (value: string) => void;
  onTopicIdChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function UserWritingFilter({
  userId = "",
  topicId = "",
  searchQuery,
  onUserIdChange,
  onTopicIdChange,
  onSearchChange,
}: UserWritingFilterProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên học viên, chủ đề hoặc nội dung bài viết..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 pl-9 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
      </div>

      <div className="grid w-full gap-3 sm:max-w-md sm:grid-cols-2">
        <input
          type="text"
          value={userId}
          onChange={(event) => onUserIdChange(event.target.value)}
          placeholder="Filter theo userId"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />

        <input
          type="text"
          value={topicId}
          onChange={(event) => onTopicIdChange(event.target.value)}
          placeholder="Filter theo topicId"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
