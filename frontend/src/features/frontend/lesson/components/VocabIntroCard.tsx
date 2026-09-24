"use client";

import { useState } from "react";

import { VocabularyDto } from "../types/lesson";

interface VocabIntroCardProps {
  vocabulary: VocabularyDto[];
  onContinue: () => void;
}

export function VocabIntroCard({
  vocabulary,
  onContinue,
}: VocabIntroCardProps) {
  const [activeWord, setActiveWord] = useState<string>(
    vocabulary[0]?.word ?? "",
  );

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
          {vocabulary.length} từ vựng mới cần ghi nhớ
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

      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-2xl bg-violet-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-violet-700"
      >
        TIẾP TỤC · TRẮC NGHIỆM
      </button>
    </div>
  );
}
