"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListeningExercise from "@/features/frontend/lesson/components/exercises/ListeningExercise";
import CheckpointWritingExercise from "@/features/frontend/lesson/components/exercises/CheckpointWritingExercise";

interface WritingTopicDto {
  id: string;
  chapterId: string;
  promptTitle: string;
  promptText: string;
}

interface ListeningDto {
  id: string;
  audioUrl: string;
  prompt?: string;
}

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
  const [listening, setListening] = useState<ListeningDto | null>(null);
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
        const l = await fetch(
          `/api/app/listening/by-chapter?chapterId=${chapterId}`,
        ).then((r) => r.json());
        if (!mounted) return;
        setWritingTopic(w[0] ?? null);
        setListening(l[0] ?? null);
      } catch (e) {
        // fallback mock
        if (!mounted) return;
        setWritingTopic({
          id: "mock-1",
          chapterId,
          promptTitle: "Describe your last holiday",
          promptText: "Write about where you went and what you did.",
        });
        setListening({
          id: "mock-a",
          audioUrl: "/audio/mock-a.mp3",
          prompt: "Listen and type the sentence.",
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

  const handleWritingSubmitted = async (feedback: any) => {
    // simple scoring: writing passes if feedback.score >= 80
    const fscore = feedback?.score ?? 0;
    if (fscore >= 80) setScore((s) => s + 1);
    else setHearts((h) => Math.max(0, h - 1));
  };

  useEffect(() => {
    // simple pass threshold: 80% of 3 tasks
    const totalTasks = 3; // multiple-choice/listen/write
    if (score / totalTasks >= 0.8 && hearts > 0) {
      setPassed(true);
    }
  }, [score, hearts]);

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

        {listening && (
          <div className="rounded-2xl border bg-white p-4">
            <h3 className="font-semibold">Listening task</h3>
            <ListeningExercise
              question={{
                id: listening.id,
                audioUrl: listening.audioUrl,
                prompt: listening.prompt,
                correctAnswer: "",
              }}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
            />
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
