"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { lessonService } from "../services/lessonService";
import {
  CheckSentenceAnswerRequest,
  ExerciseType,
  GrammarNoteDto,
  LessonDto,
  SectionType,
  SentenceExerciseDto,
  VocabularyDto,
  VocabularyQuizDto,
} from "../types/lesson";

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
type VocabSubStep = "intro" | "flashcard" | "matching";

const defaultCompletedParts: CompletedParts = {
  vocabulary: false,
  grammar: false,
  comprehensive: false,
};

// Backend không trả hearts/xp mặc định -> FE tự định nghĩa cứng
const DEFAULT_HEARTS = 5;
const XP_PER_CORRECT = 30;
const XP_PER_HEART_LEFT = 10;

export function useLessonFlow(lessonId: string) {
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [grammarNote, setGrammarNote] = useState<GrammarNoteDto | null>(null);
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [sentences, setSentences] = useState<SentenceExerciseDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState<LessonPart | null>(null);
  const [completedParts, setCompletedParts] = useState<CompletedParts>(
    defaultCompletedParts,
  );

  // Đáp án người dùng chọn - tuỳ ExerciseType mà dùng field khác nhau
  const [selectedWords, setSelectedWords] = useState<string[]>([]); // WordOrder, TranslateFromVietnamese
  const [selectedText, setSelectedText] = useState(""); // AnswerQuestion, FillInBlank
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null); // ListenChoose

  const [isChecking, setIsChecking] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [resultType, setResultType] = useState<"correct" | "incorrect" | null>(
    null,
  );

  const [hearts, setHearts] = useState(DEFAULT_HEARTS);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [vocabSubStep, setVocabSubStep] = useState<VocabSubStep>("intro");
  const [isVocabularyMatchingCompleted, setIsVocabularyMatchingCompleted] =
    useState(false);

  const startedAtRef = useRef<number>(0);

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
    setSelectedWords([]);
    setSelectedText("");
    setSelectedSentence(null);
    setIsChecked(false);
    setResultType(null);
  };

  const recordAttemptResult = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      return;
    }
    setHearts((prev) => Math.max(0, prev - 1));
  };

  const openPart = (part: LessonPart) => {
    if (!isPartUnlocked(part)) return;

    setSelectedPart(part);
    if (part === "vocabulary") {
      setVocabSubStep("intro");
      setIsVocabularyMatchingCompleted(false);
    }
    setCurrentIndex(0);
    resetCurrentState();
  };

  // ===== LOAD DATA =====
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const [content, note] = await Promise.all([
          lessonService.getLessonContent(lessonId),
          lessonService.getGrammarNoteByLesson(lessonId),
        ]);

        if (!isMounted) return;

        setLesson(content.lesson);
        setVocabularies(content.vocabularies);
        setSentences(content.sentences);
        setGrammarNote(note);

        setHearts(DEFAULT_HEARTS);
        setSelectedPart(null);
        setCompletedParts(defaultCompletedParts);
        setCurrentIndex(0);
        resetCurrentState();
        setCorrectAnswers(0);
        setIsCompleted(false);
        setSummary(null);
        setVocabSubStep("intro");
        setIsVocabularyMatchingCompleted(false);
        startedAtRef.current = Date.now();
      } catch (error) {
        if (isMounted) {
          setLesson(null);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu bài học.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  // ===== PHÂN LOẠI SENTENCES THEO PHẦN =====
  const grammarQuestions = useMemo<SentenceExerciseDto[]>(() => {
    return sentences.filter((s) => s.sectionType === SectionType.Grammar);
  }, [sentences]);

  const comprehensiveQuestions = useMemo<SentenceExerciseDto[]>(() => {
    const questions = sentences.filter(
      (s) => s.sectionType === SectionType.Review,
    );
    return shuffleItems(questions);
  }, [sentences]);

  const currentPart = selectedPart ?? "vocabulary";

  const partQuestions = useMemo<SentenceExerciseDto[]>(() => {
    if (currentPart === "grammar") return grammarQuestions;
    if (currentPart === "comprehensive") return comprehensiveQuestions;
    return [];
  }, [comprehensiveQuestions, currentPart, grammarQuestions]);

  const currentQuestion = useMemo<SentenceExerciseDto | null>(() => {
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

  const hasAnswerSelected = () => {
    if (!currentQuestion) return false;
    switch (currentQuestion.exerciseType) {
      case ExerciseType.WordOrder:
      case ExerciseType.TranslateFromVietnamese:
        return selectedWords.length > 0;
      case ExerciseType.FillInBlank:
      case ExerciseType.AnswerQuestion:
        return selectedText.trim().length > 0;
      case ExerciseType.ListenChoose:
        return Boolean(selectedSentence);
      default:
        return false;
    }
  };

  const canCheck =
    selectedPart !== null &&
    selectedPart !== "vocabulary" &&
    hasAnswerSelected() &&
    !isChecked &&
    !isChecking &&
    !isCompleted;

  // ===== SELECT ANSWER HANDLERS (theo từng dạng) =====
  const handleSelectWords = (words: string[]) => {
    if (isChecked || isCompleted) return;
    setSelectedWords(words);
  };

  const handleSelectText = (text: string) => {
    if (isChecked || isCompleted) return;
    setSelectedText(text);
  };

  const handleSelectSentence = (sentence: string) => {
    if (isChecked || isCompleted) return;
    setSelectedSentence(sentence);
  };

  // ===== CHECK ANSWER (gọi API thật) =====
  const handleCheckAnswer = async () => {
    if (!currentQuestion || isChecked || isChecking || isCompleted) return;

    const request: CheckSentenceAnswerRequest = {
      exerciseId: currentQuestion.id,
    };

    switch (currentQuestion.exerciseType) {
      case ExerciseType.WordOrder:
      case ExerciseType.TranslateFromVietnamese:
        request.userOrderedWords = selectedWords;
        break;
      case ExerciseType.FillInBlank:
        request.userAnswerText = selectedText;
        request.blankIndex = currentQuestion.blankIndex;
        break;
      case ExerciseType.AnswerQuestion:
        request.userAnswerText = selectedText;
        break;
      case ExerciseType.ListenChoose:
        request.userSelectedSentence = selectedSentence ?? "";
        break;
    }

    setIsChecking(true);

    try {
      const isCorrect = await lessonService.submitSentenceAnswer(request);
      setIsChecked(true);
      setResultType(isCorrect ? "correct" : "incorrect");
      recordAttemptResult(isCorrect);
    } catch {
      // Lỗi mạng/server - không đánh dấu đã check, cho người dùng thử lại
    } finally {
      setIsChecking(false);
    }
  };

  const handleAdvanceQuestions = (step = 1) => {
    if (!lesson || !selectedPart) return;

    const totalLength =
      selectedPart === "grammar"
        ? grammarQuestions.length
        : selectedPart === "comprehensive"
          ? comprehensiveQuestions.length
          : 0;

    if (totalLength === 0) return;

    const nextIndex = currentIndex + step;

    if (nextIndex >= totalLength) {
      completeCurrentPart();
      return;
    }

    setCurrentIndex(nextIndex);
    resetCurrentState();
  };

  // ===== FINALIZE (gọi API submit kết quả thật) =====
  const finalizeLesson = async () => {
    if (!lesson) return;

    const totalAnswered =
      grammarQuestions.length + comprehensiveQuestions.length;
    const elapsedSeconds = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 1000),
    );
    const accuracyPercent =
      totalAnswered === 0
        ? 0
        : Math.round((correctAnswers / totalAnswered) * 100);
    const xpEarned =
      correctAnswers * XP_PER_CORRECT + hearts * XP_PER_HEART_LEFT;

    setSummary({ xpEarned, accuracyPercent, elapsedSeconds });
    setIsCompleted(true);
    setSelectedPart(null);
    setCurrentIndex(0);
    resetCurrentState();

    try {
      await lessonService.submitLessonResult({
        lessonId: lesson.id,
        correctAnswers,
        totalQuestions: totalAnswered,
        xpEarned,
        heartsLeft: hearts,
        accuracyPercent,
        elapsedSeconds,
      });
    } catch {
      // Không chặn UI nếu submit lỗi - người dùng đã thấy summary rồi
      // Có thể thêm retry/log sau nếu cần
    }
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

    if (selectedPart === "vocabulary") {
      setVocabSubStep("intro");
      setIsVocabularyMatchingCompleted(false);
    }

    setSelectedPart(null);
    setCurrentIndex(0);
    resetCurrentState();
  };

  // ===== VOCABULARY SUB-FLOW =====
  const handleVocabularyContinueToFlashcard = () => {
    if (!selectedPart || selectedPart !== "vocabulary") return;
    setVocabSubStep("flashcard");
  };

  const handleVocabularyFlashcardComplete = () => {
    if (!selectedPart || selectedPart !== "vocabulary") return;
    setVocabSubStep("matching");
  };

  const handleVocabularyMatchingComplete = () => {
    if (!selectedPart || selectedPart !== "vocabulary") return;
    setIsVocabularyMatchingCompleted(true);
  };

  const canStartGrammarFromVocabulary =
    selectedPart === "vocabulary" &&
    vocabSubStep === "matching" &&
    isVocabularyMatchingCompleted;

  const handleContinue = () => {
    if (!lesson || !selectedPart) return;

    if (selectedPart === "vocabulary") {
      if (!canStartGrammarFromVocabulary) return;
      completeCurrentPart();
      return;
    }

    if (selectedPart === "grammar") {
      handleAdvanceQuestions(1);
      return;
    }

    if (selectedPart === "comprehensive") {
      if (hearts === 0) {
        completeCurrentPart();
        return;
      }
      handleAdvanceQuestions(1);
    }
  };

  const handleExit = () => setShowExitConfirm(true);
  const confirmExit = () => {
    setShowExitConfirm(false);
    window.location.href = "/dashboard";
  };
  const cancelExit = () => setShowExitConfirm(false);

  return {
    lesson,
    grammarNote,
    loading,
    loadError,
    currentPart,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedWords,
    selectedText,
    selectedSentence,
    isChecking,
    isChecked,
    resultType,
    hearts,
    correctAnswers,
    isCompleted,
    summary,
    progressPercent,
    canCheck,
    showExitConfirm,
    vocabSubStep,
    isVocabularyMatchingCompleted,
    canStartGrammarFromVocabulary,
    lessonParts,
    vocabularies,
    grammarQuestions,
    comprehensiveQuestions,
    selectedPart,
    completedParts,
    isPartUnlocked,
    openPart,
    handleSelectWords,
    handleSelectText,
    handleSelectSentence,
    handleCheckAnswer,
    handleAdvanceQuestions,
    handleVocabularyContinueToFlashcard,
    handleVocabularyFlashcardComplete,
    handleVocabularyMatchingComplete,
    handleContinue,
    handleExit,
    confirmExit,
    cancelExit,
    recordAttemptResult,
  };
}
