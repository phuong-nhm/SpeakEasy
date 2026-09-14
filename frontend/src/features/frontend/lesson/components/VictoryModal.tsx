interface VictoryModalProps {
  isOpen: boolean;
  xpEarned: number;
  accuracyPercent: number;
  elapsedSeconds: number;
  onClose: () => void;
}

export function VictoryModal({
  isOpen,
  xpEarned,
  accuracyPercent,
  elapsedSeconds,
  onClose,
}: VictoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-violet-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-3xl">
          🏆
        </div>

        <h3 className="mt-5 text-center text-2xl font-black text-slate-900">
          Hoàn thành xuất sắc!
        </h3>
        <p className="mt-2 text-center text-sm text-slate-600">
          Bạn đã vượt qua bài học với thành tích rất tốt.
        </p>

        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3">
            <span>XP nhận được</span>
            <span className="font-bold text-violet-700">+{xpEarned}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
            <span>Tỷ lệ đúng</span>
            <span className="font-bold text-emerald-700">
              {accuracyPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
            <span>Thời gian</span>
            <span className="font-bold text-amber-700">{elapsedSeconds}s</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-3.5 text-base font-bold text-white hover:bg-violet-700"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
