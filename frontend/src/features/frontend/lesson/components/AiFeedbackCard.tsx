"use client";

import React from "react";

import { AiFeedbackDto } from "../types/lesson";

interface Props {
  feedback: AiFeedbackDto;
  showBand?: boolean;
}

export default function AiFeedbackCard({ feedback, showBand = true }: Props) {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">AI Feedback</div>
          {showBand && (
            <div className="mt-1 text-lg font-bold">
              Band: {feedback.band ?? "N/A"}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Score</div>
          <div className="mt-1 text-2xl font-black">
            {feedback.score ?? "-"}
          </div>
        </div>
      </div>

      {feedback.explanation && (
        <div className="mt-4 text-sm text-slate-600">
          {feedback.explanation}
        </div>
      )}

      {feedback.errors && feedback.errors.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold">Errors</h4>
          <ul className="mt-2 list-inside list-decimal space-y-2 text-sm text-slate-700">
            {feedback.errors.map((err, idx) => (
              <li key={idx}>
                <div className="font-semibold">{err.errorType}</div>
                <div className="text-xs text-slate-500">
                  Original: {err.originalText}
                </div>
                <div className="text-xs text-emerald-700">
                  Suggestion: {err.suggestion}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.suggestedCorrection && (
        <div className="mt-4">
          <h4 className="text-sm font-bold">Improved version</h4>
          <div className="mt-2 rounded-lg border p-3 text-sm text-slate-800 bg-slate-50">
            {feedback.suggestedCorrection}
          </div>
        </div>
      )}
    </div>
  );
}
