"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { VocabularyDto } from "../types/lesson";

interface VocabFlashcardQuizProps {
  vocabulary: VocabularyDto[];
  onComplete: () => void;
}

type OptionKey = "A" | "B";

interface FlashcardItem {
  id: string;
  word: string;
  audioUrl?: string;
  optionA: string;
  optionB: string;
  correctOption: OptionKey;
}

const shuffle = <T,>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
};

const getFallbackDistractor = (
  vocabulary: VocabularyDto[],
  currentId: string,
) => {
  const candidate = vocabulary.find(
    (item) => item.id !== currentId && item.meaning.trim().length > 0,
  );

  return candidate?.meaning ?? "(không có lựa chọn sai)";
};

const buildFlashcards = (vocabulary: VocabularyDto[]): FlashcardItem[] => {
  return vocabulary.map((item) => {
    const wrongMeaning =
      item.distractor?.trim() || getFallbackDistractor(vocabulary, item.id);
    const correctFirst = Math.random() >= 0.5;

    return {
      id: item.id,
      word: item.word,
      audioUrl: item.audioUrl,
      optionA: correctFirst ? item.meaning : wrongMeaning,
      optionB: correctFirst ? wrongMeaning : item.meaning,
      correctOption: correctFirst ? "A" : "B",
    };
  });
};

export function VocabFlashcardQuiz({
  vocabulary,
  onComplete,
}: VocabFlashcardQuizProps) {
  const flashcards = useMemo(() => buildFlashcards(vocabulary), [vocabulary]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionKey | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const currentVocab = vocabulary[currentIndex] ?? null;
  const currentCard = flashcards[currentIndex] ?? null;

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const handleSpeak = (word: string, audioUrl?: string) => {
    if (typeof window === "undefined") {
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      void audio.play();
      return;
    }

    if (!("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const goNext = () => {
    if (!currentCard) return;

    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const isLastCard = currentIndex >= flashcards.length - 1;

    if (isLastCard) {
      onComplete();
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const handleSelectOption = (option: OptionKey) => {
    if (!currentCard || selectedOption) return;

    const correct = option === currentCard.correctOption;
    setSelectedOption(option);
    setIsCorrect(correct);

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      goNext();
    }, 800);
  };

  if (!currentCard) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Part 1 · Step 2
          </p>
          <h3 className="mt-3 text-xl font-black text-slate-900">
            Chưa có từ vựng để trắc nghiệm
          </h3>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onComplete}
            className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            TIẾP TỤC · GHÉP CẶP
          </button>
        </div>
      </div>
    );
  }

  const isLastCard = currentIndex >= flashcards.length - 1;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Part 1 · Step 2 · Flashcard Quiz
        </p>
        <h3 className="mt-3 text-2xl font-black text-slate-900">
          Từ {currentIndex + 1}/{flashcards.length}
        </h3>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        {currentVocab?.imageUrl ? (
          <img
            key={currentVocab.id}
            src={currentVocab.imageUrl}
            alt={currentVocab.word}
            className="mb-5 h-48 w-full rounded-2xl object-cover"
          />
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Chọn nghĩa đúng
            </p>
            <h4 className="mt-3 text-3xl font-black text-slate-900">
              {currentCard.word}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => handleSpeak(currentCard.word, currentCard.audioUrl)}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700"
          >
            🔊 Phát audio
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["A", currentCard.optionA],
              ["B", currentCard.optionB],
            ] as const
          ).map(([key, label]) => {
            const picked = selectedOption === key;
            const correct =
              selectedOption !== null && key === currentCard.correctOption;
            const wrongPicked =
              picked && selectedOption !== currentCard.correctOption;

            return (
              <button
                key={`${currentCard.id}-${key}`}
                type="button"
                onClick={() => handleSelectOption(key)}
                disabled={selectedOption !== null}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  correct
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : wrongPicked
                      ? "border-rose-300 bg-rose-100 text-rose-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-200 hover:bg-violet-50 disabled:opacity-70"
                }`}
              >
                <span className="mr-2 text-xs font-black">{key}.</span>
                {label}
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <p
            className={`mt-4 text-sm font-semibold ${
              isCorrect ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isCorrect ? "✅ Chính xác" : "❌ Chưa đúng"}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={goNext}
          disabled={selectedOption === null}
          className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLastCard ? "HOÀN TẤT BƯỚC 2" : "TIẾP THEO"}
        </button>
      </div>
    </div>
  );
}
