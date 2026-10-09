"use client";

import { SentenceExerciseDto } from "../../types/lesson";

interface FillInBlankExerciseProps {
  question: SentenceExerciseDto;
  selectedText: string;
  onTextChange: (value: string) => void;
  isChecked: boolean;
}

export function FillInBlankExercise({
  question,
  selectedText,
  onTextChange,
  isChecked,
}: FillInBlankExerciseProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Fill in the blank
        </p>
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {question.displaySentence}
        </h3>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Điền từ còn thiếu
        </span>
        <input
          type="text"
          value={selectedText}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={isChecked}
          placeholder="Nhập từ vào đây..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
    </div>
  );
}
