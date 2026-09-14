"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { lessonService } from "../services/lessonService";
import { LessonDto, LessonQuestion } from "../types/lesson";

const normalizeAnswer = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const shuffleItems = <T>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
};

type LessonPart = "vocabulary" | "grammar" | "comprehensive";
type CompletedParts = Record<LessonPart, boolean>;

const defaultCompletedParts: CompletedParts = {
  vocabulary: false,
  grammar: false,
  comprehensive: false,
};

export function useLessonFlow(lessonId: string) {
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState<LessonPart | null>(null);
  const [completedParts, setCompletedParts] = useState<CompletedParts>(
    defaultCompletedParts,
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [resultType, setResultType] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [hearts, setHearts] = useState(5);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const startedAtRef = useRef(Date.now());
  const [summary, setSummary] = useState<{
    xpEarned: number;
    accuracyPercent: number;
    elapsedSeconds: number;
  } | null>(null);

  const lessonParts: LessonPart[] = ["vocabulary", "grammar", "comprehensive"];

  const isPartUnlocked = (part: LessonPart) => {
    if (part === "vocabulary") return true;
    if (part === "grammar") return completedParts.vocabulary;
    return completedParts.grammar;
  };

  const resetCurrentState = () => {
    setSelectedAnswer(null);
    setIsChecked(false);
    setResultType(null);
  };

  const openPart = (part: LessonPart) => {
    if (!isPartUnlocked(part)) return;

    setSelectedPart(part);
    setCurrentIndex(0);
    resetCurrentState();
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await lessonService.getLessonById(lessonId);
        if (!isMounted) return;
        setLesson(data);
        setHearts(data.totalHearts);
        setSelectedPart(null);
        setCompletedParts(defaultCompletedParts);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsChecked(false);
        setResultType(null);
        setCorrectAnswers(0);
        setIsCompleted(false);
        setSummary(null);
        startedAtRef.current = Date.now();
      } catch {
        if (isMounted) {
          setLesson(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  const grammarQuestions = useMemo<LessonQuestion[]>(() => {
    if (!lesson) return [];

    return lesson.questions.filter(
      (question) =>
        question.sectionType === 1 && question.exerciseType !== "MatchingGame",
    );
  }, [lesson]);

  const comprehensiveQuestions = useMemo<LessonQuestion[]>(() => {
    if (!lesson) return [];

    const questions = lesson.questions.filter(
      (question) =>
        question.sectionType === 2 || question.exerciseType === "MatchingGame",
    );

    return shuffleItems(questions);
  }, [lesson]);

  const currentPart = selectedPart ?? "vocabulary";

  const partQuestions = useMemo<LessonQuestion[]>(() => {
    if (!lesson) return [];

    if (currentPart === "grammar") return grammarQuestions;
    if (currentPart === "comprehensive") return comprehensiveQuestions;

    return [];
  }, [comprehensiveQuestions, currentPart, grammarQuestions, lesson]);

  const currentQuestion = useMemo<LessonQuestion | null>(() => {
    if (!lesson || !selectedPart || currentPart === "vocabulary") return null;
    return partQuestions[currentIndex] ?? null;
  }, [currentIndex, currentPart, lesson, partQuestions, selectedPart]);

  const totalQuestions =
    currentPart === "grammar"
      ? grammarQuestions.length
      : currentPart === "comprehensive"
        ? comprehensiveQuestions.length
        : 0;

  const overviewProgress =
    (Object.values(completedParts).filter(Boolean).length /
      lessonParts.length) *
    100;
  const currentPartProgress =
    totalQuestions === 0 ? 0 : (currentIndex / totalQuestions) * 33;
  const progressPercent =
    selectedPart === null
      ? overviewProgress
      : Math.min(
          100,
          33 * lessonParts.indexOf(currentPart) + currentPartProgress,
        );

  const canCheck =
    selectedPart !== null &&
    selectedPart !== "vocabulary" &&
    Boolean(selectedAnswer?.trim()) &&
    !isChecked &&
    !isCompleted;

  const handleSelectAnswer = (answer: string) => {
    if (
      isChecked ||
      isCompleted ||
      !selectedPart ||
      selectedPart === "vocabulary"
    )
      return;
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || !selectedAnswer || isChecked || isCompleted) return;

    const isCorrect =
      normalizeAnswer(selectedAnswer) ===
      normalizeAnswer(currentQuestion.correctAnswer);

    setIsChecked(true);
    setResultType(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
    }
  };

  const finalizeLesson = () => {
    if (!lesson) return;

    const allQuestions = lesson.questions.filter(
      (question) =>
        question.exerciseType !== "MatchingGame" || question.sectionType === 2,
    );
    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    const accuracyPercent =
      allQuestions.length === 0
        ? 0
        : Math.round((correctAnswers / allQuestions.length) * 100);
    const xpEarned = correctAnswers * 30 + hearts * 10;

    setSummary({
      xpEarned,
      accuracyPercent,
      elapsedSeconds,
    });

    setIsCompleted(true);
    setSelectedPart(null);
    setCurrentIndex(0);
    resetCurrentState();
  };

  const completeCurrentPart = () => {
    if (!selectedPart) return;

    setCompletedParts((prev) => ({
      ...prev,
      [selectedPart]: true,
    }));

    if (selectedPart === "comprehensive") {
      finalizeLesson();
      return;
    }

    setSelectedPart(null);
    setCurrentIndex(0);
    resetCurrentState();
  };

  const handleContinue = () => {
    if (!lesson || !selectedPart) return;

    if (selectedPart === "vocabulary") {
      completeCurrentPart();
      return;
    }

    if (selectedPart === "grammar") {
      if (currentIndex >= grammarQuestions.length - 1) {
        completeCurrentPart();
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      resetCurrentState();
      return;
    }

    if (selectedPart === "comprehensive") {
      if (currentIndex >= comprehensiveQuestions.length - 1 || hearts === 0) {
        completeCurrentPart();
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      resetCurrentState();
    }
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    window.location.href = "/dashboard";
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  return {
    lesson,
    loading,
    currentPart,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedAnswer,
    isChecked,
    resultType,
    hearts,
    correctAnswers,
    isCompleted,
    summary,
    progressPercent,
    canCheck,
    showExitConfirm,
    lessonParts,
    vocabulary: lesson?.vocabulary ?? [],
    grammarQuestions,
    comprehensiveQuestions,
    selectedPart,
    completedParts,
    isPartUnlocked,
    openPart,
    handleSelectAnswer,
    handleCheckAnswer,
    handleContinue,
    handleExit,
    confirmExit,
    cancelExit,
  };
}
