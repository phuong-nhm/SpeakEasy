"use client";

import { useMemo, useState } from "react";

import { VocabularyDto } from "../types/lesson";

interface VocabIntroCardProps {
  vocabulary: VocabularyDto[];
}

const shuffle = <T,>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
};

export function VocabIntroCard({ vocabulary }: VocabIntroCardProps) {
  const [activeWord, setActiveWord] = useState<string>(
    vocabulary[0]?.word ?? "",
  );

  const quizWord = useMemo(() => {
    if (!vocabulary.length) return null;
    return vocabulary.find((item) => item.word === activeWord) ?? vocabulary[0];
  }, [activeWord, vocabulary]);

  const quizOptions = useMemo(() => {
    if (!vocabulary.length || !quizWord) return [];

    const distractors = shuffle(
      vocabulary.filter((item) => item.word !== quizWord.word).slice(0, 3),
    );

    return shuffle(
      [quizWord.meaning, ...distractors.map((item) => item.meaning)].slice(
        0,
        4,
      ),
    );
  }, [quizWord, vocabulary]);

  const handleSpeak = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
          Part 1 · Vocabulary
        </p>
        <h3 className="mt-3 text-2xl font-black text-slate-900">
          7 từ vựng mới cần ghi nhớ
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vocabulary.map((item, index) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveWord(item.word)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveWord(item.word);
              }
            }}
            className={`cursor-pointer rounded-3xl border p-4 text-left transition ${
              activeWord === item.word
                ? "border-violet-300 bg-violet-50 shadow-sm"
                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-xl shadow-sm">
                {index + 1}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSpeak(item.word);
                }}
                className="rounded-full border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-bold text-violet-600"
              >
                🔊 TTS
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xl font-black text-slate-900">
                {item.word}
              </div>
              <div className="mt-1 text-sm text-slate-500">{item.meaning}</div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Quick recall</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                {item.distractor ?? "new"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {quizWord && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Quick recognition quiz
          </p>
          <h4 className="mt-3 text-xl font-bold text-slate-900">
            Chọn nghĩa đúng của từ:{" "}
            <span className="text-amber-700">{quizWord.word}</span>
          </h4>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quizOptions.map((option) => {
              const isCorrect = option === quizWord.meaning;

              return (
                <button
                  key={`${quizWord.id}-${option}`}
                  type="button"
                  onClick={() => handleSpeak(quizWord.word)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
