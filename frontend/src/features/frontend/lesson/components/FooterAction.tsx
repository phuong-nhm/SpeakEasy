interface FooterActionProps {
  canCheck: boolean;
  isChecking: boolean;
  isChecked: boolean;
  resultType: "correct" | "incorrect" | null;
  onCheck: () => void;
  onContinue: () => void;
}

export function FooterAction({
  canCheck,
  isChecking,
  isChecked,
  resultType,
  onCheck,
  onContinue,
}: FooterActionProps) {
  if (!isChecked) {
    return (
      <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            disabled={!canCheck}
            onClick={onCheck}
            className={`w-full rounded-2xl px-5 py-3.5 text-base font-bold text-white transition ${
              canCheck
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-300"
            }`}
          >
            {isChecking ? "ĐANG KIỂM TRA..." : "KIỂM TRA"}
          </button>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            resultType === "correct"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {resultType === "correct"
            ? "✅ Chúc mừng! Đáp án của bạn chính xác."
            : "❌ Sai rồi! Hãy xem lại bài học và thử câu tiếp theo."}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-2xl bg-emerald-500 px-5 py-3.5 text-base font-bold text-white transition hover:bg-emerald-600"
        >
          TIẾP TỤC
        </button>
      </div>
    </footer>
  );
}
