"use client";

import React, { useState } from "react";
import AiFeedbackCard from "../AiFeedbackCard";
import { lessonService } from "../../services/lessonService";
import { AiFeedbackDto, WritingTopicDto } from "../../types/lesson";

interface Props {
  topic: WritingTopicDto;
  onSubmitted?: (feedback: AiFeedbackDto) => void;
}

export function CheckpointWritingExercise({ topic, onSubmitted }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AiFeedbackDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await lessonService.submitWriting({
        topicId: topic.id,
        userContent: text,
      });

      setFeedback(result.feedback);
      onSubmitted?.(result.feedback);
    } catch {
      setError("Có lỗi khi gửi bài, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <p className="text-xs font-semibold text-slate-500">Đề bài</p>
        <div className="mt-2 text-sm text-slate-700">{topic.promptTitle}</div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Viết bài của bạn ở đây..."
        disabled={loading}
        className="w-full rounded-lg border px-3 py-2 disabled:opacity-60"
      />

      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
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

      {feedback && <AiFeedbackCard feedback={feedback} showBand={true} />}
    </div>
  );
}

export default CheckpointWritingExercise;
