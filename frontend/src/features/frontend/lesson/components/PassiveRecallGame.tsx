"use client";

import { useEffect, useState } from "react";

import { lessonService } from "../services/lessonService";
import { MatchingGameDto, MatchingItemDto } from "../types/lesson";
import { WORD_TYPE_LABELS } from "../utils/wordTypeLabel";

interface PassiveRecallGameProps {
  lessonId: string;
  onComplete: () => void;
}

export function PassiveRecallGame({
  lessonId,
  onComplete,
}: PassiveRecallGameProps) {
  const [game, setGame] = useState<MatchingGameDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{
    wordId: string;
    meaningId: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    lessonService
      .getMatchingGameForSummary(lessonId)
      .then((data) => {
        if (mounted) setGame(data);
      })
      .catch(() => {
        if (mounted) onComplete();
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const isFinished =
    game !== null && matchedIds.size === game.wordColumn.length;

  const handleSelectWord = (word: MatchingItemDto) => {
    if (matchedIds.has(word.vocabularyId) || wrongPair) return;
    setSelectedWordId(word.vocabularyId);
  };

  // Check local: cùng vocabularyId giữa word & meaning là đúng cặp,
  // không cần gọi API nữa
  const handleSelectMeaning = (meaning: MatchingItemDto) => {
    if (!selectedWordId || matchedIds.has(meaning.vocabularyId) || wrongPair) {
      return;
    }

    const isCorrect = selectedWordId === meaning.vocabularyId;

    if (isCorrect) {
      setMatchedIds((prev) => new Set(prev).add(selectedWordId));
      setSelectedWordId(null);
    } else {
      setWrongPair({
        wordId: selectedWordId,
        meaningId: meaning.vocabularyId,
      });
      window.setTimeout(() => {
        setWrongPair(null);
        setSelectedWordId(null);
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Ôn nhanh
        </p>
        <h3 className="mt-2 text-xl font-black text-slate-900">
          {game.isPassiveRecall && game.sourceLessonTitle
            ? `Ôn lại từ vựng: ${game.sourceLessonTitle}`
            : "Ghép các cặp từ sau"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {game.wordColumn.map((word) => {
            const isMatched = matchedIds.has(word.vocabularyId);
            const isSelected = selectedWordId === word.vocabularyId;
            const isWrong = wrongPair?.wordId === word.vocabularyId;

            return (
              <button
                key={word.vocabularyId}
                type="button"
                onClick={() => handleSelectWord(word)}
                disabled={isMatched}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : isWrong
                      ? "border-rose-300 bg-rose-100 text-rose-700"
                      : isSelected
                        ? "border-violet-300 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                }`}
              >
                {word.text}
                {WORD_TYPE_LABELS[word.wordType] && (
                  <span className="ml-1 text-xs font-normal opacity-60">
                    ({WORD_TYPE_LABELS[word.wordType]})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {game.meaningColumn.map((meaning) => {
            const isMatched = matchedIds.has(meaning.vocabularyId);
            const isWrong = wrongPair?.meaningId === meaning.vocabularyId;

            return (
              <button
                key={meaning.vocabularyId}
                type="button"
                onClick={() => handleSelectMeaning(meaning)}
                disabled={isMatched || !selectedWordId}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : isWrong
                      ? "border-rose-300 bg-rose-100 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {meaning.text}
                {WORD_TYPE_LABELS[meaning.wordType] && (
                  <span className="ml-1 text-xs font-normal opacity-60">
                    ({WORD_TYPE_LABELS[meaning.wordType]})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isFinished && (
        <button
          type="button"
          onClick={onComplete}
          className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-emerald-700"
        >
          HOÀN TẤT
        </button>
      )}
    </div>
  );
}
