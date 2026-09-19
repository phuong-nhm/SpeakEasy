export { PassageListeningExercise as default } from "./PassageListeningExercise";
("use client");

import React, { useState, useRef } from "react";

interface ListeningQuestion {
  id: string;
  audioUrl: string;
  prompt?: string;
  correctAnswer?: string;
  options?: string[];
}

interface Props {
  question: ListeningQuestion;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function ListeningExercise({ question, onCorrect, onIncorrect }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);

  const play = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(question.audioUrl);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const handleCheck = () => {
    setChecked(true);
    const normalized = (input || "").trim().toLowerCase();
    const correct = (question.correctAnswer || "").trim().toLowerCase();
    if (normalized && correct && normalized === correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {question.prompt ?? "Nghe đoạn audio và trả lời"}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Play
        </button>
        <span className="text-xs text-slate-500">Click để nghe lại</span>
      </div>

      {question.options && question.options.length > 0 ? (
        <div className="grid gap-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setInput(opt)}
              className={`rounded-2xl border px-4 py-3 text-left ${input === opt ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Gõ lại câu nghe được"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={checked}
          className="rounded-2xl bg-emerald-600 px-4 py-2 text-white"
        >
          KIỂM TRA
        </button>
      </div>
    </div>
  );
}
