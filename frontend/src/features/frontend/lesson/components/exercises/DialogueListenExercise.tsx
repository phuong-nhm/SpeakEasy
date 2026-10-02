"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ExerciseType, SentenceExerciseDto } from "../../types/lesson";

interface DialogueListenExerciseProps {
  questions: SentenceExerciseDto[];
  onQuestionResult: (isCorrect: boolean) => void;
  onComplete: () => void;
}

const normalizeText = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

const shuffleWords = (items: string[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
};

const buildWordBank = (question: SentenceExerciseDto) => {
  if (question.shuffledWords && question.shuffledWords.length > 0) {
    return question.shuffledWords;
  }

  return shuffleWords(question.correctSentence.split(/\s+/).filter(Boolean));
};

// Component ngoài: chỉ lo tiến trình cả đoạn hội thoại (đang ở câu mấy, đã xong chưa).
export function DialogueListenExercise({
  questions,
  onQuestionResult,
  onComplete,
}: DialogueListenExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;

  const handleAdvance = () => {
    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isLastQuestion) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  if (isCompleted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
          Đoạn hội thoại hoàn thành
        </p>
        <h3 className="mt-2 text-2xl font-black text-slate-900">
          Bạn đã hoàn thành toàn bộ lượt trong đoạn hội thoại này.
        </h3>
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          TIẾP TỤC
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <DialogueQuestionCard
      // Đổi câu hỏi (đổi id, hoặc đổi index nếu DTO không có id) -> React
      // tự dựng lại component con từ đầu, khỏi cần effect reset state.
      key={currentQuestion.id ?? currentIndex}
      question={currentQuestion}
      index={currentIndex}
      total={questions.length}
      onQuestionResult={onQuestionResult}
      onAdvance={handleAdvance}
    />
  );
}

interface DialogueQuestionCardProps {
  question: SentenceExerciseDto;
  index: number;
  total: number;
  onQuestionResult: (isCorrect: boolean) => void;
  onAdvance: () => void;
}

// Component trong: chỉ lo trạng thái của RIÊNG 1 câu hỏi đang hiển thị.
function DialogueQuestionCard({
  question,
  index,
  total,
  onQuestionResult,
  onAdvance,
}: DialogueQuestionCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect";
    message: string;
  } | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Chỉ dọn timer/audio khi component này bị huỷ (đổi sang câu khác hoặc unmount),
  // không setState trong effect nên không bị rule bắt.
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const wordBank = useMemo(() => {
    return question.exerciseType === ExerciseType.TranslateFromVietnamese
      ? buildWordBank(question)
      : [];
  }, [question]);

  const playAudio = () => {
    if (!question.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(question.audioUrl);
    } else {
      audioRef.current.src = question.audioUrl;
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  };

  const finishQuestion = (isCorrect: boolean) => {
    onQuestionResult(isCorrect);

    if (!isCorrect) return;

    setIsAdvancing(true);
    advanceTimerRef.current = window.setTimeout(() => {
      onAdvance();
    }, 450);
  };

  const handleCheckListenChoose = () => {
    if (!selectedAnswer) return;

    const isCorrect =
      normalizeText(selectedAnswer) === normalizeText(question.correctSentence);

    setFeedback(
      isCorrect
        ? {
            type: "correct",
            message: "Đúng rồi. Tự động chuyển lượt kế tiếp...",
          }
        : {
            type: "incorrect",
            message: "Chưa đúng, hãy nghe lại và chọn câu khác.",
          },
    );
    finishQuestion(isCorrect);
  };

  const handleToggleWord = (word: string) => {
    setSelectedWords((previous) =>
      previous.includes(word)
        ? previous.filter((item) => item !== word)
        : [...previous, word],
    );
  };

  const handleCheckTranslate = () => {
    const answer = selectedWords.join(" ");
    const isCorrect =
      normalizeText(answer) === normalizeText(question.correctSentence);

    setFeedback(
      isCorrect
        ? {
            type: "correct",
            message: "Chính xác. Tự động chuyển lượt kế tiếp...",
          }
        : {
            type: "incorrect",
            message: "Chưa đúng, hãy ghép lại câu hoàn chỉnh.",
          },
    );
    finishQuestion(isCorrect);
  };

  const renderContent = () => {
    if (question.exerciseType === ExerciseType.ListenChoose) {
      const options = question.listenOptions ?? [];

      return (
        <div className="space-y-5">
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600">
                  Dialogue listening
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  Lượt {index + 1}/{total}
                </h3>
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
              {question.promptText ?? "Nghe và chọn câu đúng."}
            </p>
          </div>

          <div className="grid gap-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedAnswer(option)}
                  disabled={isAdvancing}
                  className={`rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleCheckListenChoose}
            disabled={!selectedAnswer || isAdvancing}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            KIỂM TRA
          </button>
        </div>
      );
    }

    if (question.exerciseType === ExerciseType.TranslateFromVietnamese) {
      return (
        <div className="space-y-5">
          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600">
              Dialogue translation
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Lượt {index + 1}/{total}
            </h3>
            <p className="mt-4 text-base font-medium text-slate-700">
              {question.vietnameseTranslation ?? question.promptText}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Câu trả lời của bạn
            </p>
            <div className="mt-3 min-h-14 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
              {selectedWords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedWords.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => handleToggleWord(word)}
                      disabled={isAdvancing}
                      className="rounded-full border border-violet-300 bg-white px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">
                  Chọn các từ bên dưới để ghép câu.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {wordBank.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleToggleWord(word)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  selectedWords.includes(word)
                    ? "border-violet-300 bg-violet-100 text-violet-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                }`}
              >
                {word}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCheckTranslate}
              disabled={selectedWords.length === 0 || isAdvancing}
              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              KIỂM TRA
            </button>
            <button
              type="button"
              onClick={() => setSelectedWords([])}
              disabled={isAdvancing}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Xóa hết
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      {renderContent()}

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === "correct"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}

export default DialogueListenExercise;
