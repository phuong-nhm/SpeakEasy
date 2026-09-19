"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { lessonService } from "@/features/frontend/lesson/services/lessonService";
import {
  ExerciseType,
  LessonQuestion,
  SentenceExerciseDto,
} from "@/features/frontend/lesson/types/lesson";
import { AnswerQuestionExercise } from "@/features/frontend/lesson/components/exercises/AnswerQuestionExercise";
import { DialogueListenExercise } from "@/features/frontend/lesson/components/exercises/DialogueListenExercise";
import { FillInBlankExercise } from "@/features/frontend/lesson/components/exercises/FillInBlankExercise";
import { TranslateExercise } from "@/features/frontend/lesson/components/exercises/TranslateExercise";
import { WordOrderExercise } from "@/features/frontend/lesson/components/exercises/WordOrderExercise";

const PASS_PERCENT = 80;
const DEFAULT_HEARTS = 3;

type CheckResult = "correct" | "incorrect" | null;

const normalizeAnswer = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const toLessonQuestion = (exercise: SentenceExerciseDto): LessonQuestion => ({
  id: exercise.id,
  lessonId: exercise.lessonId,
  sectionType: exercise.sectionType,
  exerciseType: exercise.exerciseType,
  promptText: exercise.promptText,
  prompt: exercise.promptText ?? "Checkpoint question",
  questionText:
    exercise.questionText ?? exercise.promptText ?? "Checkpoint question",
  vietnameseTranslation: exercise.vietnameseTranslation,
  correctSentence: exercise.correctSentence,
  correctAnswer: exercise.correctAnswer ?? exercise.correctSentence,
  options: exercise.options ?? exercise.listenOptions,
  listenOptions: exercise.listenOptions,
  wordBank: exercise.wordBank,
  shuffledWords: exercise.shuffledWords,
  audioUrl: exercise.audioUrl,
  dialogueGroupId: exercise.dialogueGroupId,
  orderInGroup: exercise.orderInGroup,
  explanation: "",
});

const normalizeCheckpointList = (items: SentenceExerciseDto[]) => {
  const visitedGroups = new Set<string>();
  const normalized: SentenceExerciseDto[] = [];

  items.forEach((exercise) => {
    if (!exercise.dialogueGroupId) {
      normalized.push(exercise);
      return;
    }

    if (visitedGroups.has(exercise.dialogueGroupId)) {
      return;
    }

    visitedGroups.add(exercise.dialogueGroupId);

    const dialogueGroup = items
      .filter(
        (candidate) => candidate.dialogueGroupId === exercise.dialogueGroupId,
      )
      .sort((left, right) => {
        const orderLeft = left.orderInGroup ?? Number.MAX_SAFE_INTEGER;
        const orderRight = right.orderInGroup ?? Number.MAX_SAFE_INTEGER;

        return orderLeft - orderRight;
      });

    normalized.push(...dialogueGroup);
  });

  return normalized;
};

export default function CheckpointChapterPage() {
  const router = useRouter();
  const params = useParams<{ chapterId: string }>();
  const chapterId = params?.chapterId ?? "unknown";

  const [questions, setQuestions] = useState<SentenceExerciseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [resultType, setResultType] = useState<CheckResult>(null);

  const [hearts, setHearts] = useState(DEFAULT_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const [isFinished, setIsFinished] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const loadCheckpoint = async () => {
    setIsLoading(true);
    setLoadError(null);
    setUnlockError(null);

    try {
      const rawQuestions =
        await lessonService.getCheckpointExercises(chapterId);
      const normalizedQuestions = normalizeCheckpointList(rawQuestions);

      setQuestions(normalizedQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsChecked(false);
      setResultType(null);
      setHearts(DEFAULT_HEARTS);
      setCorrectCount(0);
      setAnsweredCount(0);
      setIsFinished(false);
    } catch {
      setLoadError("Không thể tải bộ câu hỏi checkpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCheckpoint();
  }, [chapterId]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] ?? null;
  const currentDialogueGroup = currentQuestion?.dialogueGroupId
    ? questions
        .filter(
          (question) =>
            question.dialogueGroupId === currentQuestion.dialogueGroupId,
        )
        .sort((left, right) => {
          const orderLeft = left.orderInGroup ?? Number.MAX_SAFE_INTEGER;
          const orderRight = right.orderInGroup ?? Number.MAX_SAFE_INTEGER;

          return orderLeft - orderRight;
        })
    : [];

  const currentQuestionForRender =
    currentQuestion && currentDialogueGroup.length === 0
      ? toLessonQuestion(currentQuestion)
      : null;

  const progressPercent =
    totalQuestions > 0
      ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100))
      : 0;

  const accuracyPercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const isPassed = accuracyPercent >= PASS_PERCENT;

  const finishCheckpoint = () => {
    if (isFinished) return;
    setIsFinished(true);
  };

  useEffect(() => {
    if (isFinished || totalQuestions === 0) {
      return;
    }

    if (hearts <= 0 || answeredCount >= totalQuestions) {
      finishCheckpoint();
    }
  }, [answeredCount, hearts, isFinished, totalQuestions]);

  useEffect(() => {
    if (!isFinished || !isPassed || isUnlocking) {
      return;
    }

    const unlockChapter = async () => {
      try {
        setIsUnlocking(true);
        setUnlockError(null);

        const response = await fetch(
          `/api/app/chapter/${encodeURIComponent(chapterId)}/unlock-checkpoint`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unlock failed");
        }

        router.push("/dashboard");
      } catch {
        setUnlockError("Mở khóa chapter chưa thành công. Bạn có thể thử lại.");
      } finally {
        setIsUnlocking(false);
      }
    };

    void unlockChapter();
  }, [chapterId, isFinished, isPassed, isUnlocking, router]);

  const applyQuestionResult = (isCorrect: boolean) => {
    setAnsweredCount((count) => count + 1);

    if (isCorrect) {
      setCorrectCount((count) => count + 1);
      return;
    }

    setHearts((value) => Math.max(0, value - 1));
  };

  const evaluateCurrentAnswer = () => {
    if (!currentQuestion || !selectedAnswer || !selectedAnswer.trim()) {
      return;
    }

    const correctAnswer =
      currentQuestion.correctAnswer ?? currentQuestion.correctSentence;
    const isCorrect =
      normalizeAnswer(selectedAnswer) === normalizeAnswer(correctAnswer);

    applyQuestionResult(isCorrect);
    setIsChecked(true);
    setResultType(isCorrect ? "correct" : "incorrect");
  };

  const moveNext = () => {
    setCurrentIndex((index) => index + 1);
    setSelectedAnswer(null);
    setIsChecked(false);
    setResultType(null);
  };

  const handleContinue = () => {
    if (answeredCount >= totalQuestions || hearts <= 0) {
      finishCheckpoint();
      return;
    }

    moveNext();
  };

  const onDialogueResult = (isCorrect: boolean) => {
    applyQuestionResult(isCorrect);
  };

  const onDialogueComplete = () => {
    setCurrentIndex((index) => index + currentDialogueGroup.length);
    setSelectedAnswer(null);
    setIsChecked(false);
    setResultType(null);
  };

  const canCheck = !!selectedAnswer && selectedAnswer.trim().length > 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="h-5 w-56 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <main className="mx-auto max-w-2xl px-4">
          <div className="rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadCheckpoint()}
              className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Thử tải lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <main className="mx-auto max-w-2xl px-4">
          <div className="rounded-[28px] border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Checkpoint summary
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              {isPassed ? "Bạn đã vượt qua checkpoint" : "Checkpoint chưa đạt"}
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-indigo-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-600">
                  Đúng
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {correctCount}/{totalQuestions}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">
                  Tỷ lệ
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {accuracyPercent}%
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-600">
                  Heart còn
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {hearts}
                </p>
              </div>
            </div>

            {isPassed ? (
              <>
                <p className="mt-5 text-sm text-slate-600">
                  Đạt yêu cầu {PASS_PERCENT}%. Hệ thống đang mở khóa checkpoint
                  và chuyển về dashboard.
                </p>
                {unlockError && (
                  <p className="mt-3 text-sm font-semibold text-rose-600">
                    {unlockError}
                  </p>
                )}
                {unlockError && (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Về dashboard
                  </button>
                )}
              </>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void loadCheckpoint()}
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Làm lại với bộ câu mới
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Quay lại dashboard
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700">
              Checkpoint Chapter {chapterId}
            </p>
            <p className="text-sm font-bold text-rose-600">
              Hearts: {"❤️".repeat(hearts)}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-4xl px-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Câu {Math.min(answeredCount + 1, totalQuestions)}/{totalQuestions}
            </span>
            <span>{accuracyPercent}% đúng</span>
          </div>

          {currentDialogueGroup.length > 0 ? (
            <DialogueListenExercise
              questions={currentDialogueGroup}
              onQuestionResult={onDialogueResult}
              onComplete={onDialogueComplete}
            />
          ) : currentQuestionForRender ? (
            <div className="space-y-5">
              {currentQuestionForRender.exerciseType ===
                ExerciseType.WordOrder && (
                <WordOrderExercise
                  question={currentQuestionForRender}
                  selectedAnswer={selectedAnswer}
                  onAnswerChange={setSelectedAnswer}
                  isChecked={isChecked}
                />
              )}

              {currentQuestionForRender.exerciseType ===
                ExerciseType.FillInBlank && (
                <FillInBlankExercise
                  question={currentQuestionForRender}
                  selectedAnswer={selectedAnswer}
                  onAnswerChange={setSelectedAnswer}
                  isChecked={isChecked}
                />
              )}

              {currentQuestionForRender.exerciseType ===
                ExerciseType.AnswerQuestion && (
                <AnswerQuestionExercise
                  question={currentQuestionForRender}
                  selectedAnswer={selectedAnswer}
                  onAnswerChange={setSelectedAnswer}
                />
              )}

              {currentQuestionForRender.exerciseType ===
                ExerciseType.TranslateFromVietnamese && (
                <TranslateExercise
                  question={currentQuestionForRender}
                  selectedAnswer={selectedAnswer}
                  onAnswerChange={setSelectedAnswer}
                />
              )}

              {![
                ExerciseType.WordOrder,
                ExerciseType.FillInBlank,
                ExerciseType.AnswerQuestion,
                ExerciseType.TranslateFromVietnamese,
              ].includes(
                currentQuestionForRender.exerciseType as ExerciseType,
              ) && (
                <TranslateExercise
                  question={currentQuestionForRender}
                  selectedAnswer={selectedAnswer}
                  onAnswerChange={setSelectedAnswer}
                />
              )}

              {isChecked && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    resultType === "correct"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {resultType === "correct"
                    ? "Chính xác!"
                    : "Chưa đúng, tiếp tục câu kế tiếp nhé."}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {!isChecked ? (
                  <button
                    type="button"
                    onClick={evaluateCurrentAnswer}
                    disabled={!canCheck}
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    KIỂM TRA
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    TIẾP TỤC
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Không còn câu hỏi để hiển thị.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
