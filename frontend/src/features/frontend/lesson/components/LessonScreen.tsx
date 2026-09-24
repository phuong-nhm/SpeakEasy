"use client";

import { useRouter } from "next/navigation";

import { useLessonFlow } from "../hooks/useLessonFlow";
import { ExerciseType } from "../types/lesson";
import { DialogueListenExercise } from "./exercises/DialogueListenExercise";
import { AnswerQuestionExercise } from "./exercises/AnswerQuestionExercise";
import { FillInBlankExercise } from "./exercises/FillInBlankExercise";
import { MatchingGameExercise } from "./exercises/MatchingGameExercise";
import { TranslateExercise } from "./exercises/TranslateExercise";
import { WordOrderExercise } from "./exercises/WordOrderExercise";
import { CompleteScreen } from "./CompleteScreen";
import { FooterAction } from "./FooterAction";
import { GrammarReferenceCard } from "./GrammarReferenceCard";
import { HeaderBar } from "./HeaderBar";
import { VocabFlashcardQuiz } from "./VocabFlashcardQuiz";
import { VocabIntroCard } from "./VocabIntroCard";
import { VocabMatchingGame } from "./VocabMatchingGame";

interface LessonScreenProps {
  lessonId: string;
}

export function LessonScreen({ lessonId }: LessonScreenProps) {
  const router = useRouter();
  const {
    lesson,
    loading,
    currentPart,
    currentQuestion,
    currentIndex,
    selectedAnswer,
    isChecked,
    resultType,
    hearts,
    progressPercent,
    canCheck,
    showExitConfirm,
    vocabSubStep,
    canStartGrammarFromVocabulary,
    vocabulary,
    lessonParts,
    completedParts,
    grammarQuestions,
    selectedPart,
    isPartUnlocked,
    openPart,
    handleSelectAnswer,
    handleCheckAnswer,
    handleAdvanceQuestions,
    recordAttemptResult,
    handleVocabularyContinueToFlashcard,
    handleVocabularyFlashcardComplete,
    handleVocabularyMatchingComplete,
    handleContinue,
    handleExit,
    confirmExit,
    cancelExit,
    isCompleted,
    summary,
    totalQuestions,
  } = useLessonFlow(lessonId);

  const renderExercise = () => {
    if (!currentQuestion) return null;

    const currentDialogueGroup =
      currentPart === "grammar" && currentQuestion.dialogueGroupId
        ? grammarQuestions
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

    if (currentDialogueGroup.length > 0) {
      return (
        <DialogueListenExercise
          questions={currentDialogueGroup}
          onQuestionResult={recordAttemptResult}
          onComplete={() => handleAdvanceQuestions(currentDialogueGroup.length)}
        />
      );
    }

    switch (currentQuestion.exerciseType) {
      case ExerciseType.WordOrder:
        return (
          <WordOrderExercise
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleSelectAnswer}
            isChecked={isChecked}
          />
        );
      case ExerciseType.FillInBlank:
        return (
          <FillInBlankExercise
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleSelectAnswer}
            isChecked={isChecked}
          />
        );
      case ExerciseType.TranslateFromVietnamese:
        return (
          <TranslateExercise
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleSelectAnswer}
          />
        );
      case ExerciseType.AnswerQuestion:
        return (
          <AnswerQuestionExercise
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleSelectAnswer}
          />
        );
      case "MatchingGame":
        return (
          <MatchingGameExercise
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerChange={handleSelectAnswer}
            isChecked={isChecked}
          />
        );
      default:
        return (
          <div className="mt-6 grid gap-3">
            {currentQuestion.options?.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect =
                isChecked && option === currentQuestion.correctAnswer;
              const isWrongSelected =
                isChecked &&
                isSelected &&
                option !== currentQuestion.correctAnswer;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isChecked}
                  className={`rounded-2xl border px-4 py-4 text-left text-base font-medium transition ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : isWrongSelected
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : isSelected
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );
    }
  };

  const partHeadingMap = {
    vocabulary: "Part 1 · Vocabulary",
    grammar: "Part 2 · Grammar",
    comprehensive: "Part 3 · Comprehensive",
  } as const;

  const partMeta = {
    vocabulary: {
      title: "Vocabulary",
      subtitle: "Ghi nhớ từ mới",
      accent: "violet",
    },
    grammar: {
      title: "Grammar",
      subtitle: "Luyện cấu trúc",
      accent: "indigo",
    },
    comprehensive: {
      title: "Review",
      subtitle: "Ôn tổng hợp",
      accent: "amber",
    },
  } as const;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
            Lesson not found
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">
            Không tìm thấy bài học
          </h2>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Quay lại dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderPartOverview = () => (
    <div className="space-y-5">
      <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">
          Lesson roadmap
        </p>
        <h3 className="mt-3 text-2xl font-black text-slate-900">
          Chọn phần học bạn muốn bắt đầu
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {lessonParts.map((part, index) => {
          const unlocked = isPartUnlocked(part);
          const completed = completedParts[part];
          const meta = partMeta[part];

          return (
            <button
              key={part}
              type="button"
              disabled={!unlocked}
              onClick={() => openPart(part)}
              className={`rounded-[24px] border p-5 text-left transition ${
                !unlocked
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Part {index + 1}
                </span>
                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase">
                  {completed ? "Done" : unlocked ? "Ready" : "Locked"}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-black">{meta.title}</h4>
                <p className="mt-1 text-sm opacity-80">{meta.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderBody = () => {
    if (!selectedPart) {
      return renderPartOverview();
    }

    if (selectedPart === "vocabulary") {
      if (vocabSubStep === "intro") {
        return (
          <VocabIntroCard
            vocabulary={vocabulary}
            onContinue={handleVocabularyContinueToFlashcard}
          />
        );
      }

      if (vocabSubStep === "flashcard") {
        return (
          <VocabFlashcardQuiz
            vocabulary={vocabulary}
            onComplete={handleVocabularyFlashcardComplete}
          />
        );
      }

      return (
        <VocabMatchingGame
          vocabulary={vocabulary}
          onComplete={handleVocabularyMatchingComplete}
        />
      );
    }

    return (
      <>
        {currentPart === "grammar" && lesson.grammarTopic && (
          <div className="mb-5 rounded-2xl bg-indigo-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Hôm nay học
            </p>
            <h3 className="mt-1 text-lg font-bold text-indigo-700">
              📘 {lesson.grammarTopic}
            </h3>
          </div>
        )}

        {currentPart === "grammar" && (
          <GrammarReferenceCard grammarNote={lesson.grammarNote ?? null} />
        )}

        <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Câu {currentQuestion ? currentIndex + 1 : 0}/{totalQuestions}
          </span>
          <span>{lesson.estimatedMinutes} phút</span>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            {currentQuestion?.prompt ?? "Exercise"}
          </p>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900">
            {currentQuestion?.questionText ?? "Đang chuẩn bị câu hỏi..."}
          </h2>
        </div>

        {renderExercise()}
      </>
    );
  };

  const renderFooter = () => {
    if (!selectedPart) {
      return null;
    }

    const currentDialogueGroup =
      currentPart === "grammar" && currentQuestion?.dialogueGroupId
        ? grammarQuestions.filter(
            (question) =>
              question.dialogueGroupId === currentQuestion.dialogueGroupId,
          )
        : [];

    if (currentDialogueGroup.length > 0) {
      return null;
    }

    if (selectedPart === "vocabulary") {
      if (!canStartGrammarFromVocabulary) {
        return null;
      }

      return (
        <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-2xl bg-violet-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-violet-700"
            >
              BẮT ĐẦU PHẦN 2 · GRAMMAR
            </button>
          </div>
        </footer>
      );
    }

    return (
      <FooterAction
        canCheck={canCheck}
        isChecked={isChecked}
        resultType={resultType}
        onCheck={handleCheckAnswer}
        onContinue={handleContinue}
        correctAnswer={currentQuestion?.correctAnswer}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <HeaderBar
        progressPercent={progressPercent}
        hearts={hearts}
        onExit={handleExit}
        showExitConfirm={showExitConfirm}
        onConfirmExit={confirmExit}
        onCancelExit={cancelExit}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {lesson.category}
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {lesson.title}
            </h1>
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
            +{lesson.xpReward} XP
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {selectedPart ? partHeadingMap[selectedPart] : "Lesson Overview"}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {renderBody()}
        </div>
      </main>

      {renderFooter()}

      {isCompleted && summary && (
        <CompleteScreen
          xpEarned={summary.xpEarned}
          accuracyPercent={summary.accuracyPercent}
          elapsedSeconds={summary.elapsedSeconds}
        />
      )}
    </div>
  );
}
