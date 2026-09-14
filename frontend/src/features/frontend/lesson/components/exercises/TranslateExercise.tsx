"use client";

import { useEffect, useState } from "react";

import { LessonQuestion } from "../../types/lesson";

interface TranslateExerciseProps {
  question: LessonQuestion;
  selectedAnswer: string | null;
  onAnswerChange: (value: string) => void;
}

export function TranslateExercise({
  question,
  selectedAnswer,
  onAnswerChange,
}: TranslateExerciseProps) {
  const [answer, setAnswer] = useState<string>(selectedAnswer ?? "");

  useEffect(() => {
    setAnswer(selectedAnswer ?? "");
  }, [selectedAnswer]);

  const handleChange = (value: string) => {
    setAnswer(value);
    onAnswerChange(value);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
          Translate from Vietnamese
        </p>
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {question.vietnameseTranslation ??
            question.sourceText ??
            question.questionText}
        </h3>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Câu trả lời của bạn
        </span>
        <textarea
          value={answer}
          onChange={(event) => handleChange(event.target.value)}
          rows={4}
          placeholder="Viết câu trả lời của bạn ở đây..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />
      </label>
    </div>
  );
}
