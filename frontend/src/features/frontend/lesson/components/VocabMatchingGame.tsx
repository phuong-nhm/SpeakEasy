"use client";

import { useMemo, useRef, useState } from "react";

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

// Bọc ngoài: khi bộ từ vựng đổi (đổi bài học...) thì key đổi theo,
// React tự huỷ và tạo lại toàn bộ state bên trong, khỏi cần effect reset.
export function VocabMatchingGame({
  vocabulary,
  onComplete,
}: VocabMatchingGameProps) {
  const gameKey = vocabulary.map((item) => item.id).join("|");
  return (
    <VocabMatchingGameInner
      key={gameKey}
      vocabulary={vocabulary}
      onComplete={onComplete}
    />
  );
}

function VocabMatchingGameInner({
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

  const ids = useMemo(() => pairs.map((item) => item.id), [pairs]);

  // Thứ tự xáo trộn chỉ cần tính 1 lần lúc mount (nhờ key ở component cha,
  // mount lại là coi như "reset")
  const [leftOrder] = useState<string[]>(() => shuffle(ids));
  const [rightOrder] = useState<string[]>(() => shuffle(ids));

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Record<string, boolean>>({});
  const [wrongPair, setWrongPair] = useState<{
    leftId: string;
    rightId: string;
  } | null>(null);

  const wrongTimerRef = useRef<number | null>(null);

  const pairById = useMemo(() => {
    return pairs.reduce<Record<string, PairItem>>((result, pair) => {
      result[pair.id] = pair;
      return result;
    }, {});
  }, [pairs]);

  const matchedCount = Object.values(matchedIds).filter(Boolean).length;
  const isFinished = pairs.length > 0 && matchedCount === pairs.length;

  const clearWrongTimer = () => {
    if (wrongTimerRef.current) {
      window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
  };

  const judge = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      const nextMatchedCount = matchedCount + 1;
      setMatchedIds((previous) => ({ ...previous, [leftId]: true }));
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setWrongPair(null);
      if (nextMatchedCount === pairs.length) {
        onComplete();
      }
      return;
    }

    setWrongPair({ leftId, rightId });
    clearWrongTimer();
    wrongTimerRef.current = window.setTimeout(() => {
      setWrongPair(null);
      setSelectedLeftId(null);
      setSelectedRightId(null);
    }, 450);
  };

  const handleSelectLeft = (id: string) => {
    if (matchedIds[id] || isFinished || wrongPair) return;
    setSelectedLeftId(id);
    if (selectedRightId) judge(id, selectedRightId);
  };

  const handleSelectRight = (id: string) => {
    if (matchedIds[id] || isFinished || wrongPair || !selectedLeftId) return;
    setSelectedRightId(id);
    judge(selectedLeftId, id);
  };

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
                onClick={() => handleSelectLeft(id)}
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
                onClick={() => handleSelectRight(id)}
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
