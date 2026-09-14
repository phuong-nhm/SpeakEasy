import { useRouter } from "next/navigation";

interface CompleteScreenProps {
  xpEarned: number;
  accuracyPercent: number;
  elapsedSeconds: number;
}

export function CompleteScreen({
  xpEarned,
  accuracyPercent,
  elapsedSeconds,
}: CompleteScreenProps) {
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-emerald-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✨
        </div>

        <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Lesson complete
        </p>
        <h2 className="mt-3 text-center text-3xl font-black text-slate-900">
          Bài học hoàn tất!
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-indigo-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-600">
              XP
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              +{xpEarned}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">
              Đúng
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {accuracyPercent}%
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-600">
              Time
            </p>
            <p className="mt-2 text-lg font-black text-slate-900">
              {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-7 w-full rounded-2xl bg-indigo-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-indigo-700"
        >
          HOÀN THÀNH
        </button>
      </div>
    </div>
  );
}
