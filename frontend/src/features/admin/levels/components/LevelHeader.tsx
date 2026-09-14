"use client";

interface LevelHeaderProps {
  onOpenCreate: () => void;
}

export function LevelHeader({ onOpenCreate }: LevelHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Level</h1>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập các cấp độ học cho hệ thống
        </p>
      </div>
      <button
        onClick={onOpenCreate}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm active:scale-95"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Thêm Level Mới
      </button>
    </div>
  );
}
