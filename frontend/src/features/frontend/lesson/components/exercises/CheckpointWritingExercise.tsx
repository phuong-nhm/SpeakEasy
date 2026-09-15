"use client";

import React, { useState } from "react";
import AiFeedbackCard from "../AiFeedbackCard";

export interface WritingTopicDto {
  id: string;
  chapterId: string;
  promptTitle: string;
  promptText: string;
}

interface Props {
  topic: WritingTopicDto;
  onSubmitted?: (feedback: any) => void;
}

export function CheckpointWritingExercise({ topic, onSubmitted }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/app/user-writing/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, content: text }),
      });

      const json = await res.json();
      setFeedback(json.aiFeedback ?? json);
      onSubmitted?.(json.aiFeedback ?? json);
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <p className="text-xs font-semibold text-slate-500">
          {topic.promptTitle}
        </p>
        <div className="mt-2 text-sm text-slate-700">{topic.promptText}</div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Viết bài của bạn ở đây..."
        className="w-full rounded-lg border px-3 py-2"
      />

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-white"
        >
          {loading ? "GỬI ĐANG CHẤM..." : "GỬI AI CHẤM BÀI"}
        </button>
      </div>

      {loading && (
        <div className="mt-4 animate-pulse space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
        </div>
      )}

      {feedback && <AiFeedbackCard feedback={feedback} />}
    </div>
  );
}

export default CheckpointWritingExercise;
