"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getMatchingData } from "@/features/frontend/review/services/matchingService";
import { MatchingPairDto } from "@/features/frontend/review/types/review";
import { completeReview } from "@/features/frontend/review/services/reviewService";

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

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingGameClient() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<number | null>(null);
  const [victory, setVictory] = useState(false);

  useEffect(() => {
    getMatchingData()
      .then((data) => {
        const list: MatchingPairDto[] = data || [];
        setPairs(
          list.map((p) => ({
            id: p.id,
            left: p.left,
            right: p.right,
            vocabId: p.vocabId,
          })),
        );
      })
      .catch(() => setPairs([]));
  }, []);

  useEffect(() => {
    if (!pairs.length) return;
    const c: Card[] = pairs.flatMap((p) => [
      { id: `${p.id}-L`, pairId: p.id, text: p.left },
      { id: `${p.id}-R`, pairId: p.id, text: p.right },
    ]);
    setCards(shuffle(c));
    setFlipped([]);
    setMatched({});
    setScore(0);
    setCombo(0);
    setTimeLeft(120);
    setVictory(false);
  }, [pairs]);

  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [pairs]);

  useEffect(() => {
    const totalPairs = pairs.length;
    const matchedCount = Object.keys(matched).length;
    if (totalPairs > 0 && matchedCount === totalPairs) {
      setVictory(true);
      // award XP and optionally call backend to mark completed
      const reviewedIds = pairs.map((p) => p.vocabId).filter(Boolean) as Array<
        string | number
      >;
      if (reviewedIds.length) {
        completeReview({ ids: reviewedIds }).catch(() => {});
      }
    }
  }, [matched, pairs]);

  const onCardClick = (card: Card) => {
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
        // match
        setMatched((m) => ({ ...m, [a.pairId]: true }));
        setScore((s) => s + 10 + combo * 2);
        setCombo((c) => c + 1);
      } else {
        // not match
        setCombo(0);
        setTimeout(() => setFlipped([]), 700);
      }
      setTimeout(() => setFlipped([]), 700);
    }
  };

  const restart = () => {
    setPairs((p) => p.slice());
  };

  const xpEarned = useMemo(
    () => Math.floor(score / 2) + combo * 5,
    [score, combo],
  );

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

      {victory && (
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
    </div>
  );
}
