"use client";

import { SentenceExerciseDto } from "../../types/lesson";

interface AnswerQuestionExerciseProps {
  question: SentenceExerciseDto;
  selectedText: string;
  onTextChange: (value: string) => void;
  isChecked: boolean;
}

export function AnswerQuestionExercise({
  question,
  selectedText,
  onTextChange,
  isChecked,
}: AnswerQuestionExerciseProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Answer question
        </p>
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {question.promptText}
        </h3>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Trả lời của bạn
        </span>
        <textarea
          value={selectedText}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={isChecked}
          rows={4}
          placeholder="Viết câu trả lời của bạn ở đây..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
    </div>
  );
}
