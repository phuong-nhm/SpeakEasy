"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CheckpointWritingExercise from "@/features/frontend/lesson/components/exercises/CheckpointWritingExercise";
import { DialogueListenExercise } from "@/features/frontend/lesson/components/exercises/DialogueListenExercise";
import { PassageListeningExercise } from "@/features/frontend/lesson/components/exercises/PassageListeningExercise";
import { lessonService } from "@/features/frontend/lesson/services/lessonService";
import {
  AiFeedbackDto,
  ExerciseType,
  ListeningPassageClientDto,
  SentenceExerciseDto,
} from "@/features/frontend/lesson/types/lesson";

interface WritingTopicDto {
  id: string;
  chapterId: string;
  promptTitle: string;
  promptText: string;
}

interface ListeningDto {
  passage: ListeningPassageClientDto;
}

type ListeningMode = "passage" | "dialogue";

const checkpointDialogueQuestions: SentenceExerciseDto[] = [
  {
    id: "checkpoint-dialogue-1",
    lessonId: "checkpoint-demo",
    sectionType: 1,
    exerciseType: ExerciseType.ListenChoose,
    dialogueGroupId: "checkpoint-demo-dialogue",
    orderInGroup: 1,
    prompt: "Nghe và chọn câu đúng.",
    questionText: "Choose the sentence you hear.",
    audioUrl: "/audio/checkpoint-dialogue-1.mp3",
    listenOptions: ["Let's meet after class.", "I am at the library."],
    correctSentence: "Let's meet after class.",
    correctAnswer: "Let's meet after class.",
    explanation: "A short spoken reply fits the dialogue flow.",
  },
  {
    id: "checkpoint-dialogue-2",
    lessonId: "checkpoint-demo",
    sectionType: 1,
    exerciseType: ExerciseType.TranslateFromVietnamese,
    dialogueGroupId: "checkpoint-demo-dialogue",
    orderInGroup: 2,
    prompt: "Dịch câu tiếng Việt.",
    questionText: "Translate into English.",
    vietnameseTranslation: "Chúng ta gặp nhau sau giờ học.",
    correctSentence: "We will meet after class.",
    correctAnswer: "We will meet after class.",
    shuffledWords: ["We", "will", "meet", "after", "class."],
    explanation: "This keeps the dialogue flow moving naturally.",
  },
];

export default function Page({ params }: { params: any }) {
  const router = useRouter();
  // `params` may be a Promise in Client Components — unwrap with React.use()
  const resolvedParams = (React as any).use
    ? (React as any).use(params)
    : params;
  const chapterId: string =
    resolvedParams?.chapterId ?? params?.chapterId ?? "unknown";
  const [writingTopic, setWritingTopic] = useState<WritingTopicDto | null>(
    null,
  );
  const [listeningPassage, setListeningPassage] =
    useState<ListeningPassageClientDto | null>(null);
  const [listeningMode, setListeningMode] = useState<ListeningMode>("passage");
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const w = await fetch(
          `/api/app/writing-topic/by-chapter?chapterId=${chapterId}`,
        ).then((r) => r.json());
        if (!mounted) return;
        setWritingTopic(w[0] ?? null);

        const passage = await lessonService.getPassageByChapter(chapterId);
        if (!mounted) return;
        setListeningPassage(passage);
      } catch (e) {
        // fallback mock
        if (!mounted) return;
        setWritingTopic({
          id: "mock-1",
          chapterId,
          promptTitle: "Describe your last holiday",
          promptText: "Write about where you went and what you did.",
        });
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

  const handleCorrect = () => setScore((s) => s + 1);
  const handleIncorrect = () => {
    setHearts((h) => Math.max(0, h - 1));
  };

  const handleWritingSubmitted = async (feedback: AiFeedbackDto) => {
    // simple scoring: writing passes if feedback.score >= 80
    const fscore = feedback?.score ?? 0;
    if (fscore >= 80) setScore((s) => s + 1);
    else setHearts((h) => Math.max(0, h - 1));
  };

  const currentListeningTaskCount =
    listeningMode === "passage"
      ? (listeningPassage?.questions.length ?? 0)
      : checkpointDialogueQuestions.length;

  useEffect(() => {
    const totalTasks = Math.max(
      1,
      currentListeningTaskCount + (writingTopic ? 1 : 0),
    );

    if (score / totalTasks >= 0.8 && hearts > 0) {
      setPassed(true);
    }
  }, [
    score,
    hearts,
    listeningPassage,
    writingTopic,
    currentListeningTaskCount,
  ]);

  const unlockNext = async () => {
    try {
      await fetch(`/api/app/chapter/${chapterId}/unlock-checkpoint`, {
        method: "POST",
      });
    } catch (e) {
      // ignore
    }
    // navigate back to chapter or dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <main className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Checkpoint — Chapter {chapterId}
            </h2>
            <div>Hearts: {"❤️".repeat(hearts)}</div>
          </div>
        </div>

        {listeningPassage && (
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Listening task</h3>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setListeningMode("passage")}
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
                  onClick={() => setListeningMode("dialogue")}
                  className={`rounded-full px-3 py-1.5 transition ${
                    listeningMode === "dialogue"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "hover:bg-slate-100"
                  }`}
                >
                  Hội thoại
                </button>
              </div>
            </div>

            {listeningMode === "passage" ? (
              <PassageListeningExercise
                passage={listeningPassage}
                onCorrect={handleCorrect}
                onIncorrect={handleIncorrect}
                onEssaySubmitted={handleWritingSubmitted}
              />
            ) : (
              <DialogueListenExercise
                questions={checkpointDialogueQuestions}
                onQuestionResult={(isCorrect) =>
                  isCorrect ? handleCorrect() : handleIncorrect()
                }
                onComplete={() => {
                  // no-op: passage/demonstration mode already counts by per-question result
                }}
              />
            )}
          </div>
        )}

        {writingTopic && (
          <div className="rounded-2xl border bg-white p-4">
            <h3 className="font-semibold">Writing task</h3>
            <CheckpointWritingExercise
              topic={writingTopic}
              onSubmitted={handleWritingSubmitted}
            />
          </div>
        )}

        <div className="rounded-2xl border bg-white p-4 text-center">
          <div className="text-sm text-slate-600">Score: {score}</div>
          {passed ? (
            <div className="mt-3">
              <div className="text-lg font-bold text-emerald-700">Passed!</div>
              <button
                onClick={unlockNext}
                className="mt-3 rounded-2xl bg-emerald-600 px-4 py-2 text-white"
              >
                Mở khóa Chapter tiếp theo
              </button>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-500">
              Reach ≥80% to pass
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
