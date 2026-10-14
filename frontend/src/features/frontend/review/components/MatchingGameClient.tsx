"use client";

import React, { useEffect, useRef, useState } from "react";

import { matchingGameService } from "@/features/frontend/review/services/matchingGameService";
import {
  MatchingGameDto,
  MatchingItemDto,
} from "@/features/frontend/lesson/types/lesson";
import {
  ChapterDto,
  LevelDto,
} from "@/features/frontend/dashboard/types/roadmap";
import { useSafeAsyncEffect } from "@/hooks/useSafeAsyncEffect";

const GAME_SECONDS = 120;
const WRONG_FLASH_DELAY = 500;

export default function MatchingGameClient() {
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [game, setGame] = useState<MatchingGameDto | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{
    wordId: string;
    meaningId: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);

  const wrongTimeoutRef = useRef<number | null>(null);

  useSafeAsyncEffect(async (isMounted) => {
    try {
      const result = await matchingGameService.getLevels();
      if (!isMounted()) return;
      setLevels(result.items);
      if (result.items.length > 0) {
        setSelectedLevelId(result.items[0].id);
      }
    } catch {
      if (isMounted()) setLevels([]);
    }
  }, []);

  useSafeAsyncEffect(
    async (isMounted) => {
      if (!selectedLevelId) return;

      setLoadingChapters(true);
      try {
        const data =
          await matchingGameService.getChaptersByLevel(selectedLevelId);
        if (!isMounted()) return;
        setChapters(data);
        setSelectedChapterId(data[0]?.id ?? "");
      } catch {
        if (isMounted()) {
          setChapters([]);
          setSelectedChapterId("");
        }
      } finally {
        if (isMounted()) setLoadingChapters(false);
      }
    },
    [selectedLevelId],
  );

  useEffect(() => {
    return () => {
      if (wrongTimeoutRef.current) window.clearTimeout(wrongTimeoutRef.current);
    };
  }, []);

  const isVictory = game !== null && matchedIds.size === game.wordColumn.length;
  const isTimeUp = timeLeft === 0;
  const isRunning = game !== null && !isVictory && !isTimeUp;

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const handleStart = async () => {
    if (!selectedChapterId) return;

    setIsStarting(true);
    setLoadError(null);
    setGame(null);

    try {
      const data = await matchingGameService.getGameForChapter(
        selectedChapterId,
        8,
      );
      setGame(data);
      setSelectedWordId(null);
      setMatchedIds(new Set());
      setWrongPair(null);
      setScore(0);
      setCombo(0);
      setTimeLeft(GAME_SECONDS);
    } catch {
      setLoadError(
        "Chapter này chưa đủ từ vựng để chơi, chọn chapter khác nhé.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectWord = (word: MatchingItemDto) => {
    if (!isRunning || matchedIds.has(word.vocabularyId) || wrongPair) return;
    setSelectedWordId(word.vocabularyId);
  };

  const handleSelectMeaning = async (meaning: MatchingItemDto) => {
    if (
      !isRunning ||
      !selectedWordId ||
      matchedIds.has(meaning.vocabularyId) ||
      wrongPair ||
      isChecking
    ) {
      return;
    }

    setIsChecking(true);
    try {
      const isCorrect = await matchingGameService.checkAnswer({
        userPairs: [
          {
            wordVocabularyId: selectedWordId,
            meaningVocabularyId: meaning.vocabularyId,
          },
        ],
      });

      if (isCorrect) {
        setMatchedIds((prev) => new Set(prev).add(selectedWordId));
        setScore((s) => s + 10 + combo * 2);
        setCombo((c) => c + 1);
        setSelectedWordId(null);
      } else {
        setCombo(0);
        setWrongPair({
          wordId: selectedWordId,
          meaningId: meaning.vocabularyId,
        });
        wrongTimeoutRef.current = window.setTimeout(() => {
          setWrongPair(null);
          setSelectedWordId(null);
        }, WRONG_FLASH_DELAY);
      }
    } catch {
      setSelectedWordId(null);
    } finally {
      setIsChecking(false);
    }
  };

  const xpEarned = Math.floor(score / 2) + combo * 5;

  return (
    <div className="space-y-6">
      {!game && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Level
              </label>
              <select
                className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
              >
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Chapter
              </label>
              <select
                className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-indigo-500 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                disabled={loadingChapters || chapters.length === 0}
              >
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleStart}
              disabled={!selectedChapterId || isStarting}
            >
              {isStarting ? "Đang tải..." : "Bắt đầu chơi"}
            </button>
          </div>
        </div>
      )}

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
          {loadError}
        </div>
      )}

      {game && (
        <>
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600">
              <span>
                Score: <span className="font-bold text-slate-900">{score}</span>
              </span>
              <span>
                Combo:{" "}
                <span className="font-bold text-emerald-600">{combo}</span>
              </span>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-sm font-bold tabular-nums shadow-sm ${
                timeLeft <= 10
                  ? "bg-rose-50 text-rose-700"
                  : "bg-indigo-50 text-indigo-700"
              }`}
            >
              {timeLeft}s
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              {game.wordColumn.map((word) => {
                const isMatched = matchedIds.has(word.vocabularyId);
                const isSelected = selectedWordId === word.vocabularyId;
                const isWrong = wrongPair?.wordId === word.vocabularyId;

                const tileClass = [
                  "flex min-h-14 items-center justify-center rounded-2xl border px-4 py-4 text-center text-base font-semibold transition",
                  isMatched &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700",
                  isWrong && "border-rose-300 bg-rose-50 text-rose-700",
                  isSelected &&
                    !isMatched &&
                    !isWrong &&
                    "border-indigo-300 bg-indigo-50 text-indigo-700",
                  !isMatched &&
                    !isWrong &&
                    !isSelected &&
                    "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={word.vocabularyId}
                    className={tileClass}
                    onClick={() => handleSelectWord(word)}
                    disabled={isMatched || !isRunning}
                  >
                    {word.text}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3">
              {game.meaningColumn.map((meaning) => {
                const isMatched = matchedIds.has(meaning.vocabularyId);
                const isWrong = wrongPair?.meaningId === meaning.vocabularyId;

                const tileClass = [
                  "flex min-h-14 items-center justify-center rounded-2xl border px-4 py-4 text-center text-base font-semibold transition",
                  isMatched &&
                    "border-emerald-300 bg-emerald-50 text-emerald-700",
                  isWrong && "border-rose-300 bg-rose-50 text-rose-700",
                  !isMatched &&
                    !isWrong &&
                    "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={meaning.vocabularyId}
                    className={tileClass}
                    onClick={() => handleSelectMeaning(meaning)}
                    disabled={isMatched || !selectedWordId || !isRunning}
                  >
                    {meaning.text}
                  </button>
                );
              })}
            </div>
          </div>

          {isVictory && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm">
              <h3 className="text-xl font-black text-slate-900">🎉 Victory!</h3>
              <p className="mt-2 text-sm text-slate-600">
                Bạn ghi được {xpEarned} điểm thưởng
              </p>
              <p className="mt-1 text-sm text-slate-600">Tổng điểm: {score}</p>
              <button
                className="mt-4 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                onClick={() => setGame(null)}
              >
                Chơi chapter khác
              </button>
            </div>
          )}

          {isTimeUp && !isVictory && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-center shadow-sm">
              <h3 className="text-xl font-black text-slate-900">⏱ Hết giờ!</h3>
              <p className="mt-2 text-sm text-slate-600">Tổng điểm: {score}</p>
              <button
                className="mt-4 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                onClick={() => setGame(null)}
              >
                Chơi chapter khác
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
