"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getMatchingData } from "@/features/frontend/review/services/matchingService";
import { MatchingPairDto } from "@/features/frontend/review/types/review";
import { completeReview } from "@/features/frontend/review/services/reviewService";
import { useSafeAsyncEffect } from "@/hooks/useSafeAsyncEffect";

type Pair = {
  id: string;
  left: string;
  right: string;
  vocabId?: string | number;
};

type Card = {
  id: string;
  pairId: string;
  text: string;
};

const GAME_SECONDS = 120;
const FLIP_BACK_DELAY = 700;

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCards(pairs: Pair[]): Card[] {
  return pairs.flatMap((p) => [
    { id: `${p.id}-L`, pairId: p.id, text: p.left },
    { id: `${p.id}-R`, pairId: p.id, text: p.right },
  ]);
}

export default function MatchingGameClient() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);

  const reportedRef = useRef(false);
  const flipTimeoutRef = useRef<number | null>(null);

  // Các giá trị tính ra từ state -> tính thẳng khi render, không cần state riêng
  const isVictory =
    pairs.length > 0 && Object.keys(matched).length === pairs.length;
  const isTimeUp = timeLeft === 0;
  const isRunning = pairs.length > 0 && !isVictory && !isTimeUp;
  const xpEarned = Math.floor(score / 2) + combo * 5;

  // Bắt đầu / chơi lại: set hết state trong 1 chỗ (gọi từ event hoặc sau khi tải xong)
  const startGame = useCallback((list: Pair[]) => {
    if (flipTimeoutRef.current) window.clearTimeout(flipTimeoutRef.current);
    reportedRef.current = false;
    setPairs(list);
    setCards(shuffle(buildCards(list)));
    setFlipped([]);
    setMatched({});
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_SECONDS);
  }, []);

  // 1. Tải dữ liệu từ API
  useSafeAsyncEffect(
    async (isMounted) => {
      let list: Pair[] = [];
      try {
        const data: MatchingPairDto[] = (await getMatchingData()) || [];
        list = data.map((p) => ({
          id: p.id,
          left: p.left,
          right: p.right,
          vocabId: p.vocabId,
        }));
      } catch {
        list = [];
      }
      if (!isMounted()) return;
      startGame(list);
    },
    [startGame],
  );

  // 2. Đồng hồ đếm ngược: chỉ chạy khi đang chơi, tự dừng khi thắng hoặc hết giờ
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  // 3. Dọn timeout lật thẻ khi rời trang
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) window.clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  // 4. Thắng thì báo backend đúng 1 lần (việc gọi API mới là việc của effect)
  useSafeAsyncEffect(async () => {
    if (!isVictory || reportedRef.current) return;
    reportedRef.current = true;

    const reviewedIds = pairs.map((p) => p.vocabId).filter(Boolean) as Array<
      string | number
    >;

    if (reviewedIds.length === 0) return;

    try {
      await completeReview({ ids: reviewedIds });
    } catch {
      // Xử lý lỗi nếu cần
    }
  }, [isVictory, pairs]);

  const onCardClick = (card: Card) => {
    if (!isRunning) return;
    if (
      flipped.includes(card.id) ||
      matched[card.pairId] ||
      flipped.length === 2
    )
      return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const a = cards.find((c) => c.id === newFlipped[0]);
      const b = cards.find((c) => c.id === newFlipped[1]);

      if (a && b && a.pairId === b.pairId) {
        setMatched((m) => ({ ...m, [a.pairId]: true }));
        setScore((s) => s + 10 + combo * 2);
        setCombo((c) => c + 1);
      } else {
        setCombo(0);
      }

      // Dù đúng hay sai đều úp lại 2 thẻ đang lật để lượt sau chơi tiếp được
      flipTimeoutRef.current = window.setTimeout(
        () => setFlipped([]),
        FLIP_BACK_DELAY,
      );
    }
  };

  const restart = () => startGame(pairs);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          Score: {score} • Combo: {combo}
        </div>
        <div>Time: {timeLeft}s</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched[card.pairId];
          return (
            <div
              key={card.id}
              onClick={() => onCardClick(card)}
              style={{
                padding: 12,
                minHeight: 80,
                background: isFlipped ? "#fff" : "#ddd",
                border: "1px solid #bbb",
                cursor: matched[card.pairId] ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {isFlipped ? card.text : "?"}
            </div>
          );
        })}
      </div>

      {isVictory && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#e6ffed",
            border: "1px solid #8feda3",
          }}
        >
          <h3>Victory!</h3>
          <p>You earned {xpEarned} XP</p>
          <p>Total Score: {score}</p>
          <button onClick={restart} style={{ padding: "8px 12px" }}>
            Play Again
          </button>
        </div>
      )}

      {isTimeUp && !isVictory && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#fff1f0",
            border: "1px solid #ffa39e",
          }}
        >
          <h3>Time&apos;s up!</h3>
          <p>Total Score: {score}</p>
          <button onClick={restart} style={{ padding: "8px 12px" }}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
