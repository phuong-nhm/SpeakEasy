"use client";

import { useState } from "react";

import { GrammarFormType, GrammarNoteDto } from "../types/lesson";

interface GrammarReferenceCardProps {
  grammarNote: GrammarNoteDto | null;
}

export function GrammarReferenceCard({
  grammarNote,
}: GrammarReferenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!grammarNote) return null;

  const formGroups = [
    {
      label: "Khẳng định",
      type: GrammarFormType.Affirmative,
    },
    {
      label: "Phủ định",
      type: GrammarFormType.Negative,
    },
    {
      label: "Nghi vấn",
      type: GrammarFormType.Question,
    },
  ];

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
            <p className="text-xs text-slate-500">
              Xem cấu trúc: Khẳng định · Phủ định · Nghi vấn
            </p>
          </div>
        </div>

        <span className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-600">
          {isExpanded ? "Thu gọn" : "Xem"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {formGroups.map((group) => {
            const items = [...grammarNote.structures]
              .filter((item) => item.formType === group.type)
              .sort((left, right) => left.orderIndex - right.orderIndex);

            return (
              <div
                key={group.type}
                className="rounded-2xl border border-indigo-200 bg-white p-3 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  {group.label}
                </p>

                {items.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">
                    Chưa có cấu trúc.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id ?? `${group.type}-${item.orderIndex}`}
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
