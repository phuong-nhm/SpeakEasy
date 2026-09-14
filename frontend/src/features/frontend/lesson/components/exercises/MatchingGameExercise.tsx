"use client";

import { useEffect, useMemo, useState } from "react";

import { LessonQuestion } from "../../types/lesson";

interface MatchingGameExerciseProps {
  question: LessonQuestion;
  selectedAnswer: string | null;
  onAnswerChange: (value: string) => void;
  isChecked: boolean;
}

export function MatchingGameExercise({
  question,
  selectedAnswer,
  onAnswerChange,
  isChecked,
}: MatchingGameExerciseProps) {
  const pairs = useMemo(
    () => question.matchingPairs ?? [],
    [question.matchingPairs],
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLeft(null);
  }, [selectedAnswer]);

  const leftWords = pairs.map((pair) => pair.left);
  const rightWords = pairs.map((pair) => pair.right);

  const handlePairMatch = (left: string, right: string) => {
    if (isChecked) return;

    const isCorrect = pairs.some(
      (pair) => pair.left === left && pair.right === right,
    );

    if (isCorrect) {
      setMatched((previous) => ({ ...previous, [left]: true }));
      setFeedback("✅ Đúng!");
      setSelectedLeft(null);
      const allMatched = leftWords.every(
        (word) => !!matched[word] || word === left,
      );
      if (allMatched) {
        onAnswerChange("complete");
      }
      return;
    }

    setFeedback("❌ Chưa đúng, hãy thử lại!");
    setSelectedLeft(null);
  };

  const handleSelectLeft = (left: string) => {
    if (isChecked || matched[left]) return;
    setSelectedLeft(left);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-600">
          Matching game
        </p>
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {question.questionText}
        </h3>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {leftWords.map((word) => {
            const done = matched[word];
            return (
              <button
                key={word}
                type="button"
                onClick={() => handleSelectLeft(word)}
                disabled={done || isChecked}
                className={`flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-base font-bold transition ${
                  done
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : selectedLeft === word
                      ? "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-fuchsia-200 hover:bg-fuchsia-50"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {rightWords.map((word) => {
            const isActive = selectedLeft !== null;
            return (
              <button
                key={word}
                type="button"
                onClick={() => {
                  if (!selectedLeft) return;
                  handlePairMatch(selectedLeft, word);
                }}
                disabled={!isActive || isChecked}
                className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:bg-fuchsia-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
