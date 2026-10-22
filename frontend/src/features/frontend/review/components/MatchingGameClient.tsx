"use client";

import React, { useEffect, useRef, useState } from "react";

import { matchingGameService } from "@/features/frontend/review/services/matchingGameService";
import {
  MatchingGameDto,
  MatchingItemDto,
  WordType,
} from "@/features/frontend/lesson/types/lesson";
import {
  ChapterDto,
  LevelDto,
} from "@/features/frontend/dashboard/types/roadmap";
import { useSafeAsyncEffect } from "@/hooks/useSafeAsyncEffect";
import styles from "./MatchingGameClient.module.css";

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

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);

  const wrongTimeoutRef = useRef<number | null>(null);
  const WORD_TYPE_LABELS: Record<WordType, string> = {
    [WordType.Noun]: "n",
    [WordType.Verb]: "v",
    [WordType.Adjective]: "adj",
    [WordType.Adverb]: "adv",
    [WordType.Preposition]: "prep",
    [WordType.Phrase]: "phr",
    [WordType.Other]: "",
  };
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

  // Check local: cùng vocabularyId giữa word & meaning tức là đúng cặp -
  // không cần gọi API, dữ liệu đáp án đã nằm sẵn trong response lúc load game
  const handleSelectMeaning = (meaning: MatchingItemDto) => {
    if (
      !isRunning ||
      !selectedWordId ||
      matchedIds.has(meaning.vocabularyId) ||
      wrongPair
    ) {
      return;
    }

    const isCorrect = selectedWordId === meaning.vocabularyId;

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
  };

  const xpEarned = Math.floor(score / 2) + combo * 5;

  return (
    <div>
      {!game && (
        <div className={styles.setupCard}>
          <div className={styles.field}>
            <label className={styles.label}>Level</label>
            <select
              className={styles.select}
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

          <div className={styles.field}>
            <label className={styles.label}>Chapter</label>
            <select
              className={styles.select}
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
            className={styles.startButton}
            onClick={handleStart}
            disabled={!selectedChapterId || isStarting}
          >
            {isStarting ? "Đang tải..." : "Bắt đầu chơi"}
          </button>
        </div>
      )}

      {loadError && <div className={styles.errorBox}>{loadError}</div>}

      {game && (
        <>
          <div className={styles.statusBar}>
            <div className={styles.scoreGroup}>
              <span>
                Score: <span className={styles.scoreValue}>{score}</span>
              </span>
              <span>
                Combo: <span className={styles.comboValue}>{combo}</span>
              </span>
            </div>
            <div
              className={`${styles.timer} ${timeLeft <= 10 ? styles.timerUrgent : ""}`}
            >
              {timeLeft}s
            </div>
          </div>

          <div className={styles.board}>
            <div className={styles.column}>
              {game.wordColumn.map((word) => {
                const isMatched = matchedIds.has(word.vocabularyId);
                const isSelected = selectedWordId === word.vocabularyId;
                const isWrong = wrongPair?.wordId === word.vocabularyId;

                const tileClass = [
                  styles.tile,
                  isMatched && styles.tileMatched,
                  isWrong && styles.tileWrong,
                  isSelected && !isMatched && !isWrong && styles.tileSelected,
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
                    {WORD_TYPE_LABELS[word.wordType] && (
                      <span className="ml-1 text-xs font-normal opacity-60">
                        ({WORD_TYPE_LABELS[word.wordType]})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.column}>
              {game.meaningColumn.map((meaning) => {
                const isMatched = matchedIds.has(meaning.vocabularyId);
                const isWrong = wrongPair?.meaningId === meaning.vocabularyId;

                const tileClass = [
                  styles.tile,
                  isMatched && styles.tileMatched,
                  isWrong && styles.tileWrong,
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

          {isVictory && (
            <div className={`${styles.resultCard} ${styles.resultVictory}`}>
              <h3 className={styles.resultTitle}>🎉 Victory!</h3>
              <p className={styles.resultText}>
                Bạn ghi được {xpEarned} điểm thưởng
              </p>
              <p className={styles.resultText}>Tổng điểm: {score}</p>
              <button
                className={styles.resultButton}
                onClick={() => setGame(null)}
              >
                Chơi chapter khác
              </button>
            </div>
          )}

          {isTimeUp && !isVictory && (
            <div className={`${styles.resultCard} ${styles.resultTimeUp}`}>
              <h3 className={styles.resultTitle}>⏱ Hết giờ!</h3>
              <p className={styles.resultText}>Tổng điểm: {score}</p>
              <button
                className={styles.resultButton}
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
