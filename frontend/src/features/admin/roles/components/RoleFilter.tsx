export interface RoleFilterProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export function RoleFilter({
  searchQuery,
  onSearchQueryChange,
}: RoleFilterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        placeholder="Tìm kiếm vai trò theo tên..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
    </div>
  );
}
