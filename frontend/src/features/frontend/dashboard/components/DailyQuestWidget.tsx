const quests = [
  {
    label: "Complete 2 lessons today",
    progress: 1,
    total: 2,
    accent: "bg-emerald-500",
  },
  {
    label: "Review 10 vocabulary words",
    progress: 7,
    total: 10,
    accent: "bg-indigo-500",
  },
  {
    label: "Win 1 streak bonus challenge",
    progress: 0,
    total: 1,
    accent: "bg-amber-500",
  },
];

export function DailyQuestWidget() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Daily quest
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Mục tiêu hôm nay
          </h2>
        </div>
        <div className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
          +150 XP
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {quests.map((quest) => (
          <div
            key={quest.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>{quest.label}</span>
              <span className="font-semibold">
                {quest.progress}/{quest.total}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${quest.accent}`}
                style={{
                  width: `${Math.min((quest.progress / quest.total) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-indigo-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">🔥 Momentum</p>
        <p className="mt-2 leading-6">
          Bạn đang đi đúng hướng. Hoàn thành 1 lesson nữa để mở khóa khóa học
          tiếp theo.
        </p>
      </div>
    </aside>
  );
}
