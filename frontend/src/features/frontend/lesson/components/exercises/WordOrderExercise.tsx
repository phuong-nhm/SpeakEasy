"use client";

import { useEffect, useMemo, useState } from "react";

import { LessonQuestion } from "../../types/lesson";

interface WordOrderExerciseProps {
  question: LessonQuestion;
  selectedAnswer: string | null;
  onAnswerChange: (value: string) => void;
  isChecked: boolean;
}

export function WordOrderExercise({
  question,
  selectedAnswer,
  onAnswerChange,
  isChecked,
}: WordOrderExerciseProps) {
  const wordBank = useMemo(
    () => question.wordBank ?? question.correctAnswer.split(" "),
    [question.correctAnswer, question.wordBank],
  );
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedAnswer || !selectedAnswer.trim()) {
      setSelectedWords([]);
      return;
    }

    setSelectedWords(selectedAnswer.split(" ").filter(Boolean));
  }, [selectedAnswer]);

  const availableWords = wordBank.filter(
    (word) => !selectedWords.includes(word),
  );

  const appendWord = (word: string) => {
    if (isChecked) return;
    const next = [...selectedWords, word];
    setSelectedWords(next);
    onAnswerChange(next.join(" "));
  };

  const removeWordAt = (index: number) => {
    if (isChecked) return;
    const next = selectedWords.filter((_, itemIndex) => itemIndex !== index);
    setSelectedWords(next);
    onAnswerChange(next.join(" "));
  };

  const resetWords = () => {
    if (isChecked) return;
    setSelectedWords([]);
    onAnswerChange("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
          Word order
        </p>
        <div className="mt-3 flex min-h-16 flex-wrap gap-2">
          {selectedWords.length === 0 ? (
            <span className="text-sm text-slate-500">
              Chọn các từ bên dưới để tạo câu hoàn chỉnh.
            </span>
          ) : (
            selectedWords.map((word, index) => (
              <button
                key={`${word}-${index}`}
                type="button"
                onClick={() => removeWordAt(index)}
                className="rounded-full border border-indigo-300 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableWords.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => appendWord(word)}
            disabled={isChecked}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetWords}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
