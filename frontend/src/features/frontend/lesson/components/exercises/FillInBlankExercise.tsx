"use client";

import { useEffect, useMemo, useState } from "react";

import { LessonQuestion } from "../../types/lesson";

interface FillInBlankExerciseProps {
  question: LessonQuestion;
  selectedAnswer: string | null;
  onAnswerChange: (value: string) => void;
  isChecked: boolean;
}

export function FillInBlankExercise({
  question,
  selectedAnswer,
  onAnswerChange,
  isChecked,
}: FillInBlankExerciseProps) {
  const choices = useMemo(() => question.options ?? [], [question.options]);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    selectedAnswer,
  );

  useEffect(() => {
    setSelectedValue(selectedAnswer ?? null);
  }, [selectedAnswer]);

  const displayText = question.questionText.includes("___")
    ? question.questionText.replace("___", selectedValue ?? "____")
    : question.questionText;

  const handleSelect = (option: string) => {
    if (isChecked) return;
    setSelectedValue(option);
    onAnswerChange(option);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Fill in the blank
        </p>
        <h3 className="mt-3 text-xl font-bold text-slate-900">{displayText}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((option) => {
          const isSelected = selectedValue === option;
          const isCorrect = isChecked && option === question.correctAnswer;
          const isWrongSelected =
            isChecked && isSelected && option !== question.correctAnswer;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={isChecked}
              className={`rounded-2xl border px-4 py-3 text-left text-base font-semibold transition ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                  : isWrongSelected
                    ? "border-rose-300 bg-rose-100 text-rose-700"
                    : isSelected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
