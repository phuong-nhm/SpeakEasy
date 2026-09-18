"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import AiFeedbackCard from "../AiFeedbackCard";
import { lessonService } from "../../services/lessonService";
import {
  AiFeedbackDto,
  ListeningOptionKey,
  ListeningPassageClientDto,
  ListeningPassageQuestionDto,
} from "../../types/lesson";

interface PassageListeningExerciseProps {
  passage: ListeningPassageClientDto;
  onQuestionCorrect?: () => void;
  onQuestionIncorrect?: () => void;
  onEssaySubmitted?: (feedback: AiFeedbackDto) => void;
  onComplete?: () => void;
}

const optionKeyMap: ListeningOptionKey[] = ["A", "B", "C", "D"];

const sortQuestions = (questions: ListeningPassageQuestionDto[]) =>
  [...questions].sort((a, b) => a.orderIndex - b.orderIndex);

export function PassageListeningExercise({
  passage,
  onQuestionCorrect,
  onQuestionIncorrect,
  onEssaySubmitted,
  onComplete,
}: PassageListeningExerciseProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionKey, setSelectedOptionKey] =
    useState<ListeningOptionKey | null>(null);
  const [essayContent, setEssayContent] = useState("");
  const [result, setResult] = useState<{
    type: "correct" | "incorrect" | "essay";
    message: string;
    correctOptionKey?: ListeningOptionKey;
    aiFeedback?: AiFeedbackDto;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const questionLocked = Boolean(result);

  const questions = useMemo(() => sortQuestions(passage.questions), [passage]);
  const currentQuestion = questions[currentIndex] ?? null;

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOptionKey(null);
    setEssayContent("");
    setResult(null);
    setIsCompleted(false);
    setLoading(false);
  }, [passage]);

  const playAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(passage.audioUrl);
    } else {
      audioRef.current.src = passage.audioUrl;
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  const advanceQuestion = () => {
    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isLastQuestion) {
      setIsCompleted(true);
      onComplete?.();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setSelectedOptionKey(null);
    setEssayContent("");
    setResult(null);
  };

  const handleSubmitMultipleChoice = async () => {
    if (!currentQuestion || !selectedOptionKey) return;

    setLoading(true);
    try {
      const response = await lessonService.submitMultipleChoice({
        questionId: currentQuestion.id,
        selectedOptionKey,
      });

      const isCorrect = response.isCorrect;

      setResult({
        type: isCorrect ? "correct" : "incorrect",
        message: isCorrect ? "Đúng rồi." : "Chưa đúng.",
        correctOptionKey: response.correctOptionKey,
      });

      if (isCorrect) {
        onQuestionCorrect?.();
      } else {
        onQuestionIncorrect?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEssay = async () => {
    if (!currentQuestion || !essayContent.trim()) return;

    setLoading(true);
    try {
      const response = await lessonService.submitEssay({
        questionId: currentQuestion.id,
        userContent: essayContent.trim(),
      });

      setResult({
        type: "essay",
        message: "Bài viết đã được chấm bằng AI.",
        aiFeedback: response.aiFeedback,
      });

      onEssaySubmitted?.(response.aiFeedback);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionBody = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.questionType === "MultipleChoice") {
      return (
        <div className="space-y-5">
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
              Listening passage
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-900">
              {currentQuestion.questionText}
            </h3>
          </div>

          <div className="grid gap-3">
            {optionKeyMap.map((key) => {
              const value = currentQuestion[
                `option${key}` as keyof ListeningPassageQuestionDto
              ] as string | undefined;

              if (!value) return null;

              const isSelected = selectedOptionKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedOptionKey(key)}
                  disabled={questionLocked}
                  className={`rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                    {key}
                  </span>
                  {value}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSubmitMultipleChoice}
            disabled={!selectedOptionKey || loading || questionLocked}
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "ĐANG CHẤM..." : "KIỂM TRA"}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600">
            Listening essay
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            {currentQuestion.questionText}
          </h3>
        </div>

        <textarea
          value={essayContent}
          onChange={(event) => setEssayContent(event.target.value)}
          rows={8}
          readOnly={questionLocked}
          placeholder="Nhập câu trả lời của bạn..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />

        <button
          type="button"
          onClick={handleSubmitEssay}
          disabled={loading || !essayContent.trim() || questionLocked}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "ĐANG CHẤM..." : "GỬI AI CHẤM BÀI"}
        </button>

        {result?.aiFeedback && <AiFeedbackCard feedback={result.aiFeedback} />}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Passage listening
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {passage.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={playAudio}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Phát audio
          </button>
        </div>

        <p className="mt-4 text-sm font-medium text-slate-600">
          Nghe đoạn dài và trả lời từng câu hỏi bên dưới.
        </p>
      </div>

      {renderQuestionBody()}

      {result && currentQuestion?.questionType === "MultipleChoice" && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            result.type === "correct"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {result.message}{" "}
          {result.correctOptionKey
            ? `Đáp án đúng: ${result.correctOptionKey}`
            : ""}
        </div>
      )}

      {result?.type === "essay" && result.aiFeedback && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {result.message}
          </div>
          <AiFeedbackCard feedback={result.aiFeedback} />
        </div>
      )}

      {result && (
        <button
          type="button"
          onClick={advanceQuestion}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {isCompleted ? "ĐÃ HOÀN THÀNH BÀI NGHE" : "CÂU TIẾP THEO"}
        </button>
      )}
    </div>
  );
}

export default PassageListeningExercise;
