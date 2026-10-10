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

  // 1. Load danh sách Level khi vào trang
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

  // 2. Khi đổi Level -> load Chapter của level đó
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

  // Dọn timeout khi rời trang
  useEffect(() => {
    return () => {
      if (wrongTimeoutRef.current) window.clearTimeout(wrongTimeoutRef.current);
    };
  }, []);

  // Đếm ngược - chỉ chạy khi đang có game và chưa thắng/hết giờ
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
    <div>
      {!game && (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Level
            </label>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              style={{ padding: "8px 12px", minWidth: 160 }}
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Chapter
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={loadingChapters || chapters.length === 0}
              style={{ padding: "8px 12px", minWidth: 200 }}
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedChapterId || isStarting}
            style={{
              padding: "8px 16px",
              background: "#0ea5a4",
              color: "white",
              fontWeight: 600,
            }}
          >
            {isStarting ? "Đang tải..." : "Bắt đầu chơi"}
          </button>
        </div>
      )}

      {loadError && (
        <div
          style={{
            padding: 12,
            background: "#fff1f0",
            border: "1px solid #ffa39e",
            marginBottom: 16,
          }}
        >
          {loadError}
        </div>
      )}

      {game && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
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
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div style={{ display: "grid", gap: 8 }}>
              {game.wordColumn.map((word) => {
                const isMatched = matchedIds.has(word.vocabularyId);
                const isSelected = selectedWordId === word.vocabularyId;
                const isWrong = wrongPair?.wordId === word.vocabularyId;

                return (
                  <button
                    key={word.vocabularyId}
                    onClick={() => handleSelectWord(word)}
                    disabled={isMatched || !isRunning}
                    style={{
                      padding: 12,
                      minHeight: 60,
                      background: isMatched
                        ? "#d1fae5"
                        : isWrong
                          ? "#fee2e2"
                          : isSelected
                            ? "#ede9fe"
                            : "#f8fafc",
                      border: "1px solid #ccc",
                      cursor: isMatched ? "default" : "pointer",
                    }}
                  >
                    {word.text}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {game.meaningColumn.map((meaning) => {
                const isMatched = matchedIds.has(meaning.vocabularyId);
                const isWrong = wrongPair?.meaningId === meaning.vocabularyId;

                return (
                  <button
                    key={meaning.vocabularyId}
                    onClick={() => handleSelectMeaning(meaning)}
                    disabled={isMatched || !selectedWordId || !isRunning}
                    style={{
                      padding: 12,
                      minHeight: 60,
                      background: isMatched
                        ? "#d1fae5"
                        : isWrong
                          ? "#fee2e2"
                          : "#fff",
                      border: "1px solid #ccc",
                      cursor: isMatched ? "default" : "pointer",
                    }}
                  >
                    {meaning.text}
                  </button>
                );
              })}
            </div>
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
              <p>Bạn ghi được {xpEarned} điểm thưởng</p>
              <p>Tổng điểm: {score}</p>
              <button
                onClick={() => setGame(null)}
                style={{ padding: "8px 12px" }}
              >
                Chơi chapter khác
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
              <h3>Hết giờ!</h3>
              <p>Tổng điểm: {score}</p>
              <button
                onClick={() => setGame(null)}
                style={{ padding: "8px 12px" }}
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
