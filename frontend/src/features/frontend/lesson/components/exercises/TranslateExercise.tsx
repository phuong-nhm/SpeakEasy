"use client";

import { useMemo } from "react";

import { SentenceExerciseDto } from "../../types/lesson";

interface TranslateExerciseProps {
  question: SentenceExerciseDto;
  selectedWords: string[];
  onWordsChange: (words: string[]) => void;
  isChecked: boolean;
}

export function TranslateExercise({
  question,
  selectedWords,
  onWordsChange,
  isChecked,
}: TranslateExerciseProps) {
  const wordBank = useMemo(
    () => question.shuffledWords ?? [],
    [question.shuffledWords],
  );

  const availableWords = useMemo(() => {
    const used = new Map<string, number>();
    return wordBank.filter((word) => {
      const totalCount = wordBank.filter((w) => w === word).length;
      const selectedCount = selectedWords.filter((w) => w === word).length;
      const alreadyUsed = used.get(word) ?? 0;

      if (alreadyUsed < totalCount - selectedCount) {
        used.set(word, alreadyUsed + 1);
        return true;
      }
      return false;
    });
  }, [wordBank, selectedWords]);

  const appendWord = (word: string) => {
    if (isChecked) return;
    onWordsChange([...selectedWords, word]);
  };

  const removeWordAt = (index: number) => {
    if (isChecked) return;
    onWordsChange(selectedWords.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetWords = () => {
    if (isChecked) return;
    onWordsChange([]);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
          Translate from Vietnamese
        </p>
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {question.vietnameseTranslation}
        </h3>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex min-h-16 flex-wrap gap-2">
          {selectedWords.length === 0 ? (
            <span className="text-sm text-slate-500">
              Chọn các từ bên dưới để ghép câu tiếng Anh.
            </span>
          ) : (
            selectedWords.map((word, index) => (
              <button
                key={`${word}-${index}`}
                type="button"
                onClick={() => removeWordAt(index)}
                disabled={isChecked}
                className="rounded-full border border-violet-300 bg-white px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed"
              >
                {word}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            onClick={() => appendWord(word)}
            disabled={isChecked}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {word}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetWords}
          disabled={isChecked}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
