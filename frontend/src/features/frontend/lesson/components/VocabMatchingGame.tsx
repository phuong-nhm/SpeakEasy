"use client";

import { useEffect, useMemo, useState } from "react";

import { VocabularyDto } from "../types/lesson";

interface VocabMatchingGameProps {
  vocabulary: VocabularyDto[];
  onComplete: () => void;
}

interface PairItem {
  id: string;
  word: string;
  meaning: string;
}

const shuffle = <T,>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
};

export function VocabMatchingGame({
  vocabulary,
  onComplete,
}: VocabMatchingGameProps) {
  const pairs = useMemo<PairItem[]>(
    () =>
      vocabulary.map((item) => ({
        id: item.id,
        word: item.word,
        meaning: item.meaning,
      })),
    [vocabulary],
  );

  const [leftOrder, setLeftOrder] = useState<string[]>([]);
  const [rightOrder, setRightOrder] = useState<string[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Record<string, boolean>>({});
  const [wrongPair, setWrongPair] = useState<{
    leftId: string;
    rightId: string;
  } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const ids = pairs.map((item) => item.id);
    setLeftOrder(shuffle(ids));
    setRightOrder(shuffle(ids));
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setMatchedIds({});
    setWrongPair(null);
    setIsFinished(false);
  }, [pairs]);

  useEffect(() => {
    if (pairs.length === 0 || isFinished) return;

    const matchedCount = Object.values(matchedIds).filter(Boolean).length;

    if (matchedCount === pairs.length) {
      setIsFinished(true);
      onComplete();
    }
  }, [isFinished, matchedIds, onComplete, pairs.length]);

  useEffect(() => {
    if (!selectedLeftId || !selectedRightId) return;

    const isCorrect = selectedLeftId === selectedRightId;

    if (isCorrect) {
      setMatchedIds((previous) => ({ ...previous, [selectedLeftId]: true }));
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setWrongPair(null);
      return;
    }

    setWrongPair({ leftId: selectedLeftId, rightId: selectedRightId });

    const timer = window.setTimeout(() => {
      setWrongPair(null);
      setSelectedLeftId(null);
      setSelectedRightId(null);
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedLeftId, selectedRightId]);

  const pairById = useMemo(() => {
    return pairs.reduce<Record<string, PairItem>>((result, pair) => {
      result[pair.id] = pair;
      return result;
    }, {});
  }, [pairs]);

  const matchedCount = Object.values(matchedIds).filter(Boolean).length;

  if (pairs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
            Part 1 · Step 3
          </p>
          <h3 className="mt-3 text-xl font-black text-slate-900">
            Chưa có từ vựng để ghép cặp
          </h3>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✅ Hoàn tất bước 3
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
          Part 1 · Step 3 · Matching
        </p>
        <h3 className="mt-3 text-2xl font-black text-slate-900">
          Đã ghép {matchedCount}/{pairs.length}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {leftOrder.map((id) => {
            const pair = pairById[id];
            if (!pair) return null;

            const isMatched = !!matchedIds[id];
            const isSelected = selectedLeftId === id;
            const isWrong = wrongPair?.leftId === id;

            return (
              <button
                key={`left-${id}`}
                type="button"
                onClick={() => {
                  if (isMatched || isFinished) return;
                  setSelectedLeftId(id);
                }}
                disabled={isMatched || isFinished}
                className={`flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-base font-bold transition ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : isWrong
                      ? "border-rose-300 bg-rose-100 text-rose-700"
                      : isSelected
                        ? "border-violet-300 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                }`}
              >
                {pair.word}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {rightOrder.map((id) => {
            const pair = pairById[id];
            if (!pair) return null;

            const isMatched = !!matchedIds[id];
            const isSelected = selectedRightId === id;
            const isWrong = wrongPair?.rightId === id;

            return (
              <button
                key={`right-${id}`}
                type="button"
                onClick={() => {
                  if (isMatched || isFinished || !selectedLeftId) return;
                  setSelectedRightId(id);
                }}
                disabled={isMatched || isFinished || !selectedLeftId}
                className={`flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-base font-semibold transition ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : isWrong
                      ? "border-rose-300 bg-rose-100 text-rose-700"
                      : isSelected
                        ? "border-violet-300 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                }`}
              >
                {pair.meaning}
              </button>
            );
          })}
        </div>
      </div>

      {isFinished && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✅ Hoàn tất bước 3. Bạn đã có thể bắt đầu Part 2.
        </div>
      )}
    </div>
  );
}
