"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { DialogueListenExercise } from "@/features/frontend/lesson/components/exercises/DialogueListenExercise";
import { PassageListeningExercise } from "@/features/frontend/lesson/components/exercises/PassageListeningExercise";
import { lessonService } from "@/features/frontend/lesson/services/lessonService";
import {
  AiFeedbackDto,
  ExerciseType,
  ListeningPassageClientDto,
  SentenceExerciseDto,
} from "@/features/frontend/lesson/types/lesson";

type ListeningMode = "passage" | "dialogue";

const dialogueQuestions: SentenceExerciseDto[] = [
  {
    id: "listen-page-dialogue-1",
    lessonId: "chapter-listening-demo",
    sectionType: 1,
    exerciseType: ExerciseType.ListenChoose,
    dialogueGroupId: "chapter-listening-demo",
    orderInGroup: 1,
    promptText: "Nghe và chọn câu đúng.",
    audioUrl: "/audio/checkpoint-dialogue-1.mp3",
    listenOptions: ["Let's meet after class.", "I am at the library."],
    correctSentence: "Let's meet after class.",
  },
  {
    id: "listen-page-dialogue-2",
    lessonId: "chapter-listening-demo",
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    dialogueGroupId: "chapter-listening-demo",
    orderInGroup: 2,
    promptText: "Dịch câu tiếng Việt.",
    vietnameseTranslation: "Chúng ta gặp nhau sau giờ học.",
    correctSentence: "We will meet after class.",
    shuffledWords: ["We", "will", "meet", "after", "class."],
  },
];

export default function ListeningChapterPage() {
  const router = useRouter();
  const params = useParams<{ chapterId: string }>();

  const chapterId: string = params?.chapterId ?? "unknown";

  const [listeningPassage, setListeningPassage] =
    useState<ListeningPassageClientDto | null>(null);
  const [listeningMode, setListeningMode] = useState<ListeningMode>("passage");
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const passage = await lessonService.getPassageByChapter(chapterId);
        if (!mounted) return;
        setListeningPassage(passage);
      } catch {
        if (!mounted) return;
        setListeningPassage({
          title: "Mock listening passage",
          audioUrl: "/audio/mock-a.mp3",
          questions: [
            {
              id: "mock-listen-1",
              questionType: "MultipleChoice",
              questionText: "What did the speaker mention?",
              optionA: "A book.",
              optionB: "A school.",
              optionC: "A bus.",
              optionD: "A friend.",
              orderIndex: 1,
            },
          ],
        });
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [chapterId]);

  const handleModeChange = (mode: ListeningMode) => {
    setListeningMode(mode);
    setHearts(3);
    setScore(0);
  };

  const handleCorrect = () => setScore((value) => value + 1);
  const handleIncorrect = () => setHearts((value) => Math.max(0, value - 1));

  const handleEssaySubmitted = (feedback: AiFeedbackDto) => {
    if ((feedback.score ?? 0) >= 80) {
      setScore((value) => value + 1);
      return;
    }

    setHearts((value) => Math.max(0, value - 1));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              Listening — Chapter {chapterId}
            </h2>
            <div className="text-sm font-semibold text-slate-700">
              Hearts: {"❤️".repeat(hearts)}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Chọn dạng bài nghe bạn muốn luyện.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleModeChange("passage")}
              className={`rounded-full px-3 py-1.5 transition ${
                listeningMode === "passage"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "hover:bg-slate-100"
              }`}
            >
              Đoạn dài
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("dialogue")}
              className={`rounded-full px-3 py-1.5 transition ${
                listeningMode === "dialogue"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "hover:bg-slate-100"
              }`}
            >
              Hội thoại
            </button>
          </div>

          <div className="mt-4">
            {listeningMode === "passage" && listeningPassage ? (
              <PassageListeningExercise
                passage={listeningPassage}
                onQuestionCorrect={handleCorrect}
                onQuestionIncorrect={handleIncorrect}
                onEssaySubmitted={handleEssaySubmitted}
              />
            ) : (
              <DialogueListenExercise
                questions={dialogueQuestions}
                onQuestionResult={(isCorrect) => {
                  if (isCorrect) handleCorrect();
                  else handleIncorrect();
                }}
                onComplete={() => {
                  // dialogue component already tracks completion state internally.
                }}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600">
          Score hiện tại:{" "}
          <span className="font-semibold text-slate-900">{score}</span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Quay lại dashboard
        </button>
      </main>
    </div>
  );
}
