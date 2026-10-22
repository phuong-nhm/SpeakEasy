"use client";

import { useState } from "react";

import { GrammarFormType, GrammarNoteDto } from "../types/lesson";

interface GrammarReferenceCardProps {
  grammarNote: GrammarNoteDto | null;
}

const FORM_TYPE_LABELS: Record<GrammarFormType, string> = {
  [GrammarFormType.Affirmative]: "Khẳng định",
  [GrammarFormType.Negative]: "Phủ định",
  [GrammarFormType.Question]: "Nghi vấn",
};

export function GrammarReferenceCard({
  grammarNote,
}: GrammarReferenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!grammarNote) return null;

  // Chỉ lấy đúng những formType thực sự có structure (thường chỉ 1, vì
  // giờ mỗi Lesson = 1 dạng Grammar riêng), không còn hardcode 3 cột cố định
  const presentFormTypes = Array.from(
    new Set(grammarNote.structures.map((item) => item.formType)),
  );

  const subtitleText =
    presentFormTypes.length > 0
      ? `Xem cấu trúc: ${presentFormTypes
          .map((type) => FORM_TYPE_LABELS[type])
          .join(" · ")}`
      : "Chưa có cấu trúc";

  return (
    <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white text-lg text-indigo-600">
            📘
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Grammar reference
            </p>
            <p className="mt-1 text-sm font-bold text-indigo-700">
              {grammarNote.title}
            </p>
            <p className="text-xs text-slate-500">{subtitleText}</p>
          </div>
        </div>

        <span className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
          {isExpanded ? "Thu gọn" : "Xem"}
        </span>
      </button>

      {isExpanded && (
        <div
          className={`mt-4 grid gap-3 ${
            presentFormTypes.length > 1 ? "md:grid-cols-3" : "md:grid-cols-1"
          }`}
        >
          {presentFormTypes.map((formType) => {
            const items = grammarNote.structures
              .filter((item) => item.formType === formType)
              .sort((left, right) => left.orderIndex - right.orderIndex);

            return (
              <div
                key={formType}
                className="rounded-2xl border border-indigo-200 bg-white p-3 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  {FORM_TYPE_LABELS[formType]}
                </p>

                <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id ?? `${formType}-${item.orderIndex}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {item.formula}
                      </p>
                      <p className="mt-1 text-xs italic text-slate-600">
                        “{item.example}”
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
