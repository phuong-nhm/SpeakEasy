interface HeaderBarProps {
  progressPercent: number;
  hearts: number;
  onExit: () => void;
  showExitConfirm: boolean;
  onConfirmExit: () => void;
  onCancelExit: () => void;
}

export function HeaderBar({
  progressPercent,
  hearts,
  onExit,
  showExitConfirm,
  onConfirmExit,
  onCancelExit,
}: HeaderBarProps) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onExit}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:bg-slate-100"
            aria-label="Exit lesson"
          >
            ✕
          </button>

          <div className="flex-1 px-2">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-violet-500 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(progressPercent, 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2">
            <span className="text-lg">❤️</span>
            <span className="text-sm font-bold text-rose-600">{hearts}</span>
          </div>
        </div>
      </header>

      {showExitConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Confirm exit
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              Bạn muốn rời bài học này?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tiến độ hiện tại sẽ không được lưu nếu bạn thoát ngay bây giờ.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancelExit}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Ở lại
              </button>
              <button
                type="button"
                onClick={onConfirmExit}
                className="flex-1 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Rời khỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
